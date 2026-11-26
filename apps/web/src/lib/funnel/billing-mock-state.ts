import {
  SAAS_PLANS,
  type ManualPaymentMethod,
  type ManualPaymentRecord,
  type SubscriptionBillingCycle,
  type SubscriptionPlanConfig,
} from '@tariffos/shared-types';

export const MOCK_PAYMENTS_STORAGE_KEY = 'tariffos_mock_manual_payments_v1';
export const MOCK_BILLING_STATE_STORAGE_KEY = 'tariffos_mock_billing_state_v1';

export type WorkspacePlanLifecycleStatus =
  | 'trial'
  | 'quota_reached'
  | 'pending_verification'
  | 'active'
  | 'rejected';

export interface WorkspacePlanStatusSnapshot {
  planId: string;
  planName: string;
  status: WorkspacePlanLifecycleStatus;
  quotaUsed: number;
  quotaLimit: number;
  billingCycle?: SubscriptionBillingCycle;
  pendingActivation?: {
    paymentId: string;
    planId: string;
    planName: string;
    billingCycle: SubscriptionBillingCycle;
    amount: number;
    currency: string;
    referenceCode: string;
    paidAt: string;
  };
  rejectionReason?: string;
}

export interface MockWorkspaceBillingState {
  planId: string;
  status: 'trial' | 'pending_verification' | 'active' | 'rejected';
  billingCycle: SubscriptionBillingCycle;
  pendingActivation?: WorkspacePlanStatusSnapshot['pendingActivation'];
  rejectionReason?: string;
}

export const MANUAL_PAYMENT_METHOD_OPTIONS: ReadonlyArray<{
  id: ManualPaymentMethod;
  label: string;
  currencyHint: 'USD' | 'EUR' | 'VES';
}> = [
  { id: 'transferencia_usd', label: 'Transferencia USD', currencyHint: 'USD' },
  { id: 'zelle', label: 'Zelle', currencyHint: 'USD' },
  { id: 'pago_movil', label: 'Pago Móvil (Bs.)', currencyHint: 'VES' },
  { id: 'binance_pay', label: 'Binance Pay (USDT)', currencyHint: 'USD' },
  { id: 'transferencia_bs', label: 'Transferencia Bs.', currencyHint: 'VES' },
];

export const DEFAULT_MOCK_BILLING_STATE: MockWorkspaceBillingState = {
  planId: 'trial',
  status: 'trial',
  billingCycle: 'monthly',
};

export const SEED_MANUAL_PAYMENTS: readonly ManualPaymentRecord[] = [
  {
    paymentId: 'PAY-481209',
    userId: 'usr-demo-1',
    tenantId: 'ten-demo-1',
    userEmail: 'finanzas@aduanaspacifico.com',
    companyName: 'Aduanas del Pacífico C.A.',
    planId: 'pro',
    planName: 'Pro',
    billingCycle: 'monthly',
    monthsCovered: 1,
    amount: 299,
    currency: 'USD',
    method: 'zelle',
    referenceCode: 'ZEL-894201',
    paidAt: '2026-11-25',
    status: 'pending_verification',
    notes: 'Pago correspondiente al primer mes del equipo de clasificación.',
  },
  {
    paymentId: 'PAY-481214',
    userId: 'usr-demo-2',
    tenantId: 'ten-demo-2',
    userEmail: 'operaciones@caribecargo.ve',
    companyName: 'Caribe Cargo Logistics S.A.',
    planId: 'enterprise',
    planName: 'Enterprise',
    billingCycle: 'annual',
    monthsCovered: 12,
    amount: 4490,
    currency: 'USD',
    method: 'transferencia_usd',
    referenceCode: 'WIRE-2026-9910',
    paidAt: '2026-11-24',
    status: 'pending_verification',
    notes: 'Solicitamos factura fiscal a nombre de Caribe Cargo Logistics.',
  },
  {
    paymentId: 'PAY-480912',
    userId: 'usr-demo-3',
    tenantId: 'ten-demo-3',
    userEmail: 'carlos@importadoravalle.ve',
    companyName: 'Importadora El Valle C.A.',
    planId: 'basico',
    planName: 'Básico',
    billingCycle: 'monthly',
    monthsCovered: 1,
    amount: 49,
    currency: 'USD',
    method: 'binance_pay',
    referenceCode: 'BNP-66420811',
    paidAt: '2026-11-21',
    status: 'verified',
    verifiedBy: 'admin@tariffos.app',
    verifiedAt: '2026-11-21T16:40:00Z',
  },
];

export function deriveWorkspacePlanStatus(
  billing: MockWorkspaceBillingState,
  quotaUsed: number,
  plans: readonly SubscriptionPlanConfig[] = SAAS_PLANS,
): WorkspacePlanStatusSnapshot {
  const currentPlan =
    plans.find((p) => p.planId === billing.planId) ??
    plans.find((p) => p.planId === 'trial') ??
    plans[0];

  const quotaLimit = currentPlan?.monthlyQuota ?? 5;
  const planName = currentPlan?.name ?? 'Trial / Piloto';

  if (billing.status === 'pending_verification') {
    return {
      planId: billing.planId,
      planName,
      status: 'pending_verification',
      quotaUsed,
      quotaLimit,
      billingCycle: billing.billingCycle,
      pendingActivation: billing.pendingActivation,
    };
  }

  if (billing.status === 'rejected') {
    return {
      planId: billing.planId,
      planName,
      status: 'rejected',
      quotaUsed,
      quotaLimit,
      billingCycle: billing.billingCycle,
      rejectionReason: billing.rejectionReason,
    };
  }

  if (billing.status === 'active') {
    return {
      planId: billing.planId,
      planName,
      status: quotaUsed >= quotaLimit ? 'quota_reached' : 'active',
      quotaUsed,
      quotaLimit,
      billingCycle: billing.billingCycle,
    };
  }

  return {
    planId: billing.planId,
    planName,
    status: quotaUsed >= quotaLimit ? 'quota_reached' : 'trial',
    quotaUsed,
    quotaLimit,
    billingCycle: billing.billingCycle,
  };
}
