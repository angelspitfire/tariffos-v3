'use client';

import { CheckCircle2 } from 'lucide-react';
import type { SubscriptionBillingCycle, SubscriptionPlanConfig } from '@tariffos/shared-types';
import { OnboardingPlanPicker } from './OnboardingPlanPicker';

export interface OnboardingStepPlanProps {
  plans: readonly SubscriptionPlanConfig[];
  matchedPlan?: SubscriptionPlanConfig;
  selectedPlanId: string;
  billingCycle: SubscriptionBillingCycle;
  effectiveCycle: SubscriptionBillingCycle;
  isOneTime: boolean;
  isPaidPlan: boolean;
  showPlanPicker: boolean;
  onShowPlanPicker: () => void;
  onChangeCycle: (cycle: SubscriptionBillingCycle) => void;
  onSelectPlan: (planId: string, cycle?: SubscriptionBillingCycle) => void;
}

export function OnboardingStepPlan({
  plans,
  matchedPlan,
  selectedPlanId,
  billingCycle,
  effectiveCycle,
  isOneTime,
  isPaidPlan,
  showPlanPicker,
  onShowPlanPicker,
  onChangeCycle,
  onSelectPlan,
}: OnboardingStepPlanProps) {
  if (!showPlanPicker && matchedPlan) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-accent-border bg-accent-soft/50 px-3.5 py-2.5 text-xs">
        <div className="flex items-center gap-2 text-ink-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-ink" />
          <span>
            Plan preseleccionado: <strong>{matchedPlan.name}</strong>
            {isOneTime
              ? ` ($${matchedPlan.monthlyPriceUsd} · Pago único)`
              : isPaidPlan
                ? ` (${effectiveCycle === 'annual' ? 'Anual' : 'Mensual'})`
                : ''}
          </span>
        </div>
        <button
          type="button"
          onClick={onShowPlanPicker}
          className="cursor-pointer text-[11px] font-semibold text-accent-ink hover:underline"
        >
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <OnboardingPlanPicker
      plans={plans}
      selectedPlanId={selectedPlanId}
      billingCycle={billingCycle}
      onChangeCycle={onChangeCycle}
      onSelect={onSelectPlan}
    />
  );
}
