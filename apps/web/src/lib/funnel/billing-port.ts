import type { ManualPaymentRecord } from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';
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
  type MockWorkspaceBillingState,
  type PendingActivationSummary,
} from './billing-mock-state';
export type { SubmitManualPaymentPayload } from './billing-local-store';

export interface IBillingActivationPort {
  listPayments(): Promise<ManualPaymentRecord[]>;
  submitPayment(payload: SubmitManualPaymentPayload): Promise<ManualPaymentRecord>;
  approvePayment(paymentId: string): Promise<ManualPaymentRecord>;
  rejectPayment(paymentId: string, reason: string): Promise<ManualPaymentRecord>;
}

async function fetchJsonOrThrow<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const payload = (await res.json().catch(() => null)) as { error?: string } & T | null;
  if (!res.ok) {
    throw new Error(payload?.error || `Error HTTP ${res.status}`);
  }
  if (!payload) {
    throw new Error('Respuesta vacía del servidor.');
  }
  return payload;
}

export function createBillingActivationAdapter(options?: {
  cloudMode?: boolean;
  adminMode?: boolean;
}): IBillingActivationPort {
  const cloudMode = options?.cloudMode ?? isCloudModeEnabled();
  const paymentsEndpoint = options?.adminMode
    ? '/api/admin/billing/payments'
    : '/api/billing/payments';

  return {
    async listPayments(): Promise<ManualPaymentRecord[]> {
      if (cloudMode) {
        const data = await fetchJsonOrThrow<{ payments?: ManualPaymentRecord[] }>(paymentsEndpoint, {
          method: 'GET',
        });
        return Array.isArray(data.payments) ? data.payments : [];
      }
      return readStoredPayments();
    },

    async submitPayment(payload: SubmitManualPaymentPayload): Promise<ManualPaymentRecord> {
      if (cloudMode) {
        const data = await fetchJsonOrThrow<{ payment?: ManualPaymentRecord }>(
          '/api/billing/payments',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );
        if (!data.payment) {
          throw new Error('El servidor no devolvió el comprobante creado.');
        }
        return data.payment;
      }

      const finalRecord = buildLocalPaymentRecord(payload);
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
        const data = await fetchJsonOrThrow<{ payment?: ManualPaymentRecord }>(
          '/api/admin/billing/payments',
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, action: 'verify' }),
          },
        );
        if (!data.payment) {
          throw new Error('El servidor no devolvió el pago aprobado.');
        }
        return data.payment;
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
        const data = await fetchJsonOrThrow<{ payment?: ManualPaymentRecord }>(
          '/api/admin/billing/payments',
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, action: 'reject', rejectionReason: cleanReason }),
          },
        );
        if (!data.payment) {
          throw new Error('El servidor no devolvió el pago rechazado.');
        }
        return data.payment;
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
  };
}
