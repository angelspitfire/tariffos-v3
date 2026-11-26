import { Clock } from 'lucide-react';
import type {
  SubscriptionBillingCycle,
  SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import { isPlanAnnualOnly } from '@/lib/funnel/plan-recommender';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelCard } from '../atoms/FunnelCard';

export interface PlanActivationSummaryProps {
  paidPlans: readonly SubscriptionPlanConfig[];
  selectedPlanId: string;
  recommendedPlanId: string | null;
  effectiveCycle: SubscriptionBillingCycle;
  activeAnnualOnly: boolean;
  activePlan?: SubscriptionPlanConfig;
  onSelectPlan: (plan: SubscriptionPlanConfig) => void;
  onChangeCycle: (cycle: 'monthly' | 'annual') => void;
}

export function PlanActivationSummary({
  paidPlans,
  selectedPlanId,
  recommendedPlanId,
  effectiveCycle,
  activeAnnualOnly,
  activePlan,
  onSelectPlan,
  onChangeCycle,
}: PlanActivationSummaryProps) {
  return (
    <div className="lg:col-span-5 space-y-4">
      <FunnelCard padding="p-4" className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-ink-primary">Plan a activar</span>
          <div className="inline-flex items-center gap-1 p-0.5 bg-surface-subtle rounded-lg">
            {(['monthly', 'annual'] as const).map((cycle) => {
              const disabled = cycle === 'monthly' && activeAnnualOnly;
              return (
                <button
                  key={cycle}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChangeCycle(cycle)}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    effectiveCycle === cycle
                      ? 'bg-surface-panel text-ink-primary shadow-xs'
                      : 'text-ink-muted hover:text-ink-primary'
                  }`}
                >
                  {cycle === 'monthly' ? 'Mensual' : 'Anual'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          {paidPlans.map((plan) => {
            const selected = plan.planId === selectedPlanId;
            const annualOnly = isPlanAnnualOnly(plan);
            const showAnnual = annualOnly || effectiveCycle === 'annual';
            const price = showAnnual ? plan.annualPriceUsd : plan.monthlyPriceUsd;

            return (
              <button
                key={plan.planId}
                type="button"
                onClick={() => onSelectPlan(plan)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  selected
                    ? 'border-accent-brand bg-accent-soft/60 ring-1 ring-accent-brand'
                    : 'border-border-subtle hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-ink-primary">{plan.name}</span>
                    {recommendedPlanId === plan.planId ? (
                      <FunnelBadge variant="accent">Recomendado</FunnelBadge>
                    ) : null}
                    {annualOnly ? (
                      <FunnelBadge variant="neutral">Solo anual</FunnelBadge>
                    ) : null}
                  </div>
                  <span className="font-mono text-sm font-bold text-ink-primary tabular-nums">
                    ${price.toLocaleString('en-US')}/{showAnnual ? 'año' : 'mes'}
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  Hasta {plan.monthlyQuota.toLocaleString('en-US')} clasificaciones/mes
                  {plan.maxUsers ? ` · hasta ${plan.maxUsers} usuarios` : ''}
                </p>
              </button>
            );
          })}
        </div>
      </FunnelCard>

      <FunnelCard padding="p-4" className="bg-surface-muted space-y-2.5">
        <div className="text-xs font-semibold text-ink-primary">
          Instrucciones de pago manual
        </div>
        <p className="text-[11px] text-ink-secondary whitespace-pre-line leading-relaxed">
          {activePlan?.paymentInstructions ||
            'Realiza el pago por Transferencia USD, Zelle, Pago Móvil, Binance Pay o Transferencia Bs. y reporta la referencia en el formulario.'}
        </p>
        <div className="pt-2 border-t border-border-hairline flex items-center gap-1.5 text-[11px] text-ink-muted">
          <Clock className="w-3.5 h-3.5 text-accent-ink shrink-0" />
          <span>Verificación y activación en menos de 24 horas hábiles.</span>
        </div>
      </FunnelCard>
    </div>
  );
}
