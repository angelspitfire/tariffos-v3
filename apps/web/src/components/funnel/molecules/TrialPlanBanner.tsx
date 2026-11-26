import { ArrowRight, Sparkles } from 'lucide-react';
import type { SubscriptionPlanConfig } from '@tariffos/shared-types';
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
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
        isRecommended
          ? 'border-accent-brand bg-accent-soft/60 ring-1 ring-accent-brand'
          : 'border-border-subtle bg-surface-panel'
      }`}
    >
      <div className="flex items-start gap-3 max-w-2xl">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-ink-primary">
              {plan.name} — {plan.monthlyQuota} clasificaciones completas
            </span>
            <FunnelBadge variant="success">$0 · Sin tarjeta</FunnelBadge>
            {isRecommended ? (
              <FunnelBadge variant="accent">Recomendado para ti</FunnelBadge>
            ) : null}
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">{plan.description}</p>
        </div>
      </div>

      <FunnelButton
        variant="primary"
        size="md"
        rightIcon={<ArrowRight className="w-4 h-4" />}
        onClick={onSelect}
      >
        Empezar prueba gratis
      </FunnelButton>
    </div>
  );
}
