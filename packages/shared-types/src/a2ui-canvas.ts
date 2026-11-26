import { z } from 'zod';
import {
  A2UIMerceologicalSheetSchema,
  GroundingSourceSchema,
} from './a2ui-merceology.js';
import {
  A2UIBatchManifestComponentSchema,
  A2UIClassificationFlagSchema,
  A2UIRejectedAlternativeSchema,
  A2UIRgiPathStepSchema,
} from './a2ui-batch.js';

export const IncotermCodeSchema = z.enum(['EXW', 'FOB', 'CFR', 'CIF', 'DDP']);

export const DossierReviewStatusSchema = z.enum(['draft_ai', 'in_review', 'approved']);

export const ApprovalWorkflowModeSchema = z.enum([
  'agent_decides',
  'direct_seal',
  'always_review',
]);

export const AgentReviewTriggerSchema = z.object({
  invokedBySkill: z.string().optional(),
  reason: z.string().min(1),
  missingFields: z.array(z.string()).optional(),
});

export const DossierApprovalMetaSchema = z.object({
  status: DossierReviewStatusSchema,
  updatedAt: z.string(),
  approvedBy: z.string().optional(),
  brokerLicense: z.string().optional(),
  complianceNotes: z.string().optional(),
});

export const A2UIHierarchyNodeSchema = z.object({
  level: z.enum(['section', 'chapter', 'heading', 'subheading', 'national']),
  code: z.string(),
  title: z.string(),
  dutyRate: z.string().optional(),
  legalRegime: z.string().optional(),
  isCurrent: z.boolean().optional(),
  selectable: z.boolean().optional(),
});

export const A2UIHierarchyComponentSchema = z.object({
  type: z.literal('hierarchy'),
  id: z.string(),
  title: z.string(),
  selectedCode: z.string(),
  nodes: z.array(A2UIHierarchyNodeSchema),
});

export const A2UICalculatorComponentSchema = z.object({
  type: z.literal('calculator'),
  id: z.string(),
  title: z.string(),
  hsCode: z.string(),
  adValoremPercent: z.number(),
  vatPercent: z.number(),
  customsServiceFeePercent: z.number(),
  currencyCode: z.string(),
  localCurrencyCode: z.string(),
  suggestedExchangeRate: z.number(),
  exemptionAvailable: z.boolean(),
  exemptionNote: z.string().optional(),
  originCountry: z.string().optional(),
  incoterm: IncotermCodeSchema.optional(),
  tradeAgreement: z.string().optional(),
  preferentialDiscountPercent: z.number().optional(),
  antidumpingPercent: z.number().optional(),
});

export const A2UIComparisonCandidateSchema = z.object({
  hsCode: z.string(),
  title: z.string(),
  adValoremPercent: z.number(),
  vatPercent: z.number().optional(),
  legalRegime: z.string(),
  rgiRationale: z.string(),
  explanatoryNotes: z.array(z.string()).optional(),
  confidenceLabel: z.string().optional(),
  confidencePct: z.number().optional(),
  whyApply: z.string().optional(),
  whyNot: z.string().optional(),
  pros: z.string(),
  cons: z.string(),
  recommended: z.boolean(),
});

export const A2UIComparisonComponentSchema = z.object({
  type: z.literal('comparison'),
  id: z.string(),
  title: z.string(),
  candidates: z.array(A2UIComparisonCandidateSchema),
});

export const A2UIDossierComponentSchema = z.object({
  type: z.literal('dossier'),
  id: z.string(),
  title: z.string(),
  hsCode: z.string(),
  officialDescription: z.string(),
  jurisdictionName: z.string(),
  confidenceLevel: z.string().optional(),
  confidencePct: z.number().optional(),
  confidenceReason: z.string().optional(),
  rgiSteps: z.array(A2UIRgiPathStepSchema),
  legalNotes: z.array(z.string()),
  technicalSpecs: z.array(z.object({ key: z.string(), value: z.string() })),
  permits: z.array(z.object({ code: z.string(), name: z.string(), organism: z.string() })),
  rejectedAlternatives: z.array(A2UIRejectedAlternativeSchema).optional(),
  flags: z.array(A2UIClassificationFlagSchema).optional(),
  unresolved: z.array(z.string()).optional(),
  webSources: z.array(GroundingSourceSchema).optional(),
  merceologicalSheet: A2UIMerceologicalSheetSchema.optional(),
  reviewStatus: DossierReviewStatusSchema.optional(),
  agentReviewTrigger: AgentReviewTriggerSchema.optional(),
  approvalMeta: DossierApprovalMetaSchema.optional(),
  verifiedAgainstOfficial: z.boolean().optional(),
});

export const A2UICanvasComponentSchema = z.discriminatedUnion('type', [
  A2UIHierarchyComponentSchema,
  A2UICalculatorComponentSchema,
  A2UIComparisonComponentSchema,
  A2UIDossierComponentSchema,
  A2UIBatchManifestComponentSchema,
]);

export type IncotermCode = z.infer<typeof IncotermCodeSchema>;
export type DossierReviewStatus = z.infer<typeof DossierReviewStatusSchema>;
export type ApprovalWorkflowMode = z.infer<typeof ApprovalWorkflowModeSchema>;
export type AgentReviewTrigger = z.infer<typeof AgentReviewTriggerSchema>;
export type DossierApprovalMeta = z.infer<typeof DossierApprovalMetaSchema>;
export type A2UIHierarchyNode = z.infer<typeof A2UIHierarchyNodeSchema>;
export type A2UIHierarchyComponent = z.infer<typeof A2UIHierarchyComponentSchema>;
export type A2UICalculatorComponent = z.infer<typeof A2UICalculatorComponentSchema>;
export type A2UIComparisonCandidate = z.infer<typeof A2UIComparisonCandidateSchema>;
export type A2UIComparisonComponent = z.infer<typeof A2UIComparisonComponentSchema>;
export type A2UIDossierComponent = z.infer<typeof A2UIDossierComponentSchema>;
export type A2UICanvasComponent = z.infer<typeof A2UICanvasComponentSchema>;
export type CanvasTabType =
  | A2UICanvasComponent['type']
  | 'rgi_comparator'
  | 'regulatory_diff';
