import { getLlmProvider, type Attachment, type LlmProvider } from '@tariffos/ai-client';
import { rgiModel } from '@tariffos/env';
import { z } from 'zod';
import {
  ClassificationAlternativeSchema,
  ComplianceFlagSchema,
  RejectedAlternativeSchema,
  RgiStepSchema,
  UnresolvedItemSchema,
} from '@tariffos/shared-types';
import type {
  InvoiceItemInput,
  LegalNoteRecord,
  RgiModelOutput,
  TariffCandidateRecord,
} from '../lib/pipeline/types.js';

const defaultEmptyArray = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.array(itemSchema).nullish().transform((val) => val ?? []);

export const RgiResponseSchema = z.object({
  hsCode: z.string(),
  confidenceLevel: z.enum(['Alto', 'Medio', 'Bajo']),
  confidencePct: z.number().min(0).max(100),
  confidenceReason: z.string(),
  rgiSteps: z.array(RgiStepSchema),
  alternatives: defaultEmptyArray(ClassificationAlternativeSchema),
  rejected: defaultEmptyArray(RejectedAlternativeSchema),
  flags: defaultEmptyArray(ComplianceFlagSchema),
  unresolved: defaultEmptyArray(UnresolvedItemSchema),
});

const RGI_TIMEOUT_MS = 90_000;
const MAX_INLINE_IMAGES = 2;
const IMAGE_DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|jpg|webp));base64,[A-Za-z0-9+/=]+$/i;
export const MAX_OUTPUT_TOKENS_STANDARD = 1_500;
export const MAX_OUTPUT_TOKENS_DEEP = 3_500;
export const MAX_CANDIDATES_FOR_LLM = 16;
export const MAX_NOTES_CHARS_STANDARD = 8_000;
export const MAX_NOTES_CHARS_DEEP = 16_000;

/** Extracts valid inline image attachments (`png`/`jpeg`/`webp` base64 data URLs) up to cap. */
export function toInlineImageAttachments(imageDataUrls?: string[]): Attachment[] {
  if (!imageDataUrls?.length) return [];
  const attachments: Attachment[] = [];
  for (const url of imageDataUrls) {
    const trimmed = url.trim();
    const match = IMAGE_DATA_URL_PATTERN.exec(trimmed);
    if (!match?.[1]) continue;
    attachments.push({
      type: 'inline',
      dataUrl: trimmed,
      mimeType: match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase(),
    });
    if (attachments.length >= MAX_INLINE_IMAGES) break;
  }
  return attachments;
}

/**
 * Deterministically caps legalNotes payload size to stay inside per-call input budgets,
 * prioritizing cross-cutting Section / RGI exclusionary notes ahead of chapter-specific notes.
 */
export function budgetLegalNotes(
  notes: LegalNoteRecord[],
  maxChars: number,
): LegalNoteRecord[] {
  const prioritized = [...notes].sort((a, b) => {
    const aIsSection = !a.chapter || /^secci[oó]n|^rgi/i.test(a.ref) ? 0 : 1;
    const bIsSection = !b.chapter || /^secci[oó]n|^rgi/i.test(b.ref) ? 0 : 1;
    return aIsSection - bIsSection;
  });
  const selected: LegalNoteRecord[] = [];
  let totalChars = 0;
  for (const note of prioritized) {
    const cost = note.ref.length + note.text.length;
    if (totalChars + cost > maxChars) continue;
    selected.push(note);
    totalChars += cost;
  }
  return selected;
}

