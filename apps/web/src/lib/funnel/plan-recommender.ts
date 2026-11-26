import type {
  SubscriptionBillingCycle,
  SubscriptionPlanConfig,
} from '@tariffos/shared-types';

export type RecommenderVolumeTier = 'trial' | 'low' | 'medium' | 'high' | 'massive';
export type RecommenderTeamSize = 'solo' | 'small' | 'agency' | 'corporate';
export type RecommenderCapability =
  | 'batch'
  | 'multi_jurisdiction'
  | 'audit_sla'
  | 'annual_savings';

export interface PlanRecommenderInput {
  monthlyVolume: RecommenderVolumeTier;
  teamSize: RecommenderTeamSize;
  needsBatch: boolean;
  capabilities?: RecommenderCapability[];
  paidOnly?: boolean;
}

export interface PlanRecommendation {
  planId: string;
  planName: string;
  recommendedCycle: Extract<SubscriptionBillingCycle, 'monthly' | 'annual'>;
  headline: string;
  reasons: string[];
  annualSavingsUsd: number;
  estimatedUnitCostLabel?: string;
}

const VOLUME_RANK: Record<RecommenderVolumeTier, number> = {
  trial: 0,
  low: 1,
  medium: 2,
  high: 3,
  massive: 4,
};

const TEAM_RANK: Record<RecommenderTeamSize, number> = {
  solo: 1,
  small: 2,
  agency: 3,
  corporate: 4,
};

const TIER_ORDER = ['pilot', 'agencia', 'enterprise'] as const;

const HEADLINE_BY_PLAN: Record<string, string> = {
  pilot: 'Valida TariffOS con facturas reales y acredita el 100% al pasar a Agencia.',
  agencia: 'Estación arancelaria completa para agencias activas con lotes y catálogo SKU.',
  enterprise: 'Despliegue a medida para grandes agencias, navieras y corporativos.',
};

export function isPlanAnnualOnly(plan: SubscriptionPlanConfig): boolean {
  return Boolean(plan.annualOnly) || (plan.monthlyPriceUsd === 0 && plan.annualPriceUsd > 0);
}

export function isPlanOneTime(plan: SubscriptionPlanConfig): boolean {
  return Boolean(plan.oneTimeOnly);
}

export function isPlanCustomPricing(plan: SubscriptionPlanConfig): boolean {
  return Boolean(plan.customPricing) || plan.planId === 'corporate';
}

export function isPlanFree(plan: SubscriptionPlanConfig): boolean {
  return !plan.customPricing && plan.monthlyPriceUsd === 0 && plan.annualPriceUsd === 0;
}

function buildPlanReasons(
  planId: string,
  needsBatch: boolean,
  hasMultiJurisdiction: boolean,
): string[] {
  if (planId === 'pilot') {
    return [
      '250 clasificaciones vitalicias con lotes Excel/CSV, cálculo CIF y dictámenes PDF.',
      'Pago único de $150 USD: 100% acreditable al primer mes del Plan Agencia en 30 días.',
    ];
  }
  if (planId === 'agencia') {
    return [
      'Hasta 1,000 clasificaciones/mes y hasta 5 usuarios con firma digital y patente.',
      needsBatch
        ? 'Incluye carga masiva por lotes (Excel/CSV), triage de confianza y catálogo SKU.'
        : 'Incluye catálogo SKU corporativo, calculadora tributaria CIF y dictámenes PDF firmables.',
    ];
  }
  return [
    'Volumen, usuarios multi-sucursal y carga inicial de catálogo SKU definidos a medida.',
    hasMultiJurisdiction
      ? 'Soporte multi-jurisdicción con decretos oficiales y SLA dedicado.'
      : 'Incluye auditoría tributaria completa, integraciones y acompañamiento corporativo.',
  ];
}

export function recommendSubscriptionPlan(
  input: PlanRecommenderInput,
  plans: readonly SubscriptionPlanConfig[],
): PlanRecommendation {
  const available = plans.filter((p) => p.published && (!input.paidOnly || !isPlanFree(p)));
  const capSet = new Set<RecommenderCapability>(input.capabilities ?? []);
  if (input.needsBatch) {
    capSet.add('batch');
  }

  let tierIndex = VOLUME_RANK[input.monthlyVolume];

  if (tierIndex > 0 && tierIndex <= 2) {
    tierIndex = 1; // low or medium -> agencia
  } else if (tierIndex >= 3) {
    tierIndex = 2; // high or massive -> enterprise
  }

  if (TEAM_RANK[input.teamSize] >= 3) {
    tierIndex = Math.max(tierIndex, 2);
  } else if (TEAM_RANK[input.teamSize] === 2) {
    tierIndex = Math.max(tierIndex, 1);
  }

  if (capSet.has('batch')) tierIndex = Math.max(tierIndex, 1);
  if (capSet.has('multi_jurisdiction') || capSet.has('audit_sla')) {
    tierIndex = Math.max(tierIndex, 2);
  }

  const targetPlanId = TIER_ORDER[Math.min(tierIndex, TIER_ORDER.length - 1)] ?? 'agencia';
  const matchedPlan =
    available.find((p) => p.planId === targetPlanId) ??
    available.find((p) => p.planId === 'agencia') ??
    available[0] ??
    plans[0];

  const resolvedId = matchedPlan?.planId ?? targetPlanId;
  const annualOnly = matchedPlan ? isPlanAnnualOnly(matchedPlan) : false;
  const oneTime = matchedPlan ? isPlanOneTime(matchedPlan) : false;
  const custom = matchedPlan ? isPlanCustomPricing(matchedPlan) : false;
  const free = matchedPlan ? isPlanFree(matchedPlan) : false;
  const recommendedCycle: 'monthly' | 'annual' =
    annualOnly || (!free && !oneTime && !custom && capSet.has('annual_savings'))
      ? 'annual'
      : 'monthly';

  const reasons = buildPlanReasons(
    resolvedId,
    capSet.has('batch'),
    capSet.has('multi_jurisdiction'),
  );

  const annualSavingsUsd =
    matchedPlan && matchedPlan.monthlyPriceUsd > 0 && matchedPlan.annualPriceUsd > 0
      ? Math.max(0, matchedPlan.monthlyPriceUsd * 12 - matchedPlan.annualPriceUsd)
      : 0;

  if (recommendedCycle === 'annual' && annualSavingsUsd > 0) {
    reasons.push(
      `Con pago anual ahorras $${annualSavingsUsd.toLocaleString()} USD al año (2 meses gratis).`,
    );
  }

  let estimatedUnitCostLabel: string | undefined;
  if (matchedPlan && !free && !custom && matchedPlan.monthlyQuota > 0) {
    const effectiveAmount = oneTime
      ? matchedPlan.monthlyPriceUsd
      : recommendedCycle === 'annual' && matchedPlan.annualPriceUsd > 0
        ? matchedPlan.annualPriceUsd / 12
        : matchedPlan.monthlyPriceUsd;
    if (effectiveAmount > 0) {
      const unitCost = effectiveAmount / matchedPlan.monthlyQuota;
      estimatedUnitCostLabel = `~$${unitCost.toFixed(2)} USD / clasificación al tope de cuota`;
    }
  }

  return {
    planId: resolvedId,
    planName: matchedPlan?.name ?? resolvedId,
    recommendedCycle,
    headline:
      HEADLINE_BY_PLAN[resolvedId] ?? 'Plan recomendado según el perfil de tu operación.',
    reasons: reasons.slice(0, 3),
    annualSavingsUsd,
    estimatedUnitCostLabel,
  };
}
