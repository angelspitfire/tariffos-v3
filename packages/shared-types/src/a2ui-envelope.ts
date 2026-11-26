import { z } from 'zod';
import { A2UIInlineComponentSchema } from './a2ui-inline.js';
import {
  A2UIMerceologicalSheetSchema,
  GroundingSourceSchema,
} from './a2ui-merceology.js';
import { HitlClarifyingQuestionSchema } from './a2ui-batch.js';
import {
  A2UICanvasComponentSchema,
  ApprovalWorkflowModeSchema,
  DossierReviewStatusSchema,
  IncotermCodeSchema,
} from './a2ui-canvas.js';

export const ClassificationWorkflowStateSchema = z.enum([
  'pending',
  'needs_input',
  'proposed_review',
  'classified',
  'failed',
]);

export const HitlTentativeProposalSchema = z.object({
  hsCode: z.string(),
  title: z.string(),
  confidencePct: z.number(),
  reason: z.string().optional(),
});

export const ClassificationDecisionContractSchema = z.object({
  mode: z.enum(['individual', 'batch']),
  outcome: ClassificationWorkflowStateSchema,
  confidencePct: z.number(),
  reason: z.string(),
  missingCriticalFields: z.array(z.string()),
  clarifyingQuestions: z.array(HitlClarifyingQuestionSchema),
  tentativeProposal: HitlTentativeProposalSchema.optional(),
  autoClassifiedCount: z.number().int().nonnegative().optional(),
  proposedReviewCount: z.number().int().nonnegative().optional(),
});

export const A2UIEnvelopeSchema = z.object({
  assistantMessage: z.string(),
  extractedText: z.string().optional(),
  classificationStatus: z.enum(['classified', 'needs_disambiguation', 'needs_details']),
  workflowState: ClassificationWorkflowStateSchema.optional(),
  decision: ClassificationDecisionContractSchema.optional(),
  taskId: z.string().optional(),
  inlineComponents: z.array(A2UIInlineComponentSchema),
  canvasComponents: z.array(A2UICanvasComponentSchema),
  merceologicalSheet: A2UIMerceologicalSheetSchema.optional(),
  webSources: z.array(GroundingSourceSchema).optional(),
  enrichedSpecSummary: z.string().optional(),
  reasoningDepth: z.enum(['standard', 'deep']).optional(),
});

export const StreamProgressStageSchema = z.enum([
  'pre_gate',
  'sku_lookup',
  'hybrid_retrieval',
  'rgi_reasoning',
  'verifying_tariff',
  'complete',
  'error',
]);

export const StreamProgressEventSchema = z.object({
  stage: StreamProgressStageSchema,
  label: z.string(),
  progressPct: z.number().min(0).max(100),
  detail: z.string().optional(),
});

export const JurisdictionConfigSchema = z.object({
  id: z.string(),
  countryCode: z.string().length(2),
  country: z.string(),
  authority: z.string(),
  nomenclature: z.string(),
  codeDigits: z.string(),
  pilot: z.boolean().optional(),
  defaultVatPercent: z.number(),
  customsFeePercent: z.number(),
  currencyCode: z.string(),
  localCurrencyCode: z.string(),
  defaultExchangeRate: z.number(),
  legalRegimeNotes: z.string(),
});

export const UserProfileSettingsSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  role: z.string(),
  companyName: z.string(),
  brokerLicense: z.string(),
  brokerSignatureDataUrl: z.string().optional(),
  themePreference: z.enum(['light', 'dark', 'system']).default('light'),
  defaultJurisdictionId: z.string().default('ve-seniat'),
  defaultIncoterm: IncotermCodeSchema.default('FOB'),
  preferredCurrency: z.enum(['USD', 'EUR']).default('USD'),
  detailLevel: z.enum(['concise', 'standard', 'exhaustive']).default('standard'),
  approvalWorkflowMode: ApprovalWorkflowModeSchema.default('agent_decides'),
  autoOpenCanvas: z.boolean().default(true),
  predictiveSearchEnabled: z.boolean().optional(),
  webEnrichmentEnabled: z.boolean().optional(),
  updatedAt: z.string(),
});

export const SkuPrecedentSchema = z.object({
  id: z.string(),
  sku: z.string(),
  normalizedSku: z.string(),
  title: z.string(),
  description: z.string(),
  hsCode: z.string(),
  jurisdictionId: z.string(),
  adValoremPercent: z.number(),
  vatPercent: z.number(),
  legalRegime: z.string(),
  originCountry: z.string().optional(),
  incoterm: IncotermCodeSchema.optional(),
  notes: z.string().optional(),
  approvedBy: z.string().optional(),
  reviewStatus: DossierReviewStatusSchema,
  usageCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ClassificationWorkflowState = z.infer<typeof ClassificationWorkflowStateSchema>;
export type HitlTentativeProposal = z.infer<typeof HitlTentativeProposalSchema>;
export type ClassificationDecisionContract = z.infer<typeof ClassificationDecisionContractSchema>;
export type A2UIEnvelope = z.infer<typeof A2UIEnvelopeSchema>;
export type ClassificationEnvelope = A2UIEnvelope;
export type StreamProgressStage = z.infer<typeof StreamProgressStageSchema>;
export type StreamProgressEvent = z.infer<typeof StreamProgressEventSchema>;
export type JurisdictionConfig = z.infer<typeof JurisdictionConfigSchema>;
export type UserProfileSettings = z.infer<typeof UserProfileSettingsSchema>;
export type SkuPrecedent = z.infer<typeof SkuPrecedentSchema>;
