import { z } from 'zod';
import type { ApprovalWorkflowMode } from './a2ui-canvas.js';

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

export const AGENCY_ROLES = ['OWNER', 'REVIEWER', 'ANALYST'] as const;
export const AgencyRoleSchema = z.enum(AGENCY_ROLES);
export type AgencyRole = z.infer<typeof AgencyRoleSchema>;

/** Normalizes legacy or freeform membership role labels into the 3 operational roles. */
export function normalizeAgencyRole(raw: string | null | undefined): AgencyRole {
  const clean = (raw ?? '').trim().toUpperCase();
  if (clean === 'OWNER' || clean === 'ADMIN' || clean === 'SUPER_ADMIN') return 'OWNER';
  if (clean === 'REVIEWER' || clean === 'BROKER') return 'REVIEWER';
  return 'ANALYST';
}

export function canSealDossier(role: AgencyRole, workflowMode: ApprovalWorkflowMode): boolean {
  if (role === 'OWNER' || role === 'REVIEWER') return true;
  return workflowMode !== 'always_review';
}

export function canManageAgencyTeam(role: AgencyRole): boolean {
  return role === 'OWNER';
}

export const ProcessActivityActionSchema = z.enum([
  'created',
  'review_requested',
  'assigned',
  'approved',
  'archived',
]);
export type ProcessActivityAction = z.infer<typeof ProcessActivityActionSchema>;

export const ProcessActivityEventSchema = z.object({
  id: z.string(),
  action: ProcessActivityActionSchema,
  actorName: z.string(),
  actorUserId: z.string().optional(),
  targetName: z.string().optional(),
  note: z.string().optional(),
  createdAt: z.string(),
});
export type ProcessActivityEvent = z.infer<typeof ProcessActivityEventSchema>;

export const AgencyMemberSummarySchema = z.object({
  userId: z.string(),
  email: z.string().nullable(),
  fullName: z.string(),
  role: AgencyRoleSchema,
  position: z.string().nullable().optional(),
});
export type AgencyMemberSummary = z.infer<typeof AgencyMemberSummarySchema>;

export const AgencyInvitationSummarySchema = z.object({
  id: z.string(),
  email: z.string(),
  role: AgencyRoleSchema,
  status: z.enum(['PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED']),
  invitedByName: z.string().nullable().optional(),
  expiresAt: z.string(),
});
export type AgencyInvitationSummary = z.infer<typeof AgencyInvitationSummarySchema>;
