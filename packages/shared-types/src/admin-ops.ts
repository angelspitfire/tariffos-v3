import { z } from 'zod';
import { TenantBillingStatusSchema, type TenantBillingStatus } from './admin.js';
import { ManualPaymentMethodSchema, SubscriptionBillingCycleSchema } from './billing.js';

export const AdminOnboardTenantInputSchema = z.object({
  companyName: z.string().trim().min(2),
  taxId: z.string().trim().max(40).optional(),
  countryCode: z.string().trim().length(2).default('VE'),
  ownerName: z.string().trim().min(2),
  ownerEmail: z.string().trim().email(),
  planId: z.string().trim().min(1),
  billingStatus: z.enum(['TRIALING', 'ACTIVE']).default('TRIALING'),
  billingLimit: z.number().int().positive().optional(),
  allowOverage: z.boolean().optional(),
  sendInviteEmail: z.boolean().default(true),
  leadId: z.string().trim().optional(),
});
export type AdminOnboardTenantInput = z.infer<typeof AdminOnboardTenantInputSchema>;

export const AdminTenantPatchSchema = z.object({
  planId: z.string().trim().min(1).optional(),
  billingLimit: z.number().int().positive().optional(),
  billingStatus: TenantBillingStatusSchema.optional(),
  allowOverage: z.boolean().optional(),
  countryCode: z.string().trim().length(2).optional(),
  reason: z.string().trim().min(3),
});
export type AdminTenantPatch = z.infer<typeof AdminTenantPatchSchema>;

export const DeactivateTenantInputSchema = z.object({
  reason: z.string().trim().min(3),
  revokePendingInvites: z.boolean().default(true),
  banSoleMembers: z.boolean().default(false),
});
export type DeactivateTenantInput = z.infer<typeof DeactivateTenantInputSchema>;

export const OffboardUserInputSchema = z.object({
  reason: z.string().trim().min(3),
  banAuthAccount: z.boolean().default(false),
});
export type OffboardUserInput = z.infer<typeof OffboardUserInputSchema>;

export const AdminRecordManualPaymentInputSchema = z.object({
  tenantId: z.string().trim().min(1),
  planId: z.string().trim().min(1),
  billingCycle: SubscriptionBillingCycleSchema.default('monthly'),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'VES']).default('USD'),
  method: ManualPaymentMethodSchema,
  referenceCode: z.string().trim().min(2),
  notes: z.string().trim().optional(),
  autoApprove: z.boolean().default(true),
});
export type AdminRecordManualPaymentInput = z.infer<typeof AdminRecordManualPaymentInputSchema>;

export const AdminVerifyPaymentInputSchema = z.object({
  paymentId: z.string().trim().min(1),
  action: z.enum(['verify', 'reject']),
  rejectionReason: z.string().trim().optional(),
});
export type AdminVerifyPaymentInput = z.infer<typeof AdminVerifyPaymentInputSchema>;

export interface AdminTenantSummary {
  id: string;
  name: string;
  taxId: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  countryCode: string;
  planId: string | null;
  planName: string;
  billingStatus: TenantBillingStatus;
  billingLimit: number;
  allowOverage: boolean;
  memberCount: number;
  usedThisMonth: number;
  inputTokensThisMonth: number;
  outputTokensThisMonth: number;
  createdAt: string;
}

export interface AdminUsageRow {
  tenantId: string;
  tenantName: string;
  ownerEmail: string | null;
  planName: string;
  billingStatus: TenantBillingStatus;
  used: number;
  limit: number;
  percentUsed: number;
  nearLimit: boolean;
  inputTokens: number;
  outputTokens: number;
  avgTokensPerClassification?: number;
  estimatedCostUsd?: number;
  activeBatchJobs: number;
  failedBatchJobs: number;
}

export interface AdminAuditLogItem {
  id: string;
  actorUserId: string;
  actorEmail: string | null;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  tenantId: string | null;
  reason: string | null;
  beforeState: unknown;
  afterState: unknown;
  createdAt: string;
}

export interface ClientCurrentUsageSnapshot {
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  billingStatus: TenantBillingStatus;
  allowOverage: boolean;
  oneTimeOnly?: boolean;
  allowBatch?: boolean;
  month: number;
  year: number;
  used: number;
  limit: number;
  percentUsed: number;
  inputTokens: number;
  outputTokens: number;
}
