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

const RGI_SYSTEM_PROMPT = `You are an expert customs tariff classifier applying strict General Rules of Interpretation (RGI 1 through 6) in order.
Rules:
1. Never invent tariff codes or legal notes; choose ONLY from the verified candidates and legal notes provided when available.
2. Apply RGI 1 (heading terms & section/chapter notes) first. Use RGI 3 only when RGI 1+2 cannot resolve. Always finish at 10-digit national subheading via RGI 6.
3. Explicitly list plausible alternatives and rejected headings with the exact rule/note that excludes them.
4. Set confidenceLevel: "Alto" (>=85), "Medio" (60-84), or "Bajo" (<60). If critical specs are missing, mark them in unresolved.
5. Respond ONLY with a valid JSON object (no markdown prose outside JSON) matching this exact shape:
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

    const result = await provider.generateJson(
      `${RGI_SYSTEM_PROMPT}\n\nInput:\n${JSON.stringify({
        item: input.item,
        webContext: input.webContext ?? null,
        candidates: input.candidates,
        legalNotes: input.notes,
        deepMode: input.deepMode,
      })}`,
      RgiResponseSchema,
      { model: modelId, temperature: 0, timeoutMs: RGI_TIMEOUT_MS },
    );

    return {
      ...result,
      modelUsed: modelId,
    };
  };
}

/**
 * Hexagonal adapter for Tier 2 RGI 1->6 reasoning via @tariffos/ai-client.
 */
export const runRgiWithLlm = createRgiLlmRunner();
