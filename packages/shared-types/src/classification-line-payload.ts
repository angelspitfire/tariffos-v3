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

export const DeterministicDutiesSchema = z.object({
  cif: z.number().nonnegative(),
  adValoremRate: z.number().nonnegative(),
  arancelAmount: z.number().nonnegative(),
  ivaRate: z.number().nonnegative(),
  ivaAmount: z.number().nonnegative(),
  unit: z.string(),
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
});

export type RgiStep = z.infer<typeof RgiStepSchema>;
export type ClassificationAlternative = z.infer<typeof ClassificationAlternativeSchema>;
export type RejectedAlternative = z.infer<typeof RejectedAlternativeSchema>;
export type ComplianceFlag = z.infer<typeof ComplianceFlagSchema>;
export type UnresolvedItem = z.infer<typeof UnresolvedItemSchema>;
export type DeterministicDuties = z.infer<typeof DeterministicDutiesSchema>;
export type ClassificationLinePayload = z.infer<typeof ClassificationLinePayloadSchema>;
