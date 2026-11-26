import { ArrowRight, Building2, Check } from 'lucide-react';
import type { SubscriptionPlanConfig } from '@tariffos/shared-types';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelButton } from '../atoms/FunnelButton';

export interface CorporatePlanBannerProps {
  plan: SubscriptionPlanConfig;
  isRecommended?: boolean;
  onSelect: () => void;
}

export function CorporatePlanBanner({
  plan,
  isRecommended = false,
  onSelect,
}: CorporatePlanBannerProps) {
  return (
    <div
      className={`p-6 rounded-[24px] border backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-colors ${
        isRecommended
          ? 'border-accent-brand bg-white/95 dark:bg-white/[0.08] ring-2 ring-accent-brand'
          : 'border-black/[0.07] dark:border-white/[0.09] bg-white/80 dark:bg-white/[0.045]'
      }`}
    >
      <div className="flex items-start gap-3.5 max-w-3xl">
        <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent-ink flex items-center justify-center shrink-0 mt-0.5">
          <Building2 className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-ink-primary">{plan.name}</h3>
            <FunnelBadge variant="neutral">Corporativo</FunnelBadge>
            {isRecommended ? (
              <FunnelBadge variant="accent">Recomendado para ti</FunnelBadge>
            ) : null}
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">{plan.description}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1">
            {plan.features.map((feat) => (
              <li key={feat} className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
                <Check className="w-3.5 h-3.5 text-accent-ink shrink-0" aria-hidden="true" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0">
        <div className="lg:text-right">
          <div className="text-2xl font-bold text-ink-primary tracking-tight">A medida</div>
          <div className="text-[11px] text-ink-muted">
            Según tipo de cliente y operación
          </div>
        </div>

        <FunnelButton
          variant={isRecommended ? 'primary' : 'outline'}
          size="md"
          rightIcon={<ArrowRight className="w-4 h-4" />}
          onClick={onSelect}
          className="min-h-[44px] rounded-full px-5 whitespace-nowrap"
        >
          Contactar
        </FunnelButton>
      </div>
    </div>
  );
}
