import { SAAS_PLANS, type ManualPaymentRecord } from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import {
  deriveWorkspacePlanStatus,
  type WorkspacePlanStatusSnapshot,
} from './billing-mock-state';
import {
  buildLocalPaymentRecord,
  readStoredBillingState,
  readStoredPayments,
  writeStoredBillingState,
  writeStoredPayments,
  type SubmitManualPaymentPayload,
} from './billing-local-store';

export {
  MANUAL_PAYMENT_METHOD_OPTIONS,
  deriveWorkspacePlanStatus,
  type MockWorkspaceBillingState,
  type WorkspacePlanLifecycleStatus,
  type WorkspacePlanStatusSnapshot,
} from './billing-mock-state';
export type { SubmitManualPaymentPayload } from './billing-local-store';

export interface IBillingActivationPort {
  listPayments(): Promise<ManualPaymentRecord[]>;
  submitPayment(payload: SubmitManualPaymentPayload): Promise<ManualPaymentRecord>;
  approvePayment(paymentId: string): Promise<ManualPaymentRecord>;
  rejectPayment(paymentId: string, reason: string): Promise<ManualPaymentRecord>;
  getWorkspacePlanStatus(quotaUsed?: number): Promise<WorkspacePlanStatusSnapshot>;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function createBillingActivationAdapter(options?: {
  cloudMode?: boolean;
}): IBillingActivationPort {
  const cloudMode = options?.cloudMode ?? isCloudModeEnabled();

  return {
    async listPayments(): Promise<ManualPaymentRecord[]> {
      if (cloudMode) {
        const data = await fetchJson<{ payments?: ManualPaymentRecord[] }>(
          '/api/billing/payments',
          { method: 'GET' },
        );
        if (data && Array.isArray(data.payments)) return data.payments;
      }
      return readStoredPayments();
    },

    async submitPayment(payload: SubmitManualPaymentPayload): Promise<ManualPaymentRecord> {
      let finalRecord = buildLocalPaymentRecord(payload);

      if (cloudMode) {
        const data = await fetchJson<{ payment?: ManualPaymentRecord }>(
          '/api/billing/payments',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );
        if (data?.payment) finalRecord = data.payment;
      }

      writeStoredPayments([finalRecord, ...readStoredPayments()]);
      writeStoredBillingState({
        ...readStoredBillingState(),
        status: 'pending_verification',
        rejectionReason: undefined,
        pendingActivation: {
          paymentId: finalRecord.paymentId,
          planId: finalRecord.planId,
          planName: finalRecord.planName,
          billingCycle: finalRecord.billingCycle,
          amount: finalRecord.amount,
          currency: finalRecord.currency,
          referenceCode: finalRecord.referenceCode,
          paidAt: finalRecord.paidAt,
        },
      });
      return finalRecord;
    },

    async approvePayment(paymentId: string): Promise<ManualPaymentRecord> {
      if (cloudMode) {
        const data = await fetchJson<{ payment?: ManualPaymentRecord }>(
          '/api/billing/payments',
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, action: 'approve' }),
          },
        );
        if (data?.payment) return data.payment;
      }

      const items = readStoredPayments();
      const target = items.find((i) => i.paymentId === paymentId);
      if (!target) throw new Error(`Pago ${paymentId} no encontrado.`);

      const updated: ManualPaymentRecord = {
        ...target,
        status: 'verified',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'admin@tariffos.app',
        rejectionReason: undefined,
      };
      writeStoredPayments(items.map((i) => (i.paymentId === paymentId ? updated : i)));
      writeStoredBillingState({
        planId: updated.planId,
        status: 'active',
        billingCycle: updated.billingCycle,
        pendingActivation: undefined,
        rejectionReason: undefined,
      });
      return updated;
    },

    async rejectPayment(paymentId: string, reason: string): Promise<ManualPaymentRecord> {
      const cleanReason = reason.trim() || 'Referencia no localizada en estado de cuenta.';
      if (cloudMode) {
        const data = await fetchJson<{ payment?: ManualPaymentRecord }>(
          '/api/billing/payments',
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, action: 'reject', reason: cleanReason }),
          },
        );
        if (data?.payment) return data.payment;
      }

      const items = readStoredPayments();
      const target = items.find((i) => i.paymentId === paymentId);
      if (!target) throw new Error(`Pago ${paymentId} no encontrado.`);

      const updated: ManualPaymentRecord = {
        ...target,
        status: 'rejected',
        rejectionReason: cleanReason,
      };
      writeStoredPayments(items.map((i) => (i.paymentId === paymentId ? updated : i)));
      writeStoredBillingState({
        ...readStoredBillingState(),
        status: 'rejected',
        pendingActivation: undefined,
        rejectionReason: cleanReason,
      });
      return updated;
    },

    async getWorkspacePlanStatus(quotaUsed = 0): Promise<WorkspacePlanStatusSnapshot> {
      return deriveWorkspacePlanStatus(readStoredBillingState(), quotaUsed, SAAS_PLANS);
    },
  };
}
