import { prisma, recordAdminAudit } from '@tariffos/database';
import type { AdminVerifyPaymentInput, ManualPaymentRecord } from '@tariffos/shared-types';
import type { PlatformAdminContext } from './admin-session';
import { appendOfflineAudit, findOfflinePlan, getOfflineAdminState } from './offline-store';
import { toManualPaymentRecord } from './payment-mapper';

function getMonthBounds(now = new Date()): { startDate: Date; endDate: Date } {
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
  return { startDate, endDate };
}

export function verifyOfflinePayment(
  input: AdminVerifyPaymentInput,
  actor: PlatformAdminContext,
): ManualPaymentRecord | null {
  const isVerify = input.action === 'verify';
  const state = getOfflineAdminState();
  const index = state.payments.findIndex((p) => p.paymentId === input.paymentId);
  if (index === -1) return null;

  const prev = state.payments[index];
  const updated: ManualPaymentRecord = {
    ...prev,
    status: isVerify ? 'verified' : 'rejected',
    verifiedBy: actor.userId,
    verifiedAt: new Date().toISOString(),
    rejectionReason: isVerify ? undefined : (input.rejectionReason ?? 'Comprobante rechazado'),
  };
  state.payments[index] = updated;
  if (isVerify) {
    const tenant = state.tenants.find((t) => t.id === updated.tenantId);
    const plan = findOfflinePlan(updated.planId);
    if (tenant) {
      tenant.billingStatus = 'ACTIVE';
      tenant.planId = plan?.id ?? updated.planId;
      if (plan) {
        tenant.billingLimit = plan.classificationLimit;
        tenant.allowOverage = plan.allowOverage;
      }
    }
  }
  appendOfflineAudit({
    actorUserId: actor.userId,
    actorEmail: actor.userEmail,
    actorRole: actor.role,
    action: isVerify ? 'payment.verified' : 'payment.rejected',
    targetType: 'payment',
    targetId: updated.paymentId,
    tenantId: updated.tenantId,
    reason: isVerify ? 'Pago verificado y plan activado' : updated.rejectionReason ?? null,
    beforeState: { status: prev.status },
    afterState: { status: updated.status, planId: updated.planId },
  });
  return updated;
}

export async function verifyCloudPayment(
  input: AdminVerifyPaymentInput,
  actor: PlatformAdminContext,
): Promise<ManualPaymentRecord> {
  const isVerify = input.action === 'verify';
  const { startDate, endDate } = getMonthBounds();
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.payment.update({
      where: { id: input.paymentId },
      data: {
        status: isVerify ? 'CONFIRMED' : 'REJECTED',
        verifiedBy: actor.userId,
        verifiedAt: new Date(),
        rejectionReason: isVerify ? null : (input.rejectionReason ?? 'Comprobante rechazado'),
      },
    });
    if (isVerify) {
      const plan = row.planId
        ? ((await tx.plan.findUnique({ where: { id: row.planId } })) ??
          (await tx.plan.findUnique({ where: { name: row.planId } })))
        : null;
      await tx.tenant.update({
        where: { id: row.tenantId },
        data: {
          billingStatus: 'ACTIVE',
          planId: plan?.id ?? row.planId ?? undefined,
          ...(plan ? { billingLimit: plan.classificationLimit, allowOverage: plan.allowOverage } : {}),
        },
      });
      await tx.billingPeriod.upsert({
        where: { tenantId_startDate_endDate: { tenantId: row.tenantId, startDate, endDate } },
        update: { baseFee: row.amount ?? 0, totalAmount: row.amount ?? 0, status: 'OPEN' },
        create: {
          tenantId: row.tenantId,
          startDate,
          endDate,
          status: 'OPEN',
          baseFee: row.amount ?? 0,
          totalAmount: row.amount ?? 0,
        },
      });
    }
    await recordAdminAudit(tx, {
      actorUserId: actor.userId,
      actorEmail: actor.userEmail,
      actorRole: actor.role,
      action: isVerify ? 'payment.verified' : 'payment.rejected',
      targetType: 'payment',
      targetId: row.id,
      tenantId: row.tenantId,
      afterState: { status: row.status, planId: row.planId },
      reason: isVerify ? 'Pago verificado y plan activado' : (row.rejectionReason ?? 'Rechazado'),
    });
    return row;
  });
  return toManualPaymentRecord(updated);
}
