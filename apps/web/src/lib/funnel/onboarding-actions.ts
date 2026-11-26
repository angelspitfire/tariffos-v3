import type { SubscriptionBillingCycle } from '@tariffos/shared-types';
import {
  readSelectedPlan,
  saveMockProfile,
  saveSelectedPlan,
  type OnboardingProfileDraft,
} from './funnel-storage';

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
}

interface OnboardingApiPayload {
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

  const res = await fetch('/api/onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: profile.fullName,
      companyName: profile.companyName,
      countryCode: profile.defaultJurisdictionId.slice(0, 2).toUpperCase(),
      defaultJurisdictionId: profile.defaultJurisdictionId,
      defaultIncoterm: profile.defaultIncoterm,
      preferredCurrency: profile.preferredCurrency,
      approvalWorkflowMode: profile.approvalWorkflowMode,
      selectedPlanId: profile.selectedPlanId,
      selectedBillingCycle: profile.selectedBillingCycle,
    }),
  });

  if (!res.ok) {
    return {
      ok: false,
      error: 'No pudimos guardar tu perfil en el servidor. Intenta nuevamente.',
    };
  }

  const payload = (await res.json().catch(() => null)) as OnboardingApiPayload | null;
  const skipPaymentActivation = Boolean(
    payload?.skipPaymentActivation ||
      payload?.tenant?.billingStatus === 'ACTIVE' ||
      payload?.tenant?.billingStatus === 'TRIALING',
  );

  return { ok: true, error: null, skipPaymentActivation };
}
