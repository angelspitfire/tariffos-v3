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
import {
  isPlanAnnualOnly,
  isPlanCustomPricing,
  isPlanFree,
  type PlanRecommendation,
} from '@/lib/funnel/plan-recommender';
import { CorporatePlanBanner } from '../molecules/CorporatePlanBanner';
import { PlanCard } from '../molecules/PlanCard';
import { TrialPlanBanner } from '../molecules/TrialPlanBanner';
import { SELECT_LEAD_INTENT_EVENT } from './LandingLeadCaptureSection';
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
    .sort((a, b) => {
      const aCustom = isPlanCustomPricing(a) ? 1 : 0;
      const bCustom = isPlanCustomPricing(b) ? 1 : 0;
      if (aCustom !== bCustom) return aCustom - bCustom;
      return a.sortOrder - b.sortOrder;
    });

  const freeBannerPlan = visiblePlans.find((p) => isPlanFree(p));
  const ladderPlans = visiblePlans.filter((p) => !isPlanFree(p));
  const shouldSplitCorporate = ladderPlans.length > 4;
  const corporateBannerPlan = shouldSplitCorporate
    ? ladderPlans.find((p) => isPlanCustomPricing(p) || isPlanAnnualOnly(p))
    : undefined;
  const gridPlans = corporateBannerPlan
    ? ladderPlans.filter((p) => p.planId !== corporateBannerPlan.planId)
    : ladderPlans;
  const gridColsClass =
    gridPlans.length <= 2
      ? 'grid-cols-1 md:grid-cols-2'
      : gridPlans.length === 3
        ? 'grid-cols-1 md:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  const handleSelectPlan = (planId: string, cycle: SubscriptionBillingCycle) => {
    const chosen = visiblePlans.find((p) => p.planId === planId);
    if (chosen && isPlanCustomPricing(chosen)) {
      if (onSelectPlan) {
        onSelectPlan(planId, 'custom');
        return;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(SELECT_LEAD_INTENT_EVENT, { detail: 'enterprise' }));
      }
      router.push('/#contacto');
      return;
    }
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
            Valida TariffOS en operación real con el Piloto Operativo de $150 (100% acreditable al Plan Agencia) o activa tu estación de agencia con facturación manual asistida.
          </p>

          <div className="pt-2 flex justify-center">
            <fieldset
              aria-label="Ciclo de facturación"
              className="inline-flex items-center gap-1 p-1.5 bg-surface-panel border border-border-subtle rounded-full"
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

        {freeBannerPlan ? (
          <TrialPlanBanner
            plan={freeBannerPlan}
            isRecommended={recommendedPlanId === freeBannerPlan.planId}
            onSelect={() => handleSelectPlan(freeBannerPlan.planId, 'monthly')}
          />
        ) : null}

        <div className={`grid ${gridColsClass} gap-6 items-stretch`}>
          {gridPlans.map((plan) => (
            <PlanCard
              key={plan.planId}
              plan={plan}
              billingCycle={billingCycle}
              isRecommended={recommendedPlanId === plan.planId}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>

        {corporateBannerPlan ? (
          <CorporatePlanBanner
            plan={corporateBannerPlan}
            isRecommended={recommendedPlanId === corporateBannerPlan.planId}
            onSelect={() => handleSelectPlan(corporateBannerPlan.planId, 'custom')}
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-ink-muted pt-2">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent-ink shrink-0" aria-hidden="true" />
            Activación verificada en menos de 24 horas hábiles · Piloto 100% acreditable en 30 días
          </span>
          <span>Zelle, Transferencia USD/EUR, Binance Pay (USDT) y Pago Móvil</span>
        </div>
      </div>
    </section>
  );
}
