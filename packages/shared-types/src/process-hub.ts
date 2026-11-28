import { z } from 'zod';

export const PROCESS_KINDS = [
  'quick_lookup',
  'single_ruling',
  'invoice_batch',
  'oga_escalation',
  'cif_simulation',
] as const;

export const ProcessKindSchema = z.enum(PROCESS_KINDS);
export type ProcessKind = z.infer<typeof ProcessKindSchema>;

export const OPERATIONAL_STATUSES = [
  'needs_input',
  'processing',
  'in_review',
  'approved',
  'archived',
] as const;

export const OperationalStatusSchema = z.enum(OPERATIONAL_STATUSES);
export type OperationalStatus = z.infer<typeof OperationalStatusSchema>;

export const THREAD_RETENTION_POLICIES = ['ephemeral_48h', 'track_until_approved'] as const;
export type ThreadRetentionPolicy = (typeof THREAD_RETENTION_POLICIES)[number];

export const THREAD_URGENCIES = [
  'routine',
  'needs_client_info',
  'compliance_sensitive',
] as const;
export type ThreadUrgency = (typeof THREAD_URGENCIES)[number];

export const ProcessItemProgressSchema = z.object({
  total: z.number().int().min(0),
  completed: z.number().int().min(0),
  needsInfo: z.number().int().min(0),
});
export type ProcessItemProgress = z.infer<typeof ProcessItemProgressSchema>;

export const ThreadTriageDecisionSchema = z.object({
  processKind: ProcessKindSchema,
  operationalStatus: OperationalStatusSchema,
  urgency: z.enum(THREAD_URGENCIES),
  retentionPolicy: z.enum(THREAD_RETENTION_POLICIES),
  confidence: z.number().min(0).max(1),
  source: z.enum(['deterministic', 'system_one', 'fallback']),
});
export type ThreadTriageDecision = z.infer<typeof ThreadTriageDecisionSchema>;

export const ProcessScopeFilterSchema = z.enum(['mine', 'assigned', 'agency']);
export type ProcessScopeFilter = z.infer<typeof ProcessScopeFilterSchema>;
