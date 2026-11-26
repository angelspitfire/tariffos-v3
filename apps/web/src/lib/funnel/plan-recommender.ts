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

const TIER_ORDER = ['trial', 'basico', 'pro', 'enterprise', 'corporate'] as const;

const HEADLINE_BY_PLAN: Record<string, string> = {
  trial: 'Empieza sin costo para comprobar la calidad técnica de TariffOS.',
  basico: 'Ajustado a operación individual con dictamen profesional RGI.',
  pro: 'Mejor relación capacidad/valor para agentes aduanales activos.',
  enterprise: 'Escala multi-usuario y multi-jurisdicción para agencias.',
  corporate: 'Máxima capacidad anual con acompañamiento y SLA corporativo.',
};

export function isPlanAnnualOnly(plan: SubscriptionPlanConfig): boolean {
  return Boolean(plan.annualOnly) || (plan.monthlyPriceUsd === 0 && plan.annualPriceUsd > 0);
}

export function isPlanFree(plan: SubscriptionPlanConfig): boolean {
  return plan.monthlyPriceUsd === 0 && plan.annualPriceUsd === 0;
}

function buildPlanReasons(
  planId: string,
  needsBatch: boolean,
  hasMultiJurisdiction: boolean,
): string[] {
  if (planId === 'trial') {
    return [
      'Valida la precisión RGI 1–6 y la ficha merceológica HITL sin compromiso.',
      'Activación inmediata con 5 clasificaciones completas y dictamen PDF.',
    ];
  }
  if (planId === 'basico') {
    return [
      'Cubre operaciones individuales de hasta 40 clasificaciones/mes con respaldo RGI.',
      'Incluye firma digital del agente y exportación de dictamen técnico PDF.',
    ];
  }
  if (planId === 'pro') {
    return [
      'Ideal para flujo regular (hasta 400 clasif./mes) y equipos de hasta 3 operadores.',
      needsBatch
        ? 'Desbloquea carga masiva por lotes (Excel/CSV) y triage de confianza.'
        : 'Incluye catálogo SKU corporativo, comparador histórico y alertas normativas.',
    ];
  }
  if (planId === 'enterprise') {
    return [
      'Soporta agencias de hasta 10 usuarios y hasta 1,500 clasificaciones mensuales.',
      hasMultiJurisdiction
        ? 'Incluye cobertura multi-jurisdicción con decretos oficiales publicados.'
        : 'Incorpora auditoría tributaria completa y validación acelerada.',
    ];
  }
  return [
    'Diseñado para operaciones masivas (hasta 5,000+ clasif./mes) y hasta 25 usuarios.',
    'Incluye SLA dedicado, onboarding asistido y carga inicial de catálogo SKU.',
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

  if (input.paidOnly && tierIndex === 0) {
    tierIndex = 1;
  }

  if (tierIndex > 0 || input.paidOnly || input.teamSize !== 'solo') {
    tierIndex = Math.max(tierIndex, TEAM_RANK[input.teamSize]);
  }

  if (capSet.has('batch')) tierIndex = Math.max(tierIndex, 2);
  if (capSet.has('multi_jurisdiction')) tierIndex = Math.max(tierIndex, 3);
  if (capSet.has('audit_sla')) tierIndex = Math.max(tierIndex, 4);

  const targetPlanId = TIER_ORDER[Math.min(tierIndex, TIER_ORDER.length - 1)] ?? 'pro';
  const matchedPlan =
    available.find((p) => p.planId === targetPlanId) ??
    available.find((p) => p.planId === 'pro') ??
    available[0] ??
    plans[0];

  const resolvedId = matchedPlan?.planId ?? targetPlanId;
  const annualOnly = matchedPlan ? isPlanAnnualOnly(matchedPlan) : false;
  const free = matchedPlan ? isPlanFree(matchedPlan) : false;
  const recommendedCycle: 'monthly' | 'annual' =
    annualOnly || (!free && capSet.has('annual_savings')) ? 'annual' : 'monthly';

  const reasons = buildPlanReasons(
    resolvedId,
    capSet.has('batch'),
    capSet.has('multi_jurisdiction'),
  );

  const annualSavingsUsd =
    matchedPlan && matchedPlan.monthlyPriceUsd > 0 && matchedPlan.annualPriceUsd > 0
      ? Math.max(0, matchedPlan.monthlyPriceUsd * 12 - matchedPlan.annualPriceUsd)
      : 0;

  if (annualOnly && matchedPlan) {
    const monthlyEquiv = Math.round(matchedPlan.annualPriceUsd / 12);
    reasons.push(`Licencia corporativa anual equivalente a $${monthlyEquiv}/mes.`);
  } else if (recommendedCycle === 'annual' && annualSavingsUsd > 0) {
    reasons.push(
      `Con pago anual ahorras $${annualSavingsUsd.toLocaleString()} USD al año (2 meses gratis).`,
    );
  }

  let estimatedUnitCostLabel: string | undefined;
  if (matchedPlan && !free && matchedPlan.monthlyQuota > 0) {
    const effectiveMonthly =
      recommendedCycle === 'annual' && matchedPlan.annualPriceUsd > 0
        ? matchedPlan.annualPriceUsd / 12
        : matchedPlan.monthlyPriceUsd;
    if (effectiveMonthly > 0) {
      const unitCost = effectiveMonthly / matchedPlan.monthlyQuota;
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
