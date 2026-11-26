import { z } from 'zod';

export const PlatformRoleSchema = z.enum(['user', 'support', 'ops_billing', 'super_admin']);
export type PlatformRole = z.infer<typeof PlatformRoleSchema>;

export const AdminPermissionSchema = z.enum([
  'admin:read',
  'plans:manage',
  'leads:manage',
  'tenants:onboard',
  'tenants:manage',
  'tenants:deactivate',
  'billing:read',
  'billing:approve',
  'usage:read',
  'audit:read',
  'admins:manage',
  'settings:manage',
  'ai_quality:read',
]);
export type AdminPermission = z.infer<typeof AdminPermissionSchema>;

export const TenantBillingStatusSchema = z.enum(['ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING']);
export type TenantBillingStatus = z.infer<typeof TenantBillingStatusSchema>;

export const PlanFeaturesMetaSchema = z.object({
  displayName: z.string().optional(),
  monthlyPriceUsd: z.number().nonnegative().optional(),
  annualPriceUsd: z.number().nonnegative().optional(),
  annualOnly: z.boolean().optional(),
  oneTimeOnly: z.boolean().optional(),
  customPricing: z.boolean().optional(),
  allowBatch: z.boolean().optional(),
  creditableDays: z.number().int().positive().optional(),
  maxUsers: z.number().int().positive().optional(),
  isPublic: z.boolean().default(true),
  isArchived: z.boolean().default(false),
  badge: z.string().optional(),
  items: z.array(z.string()).default([]),
});
export type PlanFeaturesMeta = z.infer<typeof PlanFeaturesMetaSchema>;

export const CreatePlanInputSchema = z.object({
  name: z.string().trim().min(2).max(60),
  displayName: z.string().trim().min(2).max(80),
  description: z.string().trim().max(400).optional(),
  basePrice: z.number().nonnegative(),
  annualPriceUsd: z.number().nonnegative().optional(),
  annualOnly: z.boolean().default(false),
  classificationLimit: z.number().int().nonnegative(),
  maxTokens: z.number().int().nonnegative().default(1_000_000),
  maxUsers: z.number().int().positive().default(1),
  overagePrice: z.number().nonnegative().default(0),
  allowOverage: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  features: z.array(z.string().trim().min(1)).default([]),
});
export type CreatePlanInput = z.infer<typeof CreatePlanInputSchema>;

export const UpdatePlanInputSchema = CreatePlanInputSchema.partial().extend({
  isArchived: z.boolean().optional(),
});
export type UpdatePlanInput = z.infer<typeof UpdatePlanInputSchema>;

export const AdminPlanRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  description: z.string().nullable(),
  basePrice: z.number(),
  annualPriceUsd: z.number(),
  annualOnly: z.boolean(),
  classificationLimit: z.number().int(),
  maxTokens: z.number().int(),
  maxUsers: z.number().int(),
  overagePrice: z.number(),
  allowOverage: z.boolean(),
  isPublic: z.boolean(),
  isArchived: z.boolean(),
  features: z.array(z.string()),
  tenantCount: z.number().int().nonnegative(),
});
export type AdminPlanRecord = z.infer<typeof AdminPlanRecordSchema>;

export const LeadStatusSchema = z.enum(['PENDING', 'CONTACTED', 'CONVERTED', 'DISCARDED']);
export type LeadStatus = z.infer<typeof LeadStatusSchema>;

export const CreateLeadInputSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().max(120).optional(),
  company: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  country: z.string().trim().length(2).default('VE'),
  volume: z.string().trim().max(80).optional(),
  source: z.string().trim().max(80).optional(),
  landingPath: z.string().trim().max(200).optional(),
  referrer: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(600).optional(),
});
export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;

export const UpdateLeadInputSchema = z.object({
  status: LeadStatusSchema,
  notes: z.string().trim().max(600).optional(),
});
export type UpdateLeadInput = z.infer<typeof UpdateLeadInputSchema>;

export const AdminLeadRecordSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  company: z.string().nullable(),
  phone: z.string().nullable(),
  notes: z.string().nullable(),
  country: z.string(),
  volume: z.string().nullable(),
  source: z.string().nullable(),
  status: LeadStatusSchema,
  approvedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type AdminLeadRecord = z.infer<typeof AdminLeadRecordSchema>;
