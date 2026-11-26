import { z } from 'zod';
import { A2UIMerceologicalSheetSchema } from './a2ui-merceology.js';

export const VerdictExecutivePointSchema = z.object({
  title: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  risk: z.string(),
  recommendation: z.string(),
});

export const PreferredCanvasTabSchema = z.enum([
  'hierarchy',
  'calculator',
  'comparison',
  'dossier',
  'batch_manifest',
  'rgi_comparator',
  'regulatory_diff',
]);

export const A2UIVerdictComponentSchema = z.object({
  type: z.literal('verdict'),
  id: z.string(),
  hsCode: z.string(),
  description: z.string(),
  adValoremPercent: z.number(),
  vatPercent: z.number(),
  customsFeePercent: z.number(),
  legalRegimeCode: z.string(),
  legalRegimeSummary: z.string(),
  confidenceLabel: z.string(),
  rgiApplied: z.array(z.string()),
  preferredCanvasTab: PreferredCanvasTabSchema.optional(),
  executiveSummary: z.array(VerdictExecutivePointSchema).optional(),
});

export const A2UIDisambiguationOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  technicalDetail: z.string(),
  suggestedHsHint: z.string().optional(),
});

export const A2UIDisambiguationComponentSchema = z.object({
  type: z.literal('disambiguation'),
  id: z.string(),
  question: z.string(),
  contextHint: z.string().optional(),
  options: z.array(A2UIDisambiguationOptionSchema),
});

export const A2UIQuestionnaireFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  fieldType: z.enum(['select', 'text', 'number']),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  unit: z.string().optional(),
});

export const A2UIQuestionnaireComponentSchema = z.object({
  type: z.literal('questionnaire'),
  id: z.string(),
  title: z.string(),
  fields: z.array(A2UIQuestionnaireFieldSchema),
});

export const A2UIPermitItemSchema = z.object({
  code: z.string(),
  name: z.string(),
  organism: z.string(),
  mandatory: z.boolean(),
});

export const A2UILegalNoticeComponentSchema = z.object({
  type: z.literal('legal_notice'),
  id: z.string(),
  severity: z.enum(['info', 'warning', 'restricted']),
  authority: z.string(),
  title: z.string(),
  summary: z.string(),
  requiredPermits: z.array(A2UIPermitItemSchema),
});

export const A2UIDocumentSummaryComponentSchema = z.object({
  type: z.literal('document_summary'),
  id: z.string(),
  docTypesDetected: z.array(z.string()),
  documentReference: z.string(),
  shipper: z.string().optional(),
  consignee: z.string().optional(),
  routeOrIncoterm: z.string().optional(),
  totalPackages: z.string().optional(),
  grossWeight: z.string().optional(),
  totalDeclaredValue: z.string().optional(),
  itemsCount: z.number().int().nonnegative(),
  isBatch: z.boolean(),
});

export const A2UIMerceologicalSheetComponentSchema = z.object({
  type: z.literal('merceological_sheet'),
  id: z.string(),
  mode: z.enum(['hitl_validation', 'confirmed_summary']),
  title: z.string(),
  subtitle: z.string().optional(),
  sheet: A2UIMerceologicalSheetSchema,
  allowWebEnrich: z.boolean().optional(),
});

export const A2UIInlineComponentSchema = z.discriminatedUnion('type', [
  A2UIVerdictComponentSchema,
  A2UIDisambiguationComponentSchema,
  A2UIQuestionnaireComponentSchema,
  A2UILegalNoticeComponentSchema,
  A2UIDocumentSummaryComponentSchema,
  A2UIMerceologicalSheetComponentSchema,
]);

export type VerdictExecutivePoint = z.infer<typeof VerdictExecutivePointSchema>;
export type A2UIVerdictComponent = z.infer<typeof A2UIVerdictComponentSchema>;
export type A2UIDisambiguationOption = z.infer<typeof A2UIDisambiguationOptionSchema>;
export type A2UIDisambiguationComponent = z.infer<typeof A2UIDisambiguationComponentSchema>;
export type A2UIQuestionnaireField = z.infer<typeof A2UIQuestionnaireFieldSchema>;
export type A2UIQuestionnaireComponent = z.infer<typeof A2UIQuestionnaireComponentSchema>;
export type A2UIPermitItem = z.infer<typeof A2UIPermitItemSchema>;
export type A2UILegalNoticeComponent = z.infer<typeof A2UILegalNoticeComponentSchema>;
export type A2UIDocumentSummaryComponent = z.infer<typeof A2UIDocumentSummaryComponentSchema>;
export type A2UIMerceologicalSheetComponent = z.infer<
  typeof A2UIMerceologicalSheetComponentSchema
>;
export type A2UIInlineComponent = z.infer<typeof A2UIInlineComponentSchema>;
