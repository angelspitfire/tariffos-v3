import { Check } from 'lucide-react';
import type {
  SubscriptionBillingCycle,
  SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import {
  isPlanAnnualOnly,
  isPlanCustomPricing,
  isPlanOneTime,
} from '@/lib/funnel/plan-recommender';
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
  const customPricing = isPlanCustomPricing(plan);
  const oneTime = isPlanOneTime(plan);
  const annualOnly = isPlanAnnualOnly(plan);
  const showAnnual = !customPricing && !oneTime && (annualOnly || billingCycle === 'annual');
  const price = showAnnual ? plan.annualPriceUsd : plan.monthlyPriceUsd;
  const monthlyEquiv =
    showAnnual && plan.annualPriceUsd > 0 ? Math.round(plan.annualPriceUsd / 12) : null;
  const isPopular = plan.planId === 'agencia';
  const unitCostUsd =
    !customPricing && !oneTime && plan.monthlyQuota > 0 && price > 0
      ? (showAnnual ? price / 12 : price) / plan.monthlyQuota
      : null;

  const ctaLabel = customPricing
    ? 'Contactar'
    : oneTime
      ? `Activar ${plan.name}`
      : `Elegir ${plan.name}`;

  return (
    <div
      className={`p-6 rounded-[24px] border flex flex-col justify-between gap-6 tos-card-lift ${
        isRecommended
          ? 'border-accent-brand bg-surface-panel ring-2 ring-accent-brand/75 tos-comet-border'
          : isPopular
            ? 'border-accent-brand/60 bg-surface-panel ring-1 ring-accent-brand/20 tos-comet-border'
            : 'border-border-subtle bg-surface-panel'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 min-h-[24px]">
          <h3 className="text-base font-bold text-ink-primary">{plan.name}</h3>
          {isRecommended ? (
            <FunnelBadge variant="accent">Recomendado</FunnelBadge>
          ) : isPopular ? (
            <FunnelBadge variant="accent">Más popular</FunnelBadge>
          ) : oneTime ? (
            <FunnelBadge variant="success">100% acreditable</FunnelBadge>
          ) : customPricing ? (
            <FunnelBadge variant="neutral">Corporativo</FunnelBadge>
          ) : annualOnly ? (
            <FunnelBadge variant="neutral">Solo anual</FunnelBadge>
          ) : null}
        </div>

        <div>
          {customPricing ? (
            <>
              <div className="text-3xl font-bold text-ink-primary tracking-tight">A medida</div>
              <div className="text-[11px] text-ink-muted mt-1">
                Volumen, usuarios y sucursales según tu operación
              </div>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
                <span className="text-3xl font-bold text-ink-primary">
                  ${price.toLocaleString('en-US')}
                </span>
                <span className="text-xs text-ink-muted">
                  {oneTime ? 'USD · pago único' : `USD/${showAnnual ? 'año' : 'mes'}`}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] font-mono text-ink-muted tabular-nums mt-1">
                {oneTime ? (
                  <>
                    <span>{plan.monthlyQuota.toLocaleString('en-US')} clasif.</span>
                    <span aria-hidden="true" className="h-3 w-px bg-border-subtle" />
                    <span>{plan.creditableDays ?? 30} días</span>
                    <span aria-hidden="true" className="h-3 w-px bg-border-subtle" />
                    <span>100% acreditable</span>
                  </>
                ) : monthlyEquiv !== null ? (
                  <>
                    <span>Equiv. ${monthlyEquiv.toLocaleString('en-US')}/mes</span>
                    <span aria-hidden="true" className="h-3 w-px bg-border-subtle" />
                    <span>Hasta {plan.monthlyQuota.toLocaleString('en-US')} clasif./mes</span>
                  </>
                ) : (
                  <>
                    <span>Hasta {plan.monthlyQuota.toLocaleString('en-US')} clasif./mes</span>
                    {unitCostUsd !== null ? (
                      <>
                        <span aria-hidden="true" className="h-3 w-px bg-border-subtle" />
                        <span>~${unitCostUsd.toFixed(2)}/clasif.</span>
                      </>
                    ) : null}
                  </>
                )}
              </div>
            </>
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
        onClick={() =>
          onSelect(
            plan.planId,
            customPricing ? 'custom' : showAnnual ? 'annual' : 'monthly',
          )
        }
      >
        {ctaLabel}
      </FunnelButton>
    </div>
  );
}
