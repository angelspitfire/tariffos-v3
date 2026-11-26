import {
  SAAS_PLANS,
  type ManualPaymentMethod,
  type ManualPaymentRecord,
  type SubscriptionBillingCycle,
} from '@tariffos/shared-types';
import {
  DEFAULT_MOCK_BILLING_STATE,
  MOCK_BILLING_STATE_STORAGE_KEY,
  MOCK_PAYMENTS_STORAGE_KEY,
  SEED_MANUAL_PAYMENTS,
  type MockWorkspaceBillingState,
} from './billing-mock-state';

export interface SubmitManualPaymentPayload {
  planId: string;
  billingCycle: SubscriptionBillingCycle;
  method: ManualPaymentMethod;
  amount: number;
  currency: 'USD' | 'EUR' | 'VES';
  referenceCode: string;
  paidAt: string;
  payerName: string;
  payerEmail: string;
  notes?: string;
  receiptStorageKey?: string;
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStoredPayments(): ManualPaymentRecord[] {
  const storage = getLocalStorage();
  if (!storage) return [...SEED_MANUAL_PAYMENTS];
  try {
    const raw = storage.getItem(MOCK_PAYMENTS_STORAGE_KEY);
    if (!raw) {
      storage.setItem(MOCK_PAYMENTS_STORAGE_KEY, JSON.stringify(SEED_MANUAL_PAYMENTS));
      return [...SEED_MANUAL_PAYMENTS];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? (parsed as ManualPaymentRecord[])
      : [...SEED_MANUAL_PAYMENTS];
  } catch {
    return [...SEED_MANUAL_PAYMENTS];
  }
}

export function writeStoredPayments(items: ManualPaymentRecord[]): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(MOCK_PAYMENTS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage write failure.
  }
}

export function readStoredBillingState(): MockWorkspaceBillingState {
  const storage = getLocalStorage();
  if (!storage) return { ...DEFAULT_MOCK_BILLING_STATE };
  try {
    const raw = storage.getItem(MOCK_BILLING_STATE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_MOCK_BILLING_STATE };
    return JSON.parse(raw) as MockWorkspaceBillingState;
  } catch {
    return { ...DEFAULT_MOCK_BILLING_STATE };
  }
}

export function writeStoredBillingState(state: MockWorkspaceBillingState): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(MOCK_BILLING_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage write failure.
  }
}

export function buildLocalPaymentRecord(
  payload: SubmitManualPaymentPayload,
): ManualPaymentRecord {
  const matchedPlan = SAAS_PLANS.find((p) => p.planId === payload.planId);
  const paymentId = `PAY-${Math.floor(100000 + Math.random() * 899999)}`;
  return {
    paymentId,
    userId: 'local-user',
    tenantId: 'local-tenant',
    userEmail: payload.payerEmail.trim(),
    companyName: payload.payerName.trim(),
    planId: payload.planId,
    planName: matchedPlan?.name ?? payload.planId,
    billingCycle: payload.billingCycle,
    monthsCovered: payload.billingCycle === 'annual' ? 12 : 1,
    amount: payload.amount,
    currency: payload.currency,
    method: payload.method,
    referenceCode: payload.referenceCode.trim(),
    paidAt: payload.paidAt,
    status: 'pending_verification',
    receiptStorageKey: payload.receiptStorageKey,
    notes: payload.notes?.trim() || undefined,
  };
}
