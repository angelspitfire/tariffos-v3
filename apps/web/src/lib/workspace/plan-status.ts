import {
  SAAS_PLANS,
  type ClientCurrentUsageSnapshot,
  type SubscriptionPlanConfig,
  type TenantBillingStatus,
} from '@tariffos/shared-types';
import type { WorkspaceThread } from './types';

/** Usage ratio from which a paid plan starts surfacing the activation prompt. */
export const PLAN_WARNING_RATIO = 0.8;

const DEFAULT_PLAN_ID = 'pilot';
const TRIAL_PLAN_ID = 'trial';

export interface WorkspacePlanStatus {
  planId: string;
  planName: string;
  quotaUsed: number;
  quotaLimit: number;
  usagePct: number;
  isTrial: boolean;
  isPilot: boolean;
  nearLimit: boolean;
  exhausted: boolean;
  billingStatus?: TenantBillingStatus;
}

/** Counts assistant turns that produced a classification result (verdict, dossier or batch). */
export function countClassifications(threads: readonly WorkspaceThread[]): number {
  let total = 0;
  for (const thread of threads) {
    for (const msg of thread.messages) {
      const env = msg.envelope;
      if (msg.role !== 'assistant' || !env) continue;
      const hasResult =
        env.inlineComponents.some((c) => c.type === 'verdict') ||
        env.canvasComponents.some((c) => c.type === 'dossier' || c.type === 'batch_manifest');
      if (hasResult) total += 1;
    }
  }
  return total;
}

function resolvePlan(planId: string): SubscriptionPlanConfig | undefined {
  if (planId === TRIAL_PLAN_ID) {
    return {
      planId: TRIAL_PLAN_ID,
      name: 'Cortesía Trial',
      description: 'Plan de cortesía controlado.',
      monthlyPriceUsd: 0,
      annualPriceUsd: 0,
      currency: 'USD',
      monthlyQuota: 5,
      features: [],
      paymentInstructions: '',
      published: false,
      sortOrder: 99,
    };
  }
  return (
    SAAS_PLANS.find((p) => p.planId === planId) ??
    SAAS_PLANS.find((p) => p.planId === DEFAULT_PLAN_ID)
  );
}

export function computePlanStatus(
  threads: readonly WorkspaceThread[],
  planId: string = DEFAULT_PLAN_ID,
): WorkspacePlanStatus {
  const plan = resolvePlan(planId);
  const quotaLimit = Math.max(plan?.monthlyQuota ?? 1, 1);
  const quotaUsed = countClassifications(threads);
  const ratio = quotaUsed / quotaLimit;
  const resolvedId = plan?.planId ?? DEFAULT_PLAN_ID;

  return {
    planId: resolvedId,
    planName: plan?.name ?? 'Piloto Operativo',
    quotaUsed,
    quotaLimit,
    usagePct: Math.min(100, Math.round(ratio * 100)),
    isTrial: resolvedId === TRIAL_PLAN_ID,
    isPilot: resolvedId === DEFAULT_PLAN_ID,
    nearLimit: ratio >= PLAN_WARNING_RATIO,
    exhausted: quotaUsed >= quotaLimit,
  };
}

export function mergeCloudUsageIntoPlanStatus(
  localPlan: WorkspacePlanStatus,
  cloud: ClientCurrentUsageSnapshot | null,
): WorkspacePlanStatus {
  if (!cloud) return localPlan;
  const limit = Math.max(cloud.limit, 0);
  const ratio = limit > 0 ? cloud.used / limit : 1;
  return {
    planId: cloud.planId,
    planName: cloud.planName,
    quotaUsed: cloud.used,
    quotaLimit: limit,
    usagePct: limit > 0 ? Math.min(100, Math.round(ratio * 100)) : 0,
    isTrial: cloud.planId === TRIAL_PLAN_ID || cloud.billingStatus === 'TRIALING',
    isPilot: cloud.planId === DEFAULT_PLAN_ID,
    nearLimit: limit > 0 && ratio >= PLAN_WARNING_RATIO,
    exhausted:
      cloud.billingStatus === 'PAST_DUE' ||
      cloud.billingStatus === 'CANCELED' ||
      (!cloud.allowOverage && (limit === 0 || cloud.used >= limit)),
    billingStatus: cloud.billingStatus,
  };
}

export function resolveWorkspaceReadOnlyReason(
  cloud: ClientCurrentUsageSnapshot | null,
): string | null {
  if (!cloud) return null;
  if (cloud.billingStatus === 'CANCELED') {
    return 'Cuenta dada de baja. Puedes consultar tus dictámenes históricos en modo lectura.';
  }
  if (cloud.billingStatus === 'PAST_DUE' && cloud.limit === 0) {
    return 'Activa tu Piloto Operativo ($150 · 250 clasificaciones) o Plan Agencia ($300/mes) para clasificar con IA.';
  }
  if (cloud.billingStatus === 'PAST_DUE') {
    return 'Pago pendiente de regularización. Reporta tu comprobante para reactivar las clasificaciones.';
  }
  if (!cloud.allowOverage && cloud.limit > 0 && cloud.used >= cloud.limit) {
    return `Alcanzaste el límite de ${cloud.limit.toLocaleString('en-US')} clasificaciones de tu plan ${cloud.planName}.`;
  }
  return null;
}
