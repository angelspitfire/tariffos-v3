import { getLlmProvider, type LlmProvider } from '@tariffos/ai-client';
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

const RgiResponseSchema = z.object({
  hsCode: z.string(),
  confidenceLevel: z.enum(['Alto', 'Medio', 'Bajo']),
  confidencePct: z.number().min(0).max(100),
  confidenceReason: z.string(),
  rgiSteps: z.array(RgiStepSchema),
  alternatives: z.array(ClassificationAlternativeSchema),
  rejected: z.array(RejectedAlternativeSchema),
  flags: z.array(ComplianceFlagSchema),
  unresolved: z.array(UnresolvedItemSchema),
});

const RGI_TIMEOUT_MS = 90_000;
export const MAX_OUTPUT_TOKENS_STANDARD = 1_500;
export const MAX_OUTPUT_TOKENS_DEEP = 3_500;
export const MAX_CANDIDATES_FOR_LLM = 16;
export const MAX_NOTES_CHARS_STANDARD = 8_000;
export const MAX_NOTES_CHARS_DEEP = 16_000;

/** Deterministically caps legalNotes payload size to stay inside per-call input budgets. */
export function budgetLegalNotes(
  notes: LegalNoteRecord[],
  maxChars: number,
): LegalNoteRecord[] {
  const selected: LegalNoteRecord[] = [];
  let totalChars = 0;
  for (const note of notes) {
    const cost = note.ref.length + note.text.length;
    if (totalChars + cost > maxChars) break;
    selected.push(note);
    totalChars += cost;
  }
  return selected;
}

const RGI_SYSTEM_PROMPT = `You are a senior Venezuelan customs brokerage partner specializing in 10-digit NCM tariff classification (SA 6 digits + NCM 2 digits + National 2 digits under Arancel de Aduanas de Venezuela, Decreto 4.944, Gaceta Oficial Extraordinaria N° 6.804), applying strict General Rules of Interpretation (RGI 1 through 6) in order.
Rules:
1. Never invent tariff codes or legal notes; choose ONLY from the verified candidates and legal notes provided when available. If an official note is missing, record "Unknown — requerido del arancel oficial" in unresolved.
2. Apply RGI 1 (heading terms & section/chapter notes) first. Use RGI 3 only when RGI 1+2 cannot resolve. Always finish at the 10-digit national subheading via RGI 6, citing the exact rule and legal note per step.
3. Explicitly list plausible alternatives (with whyApply and whyNot, including special regimes like Chapter 98 when relevant) AND rejected headings with the exact rule/note that excludes them.
4. Hard compliance limits:
   - Never conclude antidumping or safeguard scope as final; emit a "warn" flag ("Salvaguardias / AD") and add the check to unresolved.
   - Never conclude origin or trade-agreement preference as final; emit a "warn" or "info" flag ("Origen / Tratados") for separate origin analysis.
   - Emit an "info" or "warn" flag ("OGA / Régimen Legal") noting applicable permits, technical regulations (e.g., SENCAMER, CONATEL), or special regimes (CAU / Cap. 98).
5. Non-blocking posture: when secondary specs or shipment configuration details are missing (e.g., chassis mounting, split dispatch vs. functional unit under Section XVI Note 4), still classify with an honest confidenceLevel ("Alto" >=85, "Medio" 60-84, "Bajo" <60) and log each pending verification in unresolved.
6. Write all human-facing prose fields (confidenceReason, rgiSteps, alternatives, rejected, flags, unresolved) in clear, broker-grade Spanish.
7. Respond ONLY with a valid JSON object (no markdown prose outside JSON) matching this exact shape:
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
    let capturedUsage: { inputTokens: number; outputTokens: number } | undefined;

    const result = await provider.generateJson(
      `${RGI_SYSTEM_PROMPT}\n\nInput:\n${JSON.stringify({
        item: input.item,
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
