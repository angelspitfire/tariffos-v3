'use client';

import { useState } from 'react';
import {
  SAAS_PLANS,
  type SubscriptionBillingCycle,
} from '@tariffos/shared-types';
import {
  isPlanAnnualOnly,
  isPlanFree,
  type PlanRecommendation,
} from '@/lib/funnel/plan-recommender';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { PlanRecommender } from '../organisms/PlanRecommender';

export interface OnboardingPlanPickerProps {
  selectedPlanId: string;
  billingCycle?: SubscriptionBillingCycle;
  onChangeCycle?: (cycle: SubscriptionBillingCycle) => void;
  onSelect?: (planId: string, cycle?: SubscriptionBillingCycle) => void;
  onSelectPlan?: (planId: string, cycle: SubscriptionBillingCycle) => void;
}

export function OnboardingPlanPicker({
  selectedPlanId,
  billingCycle = 'monthly',
  onChangeCycle,
  onSelect,
  onSelectPlan,
}: OnboardingPlanPickerProps) {
  const [recommendedPlanId, setRecommendedPlanId] = useState<string | null>(null);

  const visiblePlans = [...SAAS_PLANS]
    .filter((p) => p.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const handleApplyRecommendation = (rec: PlanRecommendation) => {
    setRecommendedPlanId(rec.planId);
    onChangeCycle?.(rec.recommendedCycle);
    onSelect?.(rec.planId, rec.recommendedCycle);
    onSelectPlan?.(rec.planId, rec.recommendedCycle);
  };

  return (
    <div className="space-y-3 pt-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Elige cómo empezar
        </span>
        {onChangeCycle ? (
          <div className="inline-flex items-center gap-1 rounded-lg bg-surface-subtle p-1">
            {(
              [
                { id: 'monthly', label: 'Mensual' },
                { id: 'annual', label: 'Anual (2 meses gratis)' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeCycle(opt.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  billingCycle === opt.id
                    ? 'bg-surface-panel text-ink-primary shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <PlanRecommender
        plans={visiblePlans}
        onApplyRecommendation={handleApplyRecommendation}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {visiblePlans.map((plan) => {
          const selected = plan.planId === selectedPlanId;
          const isRec = plan.planId === recommendedPlanId;
          const annualOnly = isPlanAnnualOnly(plan);
          const showAnnual = annualOnly || billingCycle === 'annual';
          const resolvedCycle: SubscriptionBillingCycle = annualOnly
            ? 'annual'
            : billingCycle;
          const priceText = isPlanFree(plan)
            ? '$0 · 5 clasif.'
            : showAnnual
              ? `$${plan.annualPriceUsd.toLocaleString('en-US')}/año`
              : `$${plan.monthlyPriceUsd.toLocaleString('en-US')}/mes`;
          return (
            <button
              key={plan.planId}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                onSelect?.(plan.planId, annualOnly ? 'annual' : resolvedCycle);
                onSelectPlan?.(plan.planId, resolvedCycle);
              }}
              className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                selected
                  ? 'border-accent-brand bg-accent-soft/60 ring-1 ring-accent-brand'
                  : 'border-border-subtle bg-surface-panel hover:border-border-strong'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-ink-primary">{plan.name}</span>
                {isRec ? <FunnelBadge variant="accent">Recomendado</FunnelBadge> : null}
              </div>
              <div className="text-[11px] font-mono text-ink-muted mt-0.5">{priceText}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
