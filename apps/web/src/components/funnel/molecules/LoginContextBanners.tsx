import { ArrowRight, Sparkles } from 'lucide-react';
import type { SubscriptionPlanConfig } from '@tariffos/shared-types';

export interface LoginContextBannersProps {
  effectivePlan?: SubscriptionPlanConfig;
  pendingQuery: string | null;
}

export function LoginContextBanners({
  effectivePlan,
  pendingQuery,
}: LoginContextBannersProps) {
  return (
    <>
      {effectivePlan ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-accent-border bg-accent-soft/45 px-3 py-2 text-xs text-ink-primary">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-accent-ink" aria-hidden="true" />
            <span>
              Activando: <strong>{effectivePlan.name}</strong>
            </span>
          </span>
          <span className="font-mono font-semibold text-accent-ink tabular-nums">
            ${effectivePlan.monthlyPriceUsd}
            {effectivePlan.oneTimeOnly ? ' único' : '/mes'}
          </span>
        </div>
      ) : null}

      {pendingQuery ? (
        <div className="flex items-start gap-2 rounded-xl border border-accent-border bg-accent-soft/50 p-3 text-xs text-ink-secondary">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" />
          <span>
            Guardamos tu consulta (<strong className="text-ink-primary">«{pendingQuery}»</strong>) para clasificarla en cuanto actives tu cuenta.
          </span>
        </div>
      ) : null}
    </>
  );
}
