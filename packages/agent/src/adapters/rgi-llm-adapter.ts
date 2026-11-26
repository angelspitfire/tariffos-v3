import { getLlmProvider } from '@tariffos/ai-client';
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

const RGI_SYSTEM_PROMPT = `You are an expert customs tariff classifier applying strict General Rules of Interpretation (RGI 1 through 6) in order.
Rules:
1. Never invent tariff codes or legal notes; choose ONLY from the verified candidates and legal notes provided.
2. Apply RGI 1 (heading terms & section/chapter notes) first. Use RGI 3 only when RGI 1+2 cannot resolve. Always finish at 10-digit national subheading via RGI 6.
3. Explicitly list plausible alternatives and rejected headings with the exact rule/note that excludes them.
4. Set confidenceLevel: Alto (>=85%), Medio (60-84%), Bajo (<60%). If critical specs are missing, mark them in unresolved.`;

/**
 * Hexagonal adapter for Tier 2 RGI 1->6 reasoning via @tariffos/ai-client.
 */
export async function runRgiWithLlm(input: {
  item: InvoiceItemInput;
  candidates: TariffCandidateRecord[];
  notes: LegalNoteRecord[];
  webContext?: string;
  deepMode: boolean;
}): Promise<RgiModelOutput> {
  const provider = getLlmProvider();
  const modelId = rgiModel(input.deepMode);

  const result = await provider.generateJson(
    `${RGI_SYSTEM_PROMPT}\n\nInput:\n${JSON.stringify({
      item: input.item,
      webContext: input.webContext ?? null,
      candidates: input.candidates,
      legalNotes: input.notes,
      deepMode: input.deepMode,
    })}`,
    RgiResponseSchema,
    { model: modelId },
  );

  return {
    ...result,
    modelUsed: modelId,
  };
}
