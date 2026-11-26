import {
  SAAS_PLANS,
  type SubscriptionBillingCycle,
} from '@tariffos/shared-types';
import { isPlanAnnualOnly, isPlanFree } from '@/lib/funnel/plan-recommender';

export interface OnboardingPlanPickerProps {
  selectedPlanId: string;
  billingCycle?: SubscriptionBillingCycle;
  onSelect?: (planId: string, cycle?: SubscriptionBillingCycle) => void;
  onSelectPlan?: (planId: string, cycle: SubscriptionBillingCycle) => void;
}

export function OnboardingPlanPicker({
  selectedPlanId,
  billingCycle = 'monthly',
  onSelect,
  onSelectPlan,
}: OnboardingPlanPickerProps) {
  return (
    <div className="space-y-2 pt-1">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        Elige cómo empezar
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SAAS_PLANS.map((plan) => {
          const selected = plan.planId === selectedPlanId;
          const annualOnly = isPlanAnnualOnly(plan);
          const resolvedCycle: SubscriptionBillingCycle = annualOnly
            ? 'annual'
            : billingCycle;
          const priceText = isPlanFree(plan)
            ? '$0 · 5 clasif.'
            : annualOnly
              ? `$${plan.annualPriceUsd.toLocaleString('en-US')}/año`
              : `$${plan.monthlyPriceUsd.toLocaleString('en-US')}/mes`;
          return (
            <button
              key={plan.planId}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                onSelect?.(plan.planId, annualOnly ? 'annual' : undefined);
                onSelectPlan?.(plan.planId, resolvedCycle);
              }}
              className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                selected
                  ? 'border-accent-brand bg-accent-soft/60 ring-1 ring-accent-brand'
                  : 'border-border-subtle bg-surface-panel hover:border-border-strong'
              }`}
            >
              <div className="text-xs font-bold text-ink-primary">{plan.name}</div>
              <div className="text-[11px] font-mono text-ink-muted mt-0.5">{priceText}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
