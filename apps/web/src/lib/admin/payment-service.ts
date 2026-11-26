import { prisma, recordAdminAudit } from '@tariffos/database';
import type { AdminRecordManualPaymentInput, ManualPaymentRecord } from '@tariffos/shared-types';
import type { PlatformAdminContext } from './admin-session';
import { appendOfflineAudit, findOfflinePlan, getOfflineAdminState } from './offline-store';
import { resolveAdminPlanName, toManualPaymentRecord } from './payment-mapper';

export { verifyCloudPayment, verifyOfflinePayment } from './payment-verify-service';

function getMonthBounds(now = new Date()): { startDate: Date; endDate: Date } {
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
  return { startDate, endDate };
}

export function recordOfflineManualPayment(
  input: AdminRecordManualPaymentInput,
  actor: PlatformAdminContext,
): ManualPaymentRecord | null {
  const state = getOfflineAdminState();
  const tenant = state.tenants.find((t) => t.id === input.tenantId);
  if (!tenant) return null;
  const plan = findOfflinePlan(input.planId);

  const payment: ManualPaymentRecord = {
    paymentId: `pay-${Date.now()}`,
    userId: actor.userId,
    tenantId: tenant.id,
    userEmail: tenant.ownerEmail ?? 'cliente@tariffos.app',
    companyName: tenant.name,
    planId: plan?.id ?? input.planId,
    planName: plan?.displayName ?? resolveAdminPlanName(input.planId),
    billingCycle: input.billingCycle,
    monthsCovered: input.billingCycle === 'annual' ? 12 : 1,
    amount: input.amount,
    currency: input.currency,
    method: input.method,
    referenceCode: input.referenceCode,
    paidAt: new Date().toISOString(),
    status: input.autoApprove ? 'verified' : 'pending_verification',
    notes: input.notes,
    verifiedBy: input.autoApprove ? actor.userId : undefined,
    verifiedAt: input.autoApprove ? new Date().toISOString() : undefined,
  };
  state.payments.unshift(payment);
  if (input.autoApprove) {
    tenant.billingStatus = 'ACTIVE';
    tenant.planId = payment.planId;
    if (plan) {
      tenant.billingLimit = plan.classificationLimit;
      tenant.allowOverage = plan.allowOverage;
    }
  }
  appendOfflineAudit({
    actorUserId: actor.userId,
    actorEmail: actor.userEmail,
    actorRole: actor.role,
    action: input.autoApprove ? 'payment.recorded_and_verified' : 'payment.recorded',
    targetType: 'payment',
    targetId: payment.paymentId,
    tenantId: tenant.id,
    reason: input.notes ?? `Pago registrado (${input.referenceCode})`,
    beforeState: null,
    afterState: payment,
  });
  return payment;
}

export async function recordCloudManualPayment(
  input: AdminRecordManualPaymentInput,
  actor: PlatformAdminContext,
): Promise<ManualPaymentRecord> {
  const { startDate, endDate } = getMonthBounds();
  const created = await prisma.$transaction(async (tx) => {
    const plan =
      (await tx.plan.findUnique({ where: { id: input.planId } })) ??
      (await tx.plan.findUnique({ where: { name: input.planId } }));
    const paymentRow = await tx.payment.create({
      data: {
        tenantId: input.tenantId,
        planId: plan?.id ?? input.planId,
        billingCycle: input.billingCycle,
        amount: input.amount,
        currency: input.currency,
        method: input.method,
        referenceCode: input.referenceCode,
        notes: input.notes,
        status: input.autoApprove ? 'CONFIRMED' : 'PENDING',
        verifiedBy: input.autoApprove ? actor.userId : null,
        verifiedAt: input.autoApprove ? new Date() : null,
      },
    });
    if (input.autoApprove) {
      await tx.tenant.update({
        where: { id: input.tenantId },
        data: {
          billingStatus: 'ACTIVE',
          planId: plan?.id ?? input.planId,
          ...(plan ? { billingLimit: plan.classificationLimit, allowOverage: plan.allowOverage } : {}),
        },
      });
      await tx.billingPeriod.upsert({
        where: { tenantId_startDate_endDate: { tenantId: input.tenantId, startDate, endDate } },
        update: { baseFee: input.amount, totalAmount: input.amount, status: 'OPEN' },
        create: {
          tenantId: input.tenantId,
          startDate,
          endDate,
          status: 'OPEN',
          baseFee: input.amount,
          totalAmount: input.amount,
        },
      });
    }
    await recordAdminAudit(tx, {
      actorUserId: actor.userId,
      actorEmail: actor.userEmail,
      actorRole: actor.role,
      action: input.autoApprove ? 'payment.recorded_and_verified' : 'payment.recorded',
      targetType: 'payment',
      targetId: paymentRow.id,
      tenantId: input.tenantId,
      afterState: { amount: input.amount, planId: paymentRow.planId, referenceCode: input.referenceCode },
      reason: input.notes ?? 'Pago registrado manualmente desde consola admin',
    });
    return paymentRow;
  });
  return toManualPaymentRecord(created);
}
