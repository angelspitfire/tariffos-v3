import { ArrowRight, Sparkles } from 'lucide-react';
import type { SubscriptionPlanConfig } from '@tariffos/shared-types';
import { isPlanFree } from '@/lib/funnel/plan-recommender';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelButton } from '../atoms/FunnelButton';

export interface TrialPlanBannerProps {
  plan: SubscriptionPlanConfig;
  isRecommended?: boolean;
  onSelect: () => void;
}

export function TrialPlanBanner({
  plan,
  isRecommended = false,
  onSelect,
}: TrialPlanBannerProps) {
  const free = isPlanFree(plan);

  return (
    <div
      className={`px-5 py-4 rounded-[20px] border backdrop-blur-md flex flex-wrap items-center justify-between gap-4 transition-colors ${
        isRecommended
          ? 'border-accent-brand bg-white/95 dark:bg-white/[0.08] ring-1 ring-accent-brand'
          : 'border-black/[0.06] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03]'
      }`}
    >
      <div className="flex items-start gap-3 max-w-2xl">
        <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent-ink flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-primary">
              {plan.name} — {plan.monthlyQuota.toLocaleString('en-US')} clasificaciones completas
            </span>
            <FunnelBadge variant="success">
              {free
                ? 'Gratis · Cortesía'
                : `$${plan.monthlyPriceUsd} USD · Pago único · 100% acreditable`}
            </FunnelBadge>
            {isRecommended ? (
              <FunnelBadge variant="accent">Recomendado para ti</FunnelBadge>
            ) : null}
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">{plan.description}</p>
        </div>
      </div>

      <FunnelButton
        variant={isRecommended ? 'primary' : 'outline'}
        size="md"
        rightIcon={<ArrowRight className="w-4 h-4" />}
        onClick={onSelect}
        className="min-h-[40px] rounded-full px-5 whitespace-nowrap"
      >
        {free ? `Empezar con ${plan.name}` : `Activar ${plan.name}`}
      </FunnelButton>
    </div>
  );
}
