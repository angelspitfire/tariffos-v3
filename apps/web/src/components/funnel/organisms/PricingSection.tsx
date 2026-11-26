'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import {
  SAAS_PLANS,
  type SubscriptionBillingCycle,
  type SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import { saveSelectedPlan } from '@/lib/funnel/funnel-storage';
import { isPlanFree, type PlanRecommendation } from '@/lib/funnel/plan-recommender';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { PlanCard } from '../molecules/PlanCard';
import { TrialPlanBanner } from '../molecules/TrialPlanBanner';
import { PlanRecommender } from './PlanRecommender';

export interface PricingSectionProps {
  plans?: readonly SubscriptionPlanConfig[];
  onSelectPlan?: (planId: string, billingCycle: SubscriptionBillingCycle) => void;
}

export function PricingSection({
  plans = SAAS_PLANS,
  onSelectPlan,
}: PricingSectionProps) {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [recommendedPlanId, setRecommendedPlanId] = useState<string | null>(null);

  const visiblePlans = [...plans]
    .filter((p) => p.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const trialPlan = visiblePlans.find((p) => isPlanFree(p));
  const paidPlans = visiblePlans.filter((p) => !isPlanFree(p));

  const handleSelectPlan = (planId: string, cycle: SubscriptionBillingCycle) => {
    saveSelectedPlan(planId, cycle);
    if (onSelectPlan) {
      onSelectPlan(planId, cycle);
      return;
    }
    router.push(`/onboarding?plan=${encodeURIComponent(planId)}&cycle=${cycle}`);
  };

  const handleApplyRecommendation = (rec: PlanRecommendation) => {
    setRecommendedPlanId(rec.planId);
    setBillingCycle(rec.recommendedCycle);
  };

  return (
    <section id="planes" className="py-16 sm:py-20 border-t border-border-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <FunnelBadge variant="accent">Planes y facturación transparente</FunnelBadge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-primary">
              Invierte en precisión arancelaria, no en multas evitables
            </h2>
            <p className="text-sm text-ink-muted">
              Comienza gratis con 5 clasificaciones completas o activa un plan comercial
              mediante facturación manual asistida (Zelle, Transferencia, Binance Pay o
              Pago Móvil).
            </p>
          </div>

          <fieldset
            aria-label="Ciclo de facturación"
            className="inline-flex items-center gap-1 p-1 bg-surface-subtle rounded-xl shrink-0 border-0"
          >
            {(
              [
                { id: 'monthly', label: 'Mensual' },
                { id: 'annual', label: 'Anual (2 meses gratis)' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={billingCycle === opt.id}
                onClick={() => setBillingCycle(opt.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  billingCycle === opt.id
                    ? 'bg-surface-panel text-ink-primary shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </fieldset>
        </div>

        <PlanRecommender
          plans={visiblePlans}
          onApplyRecommendation={handleApplyRecommendation}
        />

        {trialPlan ? (
          <TrialPlanBanner
            plan={trialPlan}
            isRecommended={recommendedPlanId === trialPlan.planId}
            onSelect={() => handleSelectPlan(trialPlan.planId, 'monthly')}
          />
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paidPlans.map((plan) => (
            <PlanCard
              key={plan.planId}
              plan={plan}
              billingCycle={billingCycle}
              isRecommended={recommendedPlanId === plan.planId}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-muted pt-2">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent-ink" />
            Activación manual en menos de 24 horas hábiles
          </span>
          <span>Zelle · Transferencia USD/EUR · Binance Pay (USDT) · Pago Móvil</span>
        </div>
      </div>
    </section>
  );
}
