import type { SubscriptionPlanConfig } from '@tariffos/shared-types';
import {
  isPlanAnnualOnly,
  isPlanCustomPricing,
  isPlanFree,
  isPlanOneTime,
  type PlanRecommendation,
  type RecommenderCapability,
  type RecommenderTeamSize,
  type RecommenderVolumeTier,
} from './plan-recommender';

export const RECOMMENDER_VOLUME_OPTIONS: ReadonlyArray<{
  id: RecommenderVolumeTier;
  label: string;
  paidOnlyHide?: boolean;
}> = [
  { id: 'trial', label: 'Piloto (hasta 250)' },
  { id: 'medium', label: '250–1,000' },
  { id: 'high', label: '1,000+' },
];

export const RECOMMENDER_TEAM_OPTIONS: ReadonlyArray<{
  id: RecommenderTeamSize;
  label: string;
}> = [
  { id: 'solo', label: '1–2 operadores' },
  { id: 'small', label: '3–5 usuarios' },
  { id: 'agency', label: '6–10 usuarios' },
  { id: 'corporate', label: '10+ usuarios' },
];

export const RECOMMENDER_EXTRA_CAPABILITIES: ReadonlyArray<{
  id: RecommenderCapability;
  label: string;
}> = [
  { id: 'multi_jurisdiction', label: 'Multi-jurisdicción' },
  { id: 'audit_sla', label: 'SLA dedicado / corporativo' },
  { id: 'annual_savings', label: 'Pago anual (ahorrar 2 meses)' },
];

export function formatRecommendationPrice(
  matchedPlan: SubscriptionPlanConfig | undefined,
  recommendation: PlanRecommendation,
): string {
  if (!matchedPlan) return '';
  if (isPlanCustomPricing(matchedPlan)) return 'A medida';
  if (isPlanOneTime(matchedPlan)) {
    return `$${matchedPlan.monthlyPriceUsd.toLocaleString('en-US')} pago único`;
  }
  if (isPlanFree(matchedPlan)) return '$0';
  const showAnnual =
    recommendation.recommendedCycle === 'annual' || isPlanAnnualOnly(matchedPlan);
  return showAnnual
    ? `$${matchedPlan.annualPriceUsd.toLocaleString('en-US')}/año`
    : `$${matchedPlan.monthlyPriceUsd.toLocaleString('en-US')}/mes`;
}
