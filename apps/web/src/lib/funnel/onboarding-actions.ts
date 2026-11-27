import type {
  SubscriptionBillingCycle,
  SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import {
  FUNNEL_JURISDICTIONS,
  readSelectedPlan,
  saveMockProfile,
  saveSelectedPlan,
  type OnboardingProfileDraft,
} from './funnel-storage';
import { isPlanAnnualOnly, isPlanFree, isPlanOneTime } from './plan-recommender';

export interface ResolvedPlanPricing {
  matchedPlan?: SubscriptionPlanConfig;
  isOneTime: boolean;
  isPaidPlan: boolean;
  effectiveCycle: SubscriptionBillingCycle;
}

export function resolvePlanPricing(
  plans: readonly SubscriptionPlanConfig[],
  selectedPlanId: string,
  billingCycle: SubscriptionBillingCycle,
): ResolvedPlanPricing {
  const matchedPlan = plans.find((p) => p.planId === selectedPlanId) ?? plans[0];
  const isOneTime = matchedPlan ? isPlanOneTime(matchedPlan) : false;
  const isPaidPlan = matchedPlan ? !isPlanFree(matchedPlan) && !matchedPlan.customPricing : true;
  const effectiveCycle: SubscriptionBillingCycle = isOneTime
    ? 'monthly'
    : matchedPlan && isPlanAnnualOnly(matchedPlan)
      ? 'annual'
      : billingCycle;
  return { matchedPlan, isOneTime, isPaidPlan, effectiveCycle };
}

export interface InitialOnboardingPlan {
  planId: string;
  billingCycle: SubscriptionBillingCycle;
  preselected: boolean;
}

export function resolveInitialOnboardingPlan(params: {
  urlPlan: string | null;
  urlCycle: string | null;
}): InitialOnboardingPlan {
  const stored = readSelectedPlan();
  if (params.urlPlan) {
    const billingCycle: SubscriptionBillingCycle =
      params.urlCycle === 'annual' ? 'annual' : 'monthly';
    return { planId: params.urlPlan, billingCycle, preselected: true };
  }
  if (stored?.planId) {
    return {
      planId: stored.planId,
      billingCycle: stored.billingCycle,
      preselected: true,
    };
  }
  return { planId: 'pilot', billingCycle: 'monthly', preselected: false };
}

export interface PersistOnboardingResult {
  ok: boolean;
  error: string | null;
  skipPaymentActivation?: boolean;
  requiresReauth?: boolean;
}

interface OnboardingApiPayload {
  error?: string;
  issues?: Array<{ message?: string }>;
  skipPaymentActivation?: boolean;
  tenant?: {
    billingStatus?: string;
  };
}

export async function persistOnboardingProfile(
  profile: OnboardingProfileDraft,
  isCloud: boolean,
): Promise<PersistOnboardingResult> {
  saveMockProfile(profile);
  saveSelectedPlan(profile.selectedPlanId, profile.selectedBillingCycle);

  if (!isCloud) return { ok: true, error: null, skipPaymentActivation: false };

  const matchedJurisdiction = FUNNEL_JURISDICTIONS.find(
    (jur) => jur.id === profile.defaultJurisdictionId,
  );
  const countryCode = matchedJurisdiction?.countryCode ?? 'VE';

  const res = await fetch('/api/onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: profile.fullName,
      companyName: profile.companyName,
      role: profile.role,
      brokerLicense: profile.brokerLicense,
      taxId: profile.taxId?.trim() || undefined,
      countryCode,
      defaultJurisdictionId: profile.defaultJurisdictionId,
      defaultCustomsOffice: profile.defaultCustomsOffice || undefined,
      defaultIncoterm: profile.defaultIncoterm,
      preferredCurrency: profile.preferredCurrency,
      approvalWorkflowMode: profile.approvalWorkflowMode,
      selectedPlanId: profile.selectedPlanId,
      selectedBillingCycle: profile.selectedBillingCycle,
    }),
  });

  const payload = (await res.json().catch(() => null)) as OnboardingApiPayload | null;

  if (!res.ok) {
    if (res.status === 401) {
      return {
        ok: false,
        requiresReauth: true,
        error: 'Tu sesión expiró. Inicia sesión nuevamente para guardar tu perfil.',
      };
    }
    const issueMessage = payload?.issues?.find((issue) => Boolean(issue.message?.trim()))?.message;
    const serverError =
      payload?.error && payload.error !== 'Validation failed' ? payload.error : null;
    return {
      ok: false,
      error:
        issueMessage ||
        serverError ||
        'No pudimos guardar tu perfil en el servidor. Intenta nuevamente.',
    };
  }

  const skipPaymentActivation = Boolean(
    payload?.skipPaymentActivation ||
      payload?.tenant?.billingStatus === 'ACTIVE' ||
      payload?.tenant?.billingStatus === 'TRIALING',
  );

  return { ok: true, error: null, skipPaymentActivation };
}
