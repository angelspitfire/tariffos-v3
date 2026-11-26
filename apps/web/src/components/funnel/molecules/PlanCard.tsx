import { Check } from 'lucide-react';
import type {
  SubscriptionBillingCycle,
  SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import { isPlanAnnualOnly } from '@/lib/funnel/plan-recommender';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelButton } from '../atoms/FunnelButton';

export interface PlanCardProps {
  plan: SubscriptionPlanConfig;
  billingCycle: 'monthly' | 'annual';
  isRecommended?: boolean;
  onSelect: (planId: string, cycle: SubscriptionBillingCycle) => void;
}

export function PlanCard({
  plan,
  billingCycle,
  isRecommended = false,
  onSelect,
}: PlanCardProps) {
  const annualOnly = isPlanAnnualOnly(plan);
  const showAnnual = annualOnly || billingCycle === 'annual';
  const price = showAnnual ? plan.annualPriceUsd : plan.monthlyPriceUsd;
  const monthlyEquiv =
    showAnnual && plan.annualPriceUsd > 0 ? Math.round(plan.annualPriceUsd / 12) : null;
  const isPopular = plan.planId === 'pro';

  return (
    <div
      className={`p-6 rounded-[24px] border backdrop-blur-md flex flex-col justify-between gap-6 transition-colors ${
        isRecommended
          ? 'border-accent-brand bg-white/95 dark:bg-white/[0.08] ring-2 ring-accent-brand'
          : isPopular
            ? 'border-accent-brand/60 bg-white/90 dark:bg-white/[0.065] shadow-sm'
            : 'border-black/[0.07] dark:border-white/[0.09] bg-white/75 dark:bg-white/[0.04]'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-ink-primary">{plan.name}</h3>
          {isRecommended ? (
            <FunnelBadge variant="accent">Recomendado</FunnelBadge>
          ) : isPopular ? (
            <FunnelBadge variant="accent">Más popular</FunnelBadge>
          ) : annualOnly ? (
            <FunnelBadge variant="neutral">Solo anual</FunnelBadge>
          ) : null}
        </div>

        <div>
          <div className="flex items-baseline gap-1 font-mono tabular-nums">
            <span className="text-2xl font-bold text-ink-primary">
              ${price.toLocaleString('en-US')}
            </span>
            <span className="text-xs text-ink-muted">/{showAnnual ? 'año' : 'mes'}</span>
          </div>
          {monthlyEquiv !== null ? (
            <div className="text-[11px] font-mono text-ink-muted tabular-nums mt-0.5">
              Equiv. ${monthlyEquiv.toLocaleString('en-US')}/mes
            </div>
          ) : (
            <div className="text-[11px] text-ink-muted mt-0.5">
              Hasta {plan.monthlyQuota.toLocaleString('en-US')} clasif./mes
            </div>
          )}
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">{plan.description}</p>

        <ul className="space-y-2 pt-3 border-t border-border-hairline">
          {plan.features.map((feat) => (
            <li key={feat} className="flex items-start gap-2 text-xs text-ink-secondary">
              <Check className="w-3.5 h-3.5 text-accent-ink shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <FunnelButton
        variant={isPopular || isRecommended ? 'primary' : 'outline'}
        size="md"
        className="w-full min-h-[44px] rounded-full whitespace-nowrap"
        onClick={() => onSelect(plan.planId, showAnnual ? 'annual' : 'monthly')}
      >
        {annualOnly ? 'Solicitar Corporate' : `Elegir ${plan.name}`}
      </FunnelButton>
    </div>
  );
}