function buildRgiSystemPrompt(countryCode = 'VE'): string {
  const jurisdictionContext =
    countryCode.toUpperCase() === 'VE'
      ? 'Venezuela 10-digit NCM national tariff (SA 6 digits + NCM 2 digits + National 2 digits under Decreto 4.944 and active reforms)'
      : `destination jurisdiction ${countryCode.toUpperCase()} national tariff schedule grounded on WCO Harmonized System (SA) and regional nomenclature`;

  return `You are a senior international customs brokerage partner specializing in tariff classification for ${jurisdictionContext}, applying strict WCO General Rules of Interpretation (RGI 1 through 6) in order.
Rules:
1. Never invent tariff codes or legal notes; choose ONLY from the verified candidates and legal notes provided when available. If an official note is missing, record "Unknown — requerido del arancel oficial" in unresolved.
2. Apply RGI 1 (heading terms & section/chapter notes, especially exclusionary notes such as Section XVI Note 1(g) and Note 2 for parts of general use) first. Use RGI 3(b)/3(c) for retail sets/assortments when RGI 1+2 cannot resolve. Always finish at the national subheading via RGI 6, citing the exact rule and legal note per step.
3. Explicitly list plausible alternatives (with whyApply and whyNot) AND rejected headings with the exact rule/note that excludes them.
4. Hard compliance limits:
   - Never conclude antidumping or safeguard scope as final; emit a "warn" flag ("Salvaguardias / AD") and add the check to unresolved.
   - Never conclude origin or trade-agreement preference as final; emit a "warn" or "info" flag ("Origen / Tratados") for separate origin analysis.
   - Emit an "info" or "warn" flag ("OGA / Régimen Legal") noting applicable permits, technical standards, or conditional exemptions.
5. Anti-hallucination posture: if critical merceological attributes (material, chemical composition, operating principle, power rating) that separate sibling subheadings are missing, DO NOT claim "Alto" confidence (>=85); assign "Medio" (60-84) or "Bajo" (<60) and list the exact technical questions to ask the supplier in unresolved.
6. Write all human-facing prose fields (confidenceReason, rgiSteps, alternatives, rejected, flags, unresolved) in clear, broker-grade Spanish.
7. Respond ONLY with a valid JSON object (no markdown prose outside JSON) matching this exact shape (always include every key, using [] when an array has no entries):
{
  "hsCode": "xxxx.xx.xx.xx",
  "confidenceLevel": "Alto" | "Medio" | "Bajo",
  "confidencePct": 0..100,
  "confidenceReason": "concise reason in Spanish",
  "rgiSteps": [{ "rule": "RGI 1", "note": "legal note ref", "items": ["fact"], "conclusion": "heading/subheading" }],
  "alternatives": [{ "code": "xxxx.xx.xx.xx", "desc": "text", "confLevel": "alto"|"medio"|"bajo", "confPct": 0..100, "whyApply": "text", "whyNot": "text" }],
  "rejected": [{ "code": "xxxx.xx.xx.xx", "reason": "text", "rule": "RGI/Note" }],
  "flags": [{ "type": "warn"|"info"|"blocking", "title": "text", "text": "text" }],
  "unresolved": [{ "item": "text", "source": "text", "resolved": false }]
}`;
}

export interface RgiLlmRuntimeOverride {
  provider: LlmProvider;
  model: string;
  deepModel?: string;
  baseUrl?: string;
}

export interface RgiLlmInput {
  item: InvoiceItemInput;
  candidates: TariffCandidateRecord[];
  notes: LegalNoteRecord[];
  webContext?: string;
  deepMode: boolean;
  countryCode?: string;
}

/**
 * Factory for Tier 2 RGI 1->6 reasoning runner with an optional runtime LLM override.
 */
export function createRgiLlmRunner(runtimeLlm?: RgiLlmRuntimeOverride) {
  return async function runRgi(input: RgiLlmInput): Promise<RgiModelOutput> {
    const provider = getLlmProvider(
      runtimeLlm ? { provider: runtimeLlm.provider, baseUrl: runtimeLlm.baseUrl } : undefined,
    );
    const modelId = runtimeLlm
      ? input.deepMode
        ? (runtimeLlm.deepModel ?? runtimeLlm.model)
        : runtimeLlm.model
      : rgiModel(input.deepMode);

    const maxOutputTokens = input.deepMode ? MAX_OUTPUT_TOKENS_DEEP : MAX_OUTPUT_TOKENS_STANDARD;
    const maxNotesChars = input.deepMode ? MAX_NOTES_CHARS_DEEP : MAX_NOTES_CHARS_STANDARD;
    const budgetedCandidates = input.candidates.slice(0, MAX_CANDIDATES_FOR_LLM);
    const budgetedNotes = budgetLegalNotes(input.notes, maxNotesChars);
    const attachments = toInlineImageAttachments(input.item.imageDataUrls);
    const { imageDataUrls: _ignoredImages, ...itemForPrompt } = input.item;
    let capturedUsage: { inputTokens: number; outputTokens: number } | undefined;

    const result = await provider.generateJson(
      `${buildRgiSystemPrompt(input.countryCode)}\n\nInput:\n${JSON.stringify({
        countryCode: input.countryCode ?? 'VE',
        item: itemForPrompt,
        attachedImagesCount: attachments.length,
        webContext: input.webContext ?? null,
        candidates: budgetedCandidates,
        legalNotes: budgetedNotes,
        deepMode: input.deepMode,
      })}`,
      RgiResponseSchema,
      {
        model: modelId,
        temperature: 0,
        timeoutMs: RGI_TIMEOUT_MS,
        maxOutputTokens,
        ...(attachments.length > 0 ? { attachments } : {}),
        onUsage: (usage) => {
          capturedUsage = usage;
        },
      },
    );

    return {
      ...result,
      modelUsed: modelId,
      ...(capturedUsage ? { tokenUsage: capturedUsage } : {}),
    };
  };
}

/**
 * Hexagonal adapter for Tier 2 RGI 1->6 reasoning via @tariffos/ai-client.
 */
export const runRgiWithLlm = createRgiLlmRunner();
