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
    <section id="planes" className="py-24 sm:py-32">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-[clamp(2rem,3vw+0.8rem,3.25rem)] font-medium tracking-[-0.03em] text-ink-primary leading-[1.08] [text-wrap:balance] mx-auto">
            Invierte en precisión arancelaria, no en multas evitables
          </h2>
          <p className="text-base text-ink-secondary leading-relaxed">
            Comienza gratis con 5 clasificaciones completas o activa un plan comercial mediante facturación manual asistida (Zelle, Transferencia, Binance Pay o Pago Móvil).
          </p>

          <div className="pt-2 flex justify-center">
            <fieldset
              aria-label="Ciclo de facturación"
              className="inline-flex items-center gap-1 p-1.5 bg-white/75 dark:bg-white/[0.06] border border-black/[0.07] dark:border-white/[0.09] backdrop-blur-md rounded-full"
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
                  className={`px-4 py-2 min-h-[38px] text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                    billingCycle === opt.id
                      ? 'bg-ink-primary text-ink-on-inverted'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </fieldset>
          </div>
        </div>

        <div className="rounded-[26px] overflow-hidden">
          <PlanRecommender
            plans={visiblePlans}
            onApplyRecommendation={handleApplyRecommendation}
          />
        </div>

        {trialPlan ? (
          <TrialPlanBanner
            plan={trialPlan}
            isRecommended={recommendedPlanId === trialPlan.planId}
            onSelect={() => handleSelectPlan(trialPlan.planId, 'monthly')}
          />
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-ink-muted pt-2">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent-ink shrink-0" aria-hidden="true" />
            Activación manual en menos de 24 horas hábiles
          </span>
          <span>Zelle, Transferencia USD/EUR, Binance Pay (USDT) y Pago Móvil</span>
        </div>
      </div>
    </section>
  );
}
