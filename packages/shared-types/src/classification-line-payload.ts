import { z } from 'zod';

export const RgiStepSchema = z.object({
  rule: z.string(),
  note: z.string(),
  items: z.array(z.string()),
  conclusion: z.string(),
});

export const ClassificationAlternativeSchema = z.object({
  code: z.string(),
  desc: z.string(),
  confLevel: z.enum(['alto', 'medio', 'bajo']),
  confPct: z.number().min(0).max(100),
  whyApply: z.string(),
  whyNot: z.string(),
});

export const RejectedAlternativeSchema = z.object({
  code: z.string(),
  reason: z.string(),
  rule: z.string(),
});

export const ComplianceFlagSchema = z.object({
  type: z.enum(['warn', 'info', 'blocking']),
  title: z.string(),
  text: z.string(),
});

export const UnresolvedItemSchema = z.object({
  item: z.string(),
  source: z.string(),
  resolved: z.boolean(),
});

export const ActiveExemptionSchema = z.object({
  programCode: z.string(),
  title: z.string(),
  decreeRef: z.string(),
  gazetteRef: z.string().optional(),
  exemptAdValoremPct: z.number().nonnegative().optional(),
  exemptVatPct: z.number().nonnegative().optional(),
  requiredPermitCode: z.string().optional(),
  conditionsSummary: z.string().optional(),
  validToDate: z.string().optional(),
  expiringSoon: z.boolean().optional(),
});

export const AuditArtifactMetaSchema = z.object({
  artifactId: z.string().optional(),
  version: z.number().int().positive().optional(),
  datasetVersion: z.string().optional(),
  sourceSha256: z.string().optional(),
});

export const DeterministicDutiesSchema = z.object({
  cif: z.number().nonnegative(),
  adValoremRate: z.number().nonnegative(),
  baseAdValoremRate: z.number().nonnegative().optional(),
  tariffExceptionCode: z.string().optional(),
  arancelAmount: z.number().nonnegative(),
  ivaRate: z.number().nonnegative(),
  ivaAmount: z.number().nonnegative(),
  unit: z.string(),
  customsFeeRate: z.number().nonnegative().optional(),
  customsFeeAmount: z.number().nonnegative().optional(),
  totalTaxes: z.number().nonnegative().optional(),
  landedCost: z.number().nonnegative().optional(),
  isBK: z.boolean().optional(),
  isBIT: z.boolean().optional(),
  activeExemption: ActiveExemptionSchema.optional(),
});

export const ClassificationLinePayloadSchema = z.object({
  lineId: z.string(),
  product: z.string(),
  hsCode: z.string(),
  officialDescription: z.string(),
  originCountry: z.string(),
  confidenceLevel: z.enum(['Alto', 'Medio', 'Bajo']),
  confidencePct: z.number().min(0).max(100),
  confidenceReason: z.string(),
  rgiSteps: z.array(RgiStepSchema),
  alternatives: z.array(ClassificationAlternativeSchema),
  rejected: z.array(RejectedAlternativeSchema),
  flags: z.array(ComplianceFlagSchema),
  unresolved: z.array(UnresolvedItemSchema),
  duties: DeterministicDutiesSchema,
  tierUsed: z.enum(['pre_gate_blocked', 'tier0_sku', 'tier1_fast', 'tier2_rgi']),
  verifiedAgainstDb: z.boolean(),
  modelUsed: z.string(),
  auditMeta: AuditArtifactMetaSchema.optional(),
  tokenUsage: z
    .object({
      inputTokens: z.number().int().nonnegative(),
      outputTokens: z.number().int().nonnegative(),
    })
    .optional(),
});

export type ActiveExemption = z.infer<typeof ActiveExemptionSchema>;
export type AuditArtifactMeta = z.infer<typeof AuditArtifactMetaSchema>;

export type RgiStep = z.infer<typeof RgiStepSchema>;
export type ClassificationAlternative = z.infer<typeof ClassificationAlternativeSchema>;
export type RejectedAlternative = z.infer<typeof RejectedAlternativeSchema>;
export type ComplianceFlag = z.infer<typeof ComplianceFlagSchema>;
export type UnresolvedItem = z.infer<typeof UnresolvedItemSchema>;
export type DeterministicDuties = z.infer<typeof DeterministicDutiesSchema>;
export type ClassificationLinePayload = z.infer<typeof ClassificationLinePayloadSchema>;
