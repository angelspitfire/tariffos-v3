import type {
  ManualPaymentMethod,
  SubscriptionBillingCycle,
  SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import type { SubmitManualPaymentPayload } from './billing-port';
import type { EligiblePilotCredit } from './pilot-credit';

export interface PaymentFormValidationInput {
  referenceCode: string;
  payerName: string;
  payerEmail: string;
  amount: number;
}

export function validatePaymentFormFields({
  referenceCode,
  payerName,
  payerEmail,
  amount,
}: PaymentFormValidationInput): string | null {
  if (referenceCode.trim().length < 2) {
    return 'Ingresa el número de referencia bancaria, Order ID o TxID.';
  }
  if (!payerName.trim()) {
    return 'Indica el nombre del titular o empresa solicitante.';
  }
  if (!payerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail.trim())) {
    return 'Ingresa un correo válido para confirmar la activación.';
  }
  if (amount <= 0) {
    return 'El monto reportado debe ser mayor a cero.';
  }
  return null;
}

export function buildManualPaymentPayload(params: {
  activePlan?: SubscriptionPlanConfig;
  effectiveCycle: SubscriptionBillingCycle;
  method: ManualPaymentMethod;
  amount: number;
  currency: 'USD' | 'EUR' | 'VES';
  referenceCode: string;
  paidAt: string;
  payerName: string;
  payerEmail: string;
  notes: string;
  appliedPilotCredit?: EligiblePilotCredit | null;
  receiptStorageKey?: string;
}): SubmitManualPaymentPayload {
  const creditNote = params.appliedPilotCredit
    ? `[Crédito Piloto $${params.appliedPilotCredit.amountUsd} aplicado · Ref origen #${params.appliedPilotCredit.sourcePaymentId}]`
    : '';
  const combinedNotes = [creditNote, params.notes.trim()].filter(Boolean).join(' ') || undefined;

  return {
    planId: params.activePlan?.planId ?? 'pilot',
    billingCycle: params.effectiveCycle,
    method: params.method,
    amount: params.amount,
    currency: params.currency,
    referenceCode: params.referenceCode.trim(),
    paidAt: params.paidAt,
    payerName: params.payerName.trim(),
    payerEmail: params.payerEmail.trim(),
    notes: combinedNotes,
    receiptStorageKey: params.receiptStorageKey,
  };
}
