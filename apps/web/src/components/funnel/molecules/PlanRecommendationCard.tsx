import Link from 'next/link';
import { Check } from 'lucide-react';
import type { SubscriptionPlanConfig } from '@tariffos/shared-types';
import {
  isPlanAnnualOnly,
  isPlanCustomPricing,
  isPlanFree,
  isPlanOneTime,
  type PlanRecommendation,
} from '@/lib/funnel/plan-recommender';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelButton } from '../atoms/FunnelButton';

export interface PlanRecommendationCardProps {
  recommendation: PlanRecommendation;
  matchedPlan?: SubscriptionPlanConfig;
  onApply: () => void;
}

export function PlanRecommendationCard({
  recommendation,
  matchedPlan,
  onApply,
}: PlanRecommendationCardProps) {
  const custom = matchedPlan ? isPlanCustomPricing(matchedPlan) : false;
  const oneTime = matchedPlan ? isPlanOneTime(matchedPlan) : false;
  const free = matchedPlan ? isPlanFree(matchedPlan) : false;
  const annualOnly = matchedPlan ? isPlanAnnualOnly(matchedPlan) : false;
  const priceLabel = !matchedPlan
    ? ''
    : custom
      ? 'A medida'
      : oneTime
        ? `$${matchedPlan.monthlyPriceUsd.toLocaleString('en-US')} pago único`
        : free
          ? '$0'
          : recommendation.recommendedCycle === 'annual' || annualOnly
            ? `$${matchedPlan.annualPriceUsd.toLocaleString('en-US')}/año`
            : `$${matchedPlan.monthlyPriceUsd.toLocaleString('en-US')}/mes`;

  return (
    <div className="lg:col-span-5 p-3.5 rounded-xl bg-surface-panel border border-accent-brand/50 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <FunnelBadge variant="accent">Recomendado para ti</FunnelBadge>
        <span className="font-mono text-sm font-bold text-ink-primary tabular-nums">
          {priceLabel}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-bold text-ink-primary">
          Plan {recommendation.planName}
          {!free && !custom && !oneTime ? (
            <span className="text-[11px] font-normal text-ink-muted ml-1.5">
              ({recommendation.recommendedCycle === 'annual' ? 'Anual' : 'Mensual'})
            </span>
          ) : null}
        </h3>
        <p className="text-[11px] text-ink-secondary mt-0.5 leading-snug">
          {recommendation.headline}
        </p>
      </div>

      <ul className="space-y-1 pt-1.5 border-t border-border-hairline">
        {recommendation.reasons.map((reason) => (
          <li
            key={reason}
            className="flex items-start gap-1.5 text-[11px] text-ink-secondary"
          >
            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{reason}</span>
          </li>
        ))}
      </ul>

      {recommendation.estimatedUnitCostLabel ? (
        <div className="text-[10px] font-mono text-ink-muted pt-1">
          {recommendation.estimatedUnitCostLabel}
        </div>
      ) : null}

      {custom ? (
        <Link
          href="/#contacto"
          onClick={onApply}
          className="inline-flex w-full items-center justify-center rounded-xl bg-accent-brand px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-brand-hover"
        >
          Solicitar cotización Enterprise
        </Link>
      ) : (
        <FunnelButton
          type="button"
          variant="primary"
          size="sm"
          className="w-full"
          onClick={onApply}
        >
          Aplicar plan {recommendation.planName}
        </FunnelButton>
      )}
    </div>
  );
}
