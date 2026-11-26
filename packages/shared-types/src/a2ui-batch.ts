import { z } from 'zod';
import { A2UIMerceologicalSheetSchema } from './a2ui-merceology.js';

export const A2UIRgiPathStepSchema = z.object({
  rule: z.string(),
  note: z.string().optional(),
  items: z.array(z.string()).optional(),
  application: z.string(),
  conclusion: z.string().optional(),
});

export const A2UIRejectedAlternativeSchema = z.object({
  hsCode: z.string(),
  title: z.string().optional(),
  reason: z.string(),
  rule: z.string(),
});

export const A2UIClassificationFlagSchema = z.object({
  type: z.enum(['warn', 'info']),
  title: z.string(),
  text: z.string(),
});

export const HitlClarifyingQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  fieldKey: z.string(),
  inputType: z.enum(['select', 'text', 'number']),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  unit: z.string().optional(),
  critical: z.boolean().optional(),
  answer: z.string().optional(),
});

export const BatchItemCandidateSchema = z.object({
  hsCode: z.string(),
  title: z.string(),
  adValoremPercent: z.number(),
  vatPercent: z.number().optional(),
  legalRegime: z.string(),
  confidenceLevel: z.enum(['Alto', 'Medio', 'Bajo']).optional(),
  confidencePct: z.number().optional(),
  whyApply: z.string(),
  whyNot: z.string(),
  recommended: z.boolean().optional(),
});

export const A2UIBatchItemSchema = z.object({
  lineNumber: z.number().int().positive(),
  skuOrRef: z.string().optional(),
  description: z.string(),
  sourceDoc: z.string(),
  quantityText: z.string(),
  fobValue: z.number(),
  currencyCode: z.string(),
  hsCode: z.string(),
  adValoremPercent: z.number(),
  vatPercent: z.number(),
  legalRegime: z.string(),
  status: z.enum(['classified', 'needs_review']),
  workflowItemState: z.enum(['classified', 'proposed_review']).optional(),
  notes: z.string().optional(),
  confidenceLevel: z.enum(['Alto', 'Medio', 'Bajo']).optional(),
  confidencePct: z.number().optional(),
  confidenceReason: z.string().optional(),
  merceologicalSheet: A2UIMerceologicalSheetSchema.optional(),
  candidates: z.array(BatchItemCandidateSchema).optional(),
  clarifyingQuestions: z.array(HitlClarifyingQuestionSchema).optional(),
  operatorAnswers: z.record(z.string(), z.string()).optional(),
  rgiPath: z.array(A2UIRgiPathStepSchema).optional(),
  rejectedAlternatives: z.array(A2UIRejectedAlternativeSchema).optional(),
  flags: z.array(A2UIClassificationFlagSchema).optional(),
});

export const A2UIBatchManifestComponentSchema = z.object({
  type: z.literal('batch_manifest'),
  id: z.string(),
  title: z.string(),
  documentReference: z.string().optional(),
  currencyCode: z.string(),
  items: z.array(A2UIBatchItemSchema),
});

export type A2UIRgiPathStep = z.infer<typeof A2UIRgiPathStepSchema>;
export type A2UIRejectedAlternative = z.infer<typeof A2UIRejectedAlternativeSchema>;
export type A2UIClassificationFlag = z.infer<typeof A2UIClassificationFlagSchema>;
export type HitlClarifyingQuestion = z.infer<typeof HitlClarifyingQuestionSchema>;
export type BatchItemCandidate = z.infer<typeof BatchItemCandidateSchema>;
export type A2UIBatchItem = z.infer<typeof A2UIBatchItemSchema>;
export type A2UIBatchManifestComponent = z.infer<typeof A2UIBatchManifestComponentSchema>;
