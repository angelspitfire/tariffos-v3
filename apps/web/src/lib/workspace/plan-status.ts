import {
  SAAS_PLANS,
  type ClientCurrentUsageSnapshot,
  type SubscriptionPlanConfig,
  type TenantBillingStatus,
} from '@tariffos/shared-types';
import type { WorkspaceThread } from './types';

/** Usage ratio from which a paid plan starts surfacing the activation prompt. */
export const PLAN_WARNING_RATIO = 0.8;

const TRIAL_PLAN_ID = 'trial';

export interface WorkspacePlanStatus {
  planId: string;
  planName: string;
  quotaUsed: number;
  quotaLimit: number;
  usagePct: number;
  isTrial: boolean;
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
  return (
    SAAS_PLANS.find((p) => p.planId === planId) ??
    SAAS_PLANS.find((p) => p.planId === TRIAL_PLAN_ID)
  );
}

export function computePlanStatus(
  threads: readonly WorkspaceThread[],
  planId: string = TRIAL_PLAN_ID,
): WorkspacePlanStatus {
  const plan = resolvePlan(planId);
  const quotaLimit = Math.max(plan?.monthlyQuota ?? 1, 1);
  const quotaUsed = countClassifications(threads);
  const ratio = quotaUsed / quotaLimit;
  const resolvedId = plan?.planId ?? TRIAL_PLAN_ID;

  return {
    planId: resolvedId,
    planName: plan?.name ?? 'Trial / Piloto',
    quotaUsed,
    quotaLimit,
    usagePct: Math.min(100, Math.round(ratio * 100)),
    isTrial: resolvedId === TRIAL_PLAN_ID,
    nearLimit: ratio >= PLAN_WARNING_RATIO,
    exhausted: quotaUsed >= quotaLimit,
  };
}

export function mergeCloudUsageIntoPlanStatus(
  localPlan: WorkspacePlanStatus,
  cloud: ClientCurrentUsageSnapshot | null,
): WorkspacePlanStatus {
  if (!cloud) return localPlan;
  const limit = Math.max(cloud.limit, 1);
  const ratio = cloud.used / limit;
  return {
    planId: cloud.planId,
    planName: cloud.planName,
    quotaUsed: cloud.used,
    quotaLimit: limit,
    usagePct: Math.min(100, Math.round(ratio * 100)),
    isTrial: cloud.planId === TRIAL_PLAN_ID || cloud.billingStatus === 'TRIALING',
    nearLimit: ratio >= PLAN_WARNING_RATIO,
    exhausted: !cloud.allowOverage && cloud.used >= limit,
    billingStatus: cloud.billingStatus,
  };
}
