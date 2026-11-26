import type { SubscriptionPlanConfig } from '@tariffos/shared-types';
import {
  isPlanAnnualOnly,
  isPlanFree,
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
  { id: 'trial', label: 'Prueba (1–5)', paidOnlyHide: true },
  { id: 'low', label: 'Hasta 40' },
  { id: 'medium', label: '41–400' },
  { id: 'high', label: '401–1,500' },
  { id: 'massive', label: '1,500+' },
];

export const RECOMMENDER_TEAM_OPTIONS: ReadonlyArray<{
  id: RecommenderTeamSize;
  label: string;
}> = [
  { id: 'solo', label: '1 operador' },
  { id: 'small', label: '2–3 usuarios' },
  { id: 'agency', label: '4–10 usuarios' },
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
  if (isPlanFree(matchedPlan)) return '$0';
  const showAnnual =
    recommendation.recommendedCycle === 'annual' || isPlanAnnualOnly(matchedPlan);
  return showAnnual
    ? `$${matchedPlan.annualPriceUsd.toLocaleString('en-US')}/año`
    : `$${matchedPlan.monthlyPriceUsd.toLocaleString('en-US')}/mes`;
}
