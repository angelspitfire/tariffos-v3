import {
  ManualPaymentMethodSchema,
  ManualPaymentRecordSchema,
  SAAS_PLANS,
  type ManualPaymentRecord,
  type ManualPaymentStatus,
} from '@tariffos/shared-types';
import { extractPlanFeaturesMeta } from './http-helpers';

export function mapDbPaymentStatus(status: string): ManualPaymentStatus {
  if (status === 'CONFIRMED') return 'verified';
  if (status === 'REJECTED') return 'rejected';
  return 'pending_verification';
}

export function resolveAdminPlanName(
  planId: string | null | undefined,
  planRecord?: { name: string; features: unknown } | null,
): string {
  if (planRecord) {
    const meta = extractPlanFeaturesMeta(planRecord.features);
    if (meta.displayName) return meta.displayName;
  }
  return SAAS_PLANS.find((p) => p.planId === planId)?.name ?? planRecord?.name ?? planId ?? 'Pro';
}

export function toManualPaymentRecord(row: {
  id: string;
  tenantId: string;
  planId: string | null;
  billingCycle: string | null;
  amount: number | null;
  currency: string | null;
  method: string | null;
  referenceCode: string | null;
  receiptStorageKey?: string | null;
  notes?: string | null;
  status: string;
  verifiedBy?: string | null;
  verifiedAt?: Date | null;
  rejectionReason?: string | null;
  createdAt: Date;
  tenant?: { name: string; ownerEmail: string | null } | null;
}): ManualPaymentRecord {
  return ManualPaymentRecordSchema.parse({
    paymentId: row.id,
    userId: row.verifiedBy ?? row.tenantId,
    tenantId: row.tenantId,
    userEmail: row.tenant?.ownerEmail ?? 'cliente@tariffos.app',
    companyName: row.tenant?.name,
    planId: row.planId ?? 'pro',
    planName: resolveAdminPlanName(row.planId),
    billingCycle: row.billingCycle === 'annual' ? 'annual' : 'monthly',
    monthsCovered: row.billingCycle === 'annual' ? 12 : 1,
    amount: row.amount && row.amount > 0 ? row.amount : 1,
    currency: row.currency === 'EUR' || row.currency === 'VES' ? row.currency : 'USD',
    method: ManualPaymentMethodSchema.catch('otro').parse(row.method ?? 'otro'),
    referenceCode: row.referenceCode ?? 'REF-00',
    paidAt: row.createdAt.toISOString(),
    status: mapDbPaymentStatus(row.status),
    receiptStorageKey: row.receiptStorageKey ?? undefined,
    notes: row.notes ?? undefined,
    verifiedBy: row.verifiedBy ?? undefined,
    verifiedAt: row.verifiedAt?.toISOString(),
    rejectionReason: row.rejectionReason ?? undefined,
  });
}
