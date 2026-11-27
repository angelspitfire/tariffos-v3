import { Sparkles } from 'lucide-react';
import type { SubscriptionBillingCycle, SubscriptionPlanConfig } from '@tariffos/shared-types';
import type { EligiblePilotCredit } from '@/lib/funnel/pilot-credit';

export interface PlanActivationFormHeaderProps {
  activePlan?: SubscriptionPlanConfig;
  effectiveCycle: SubscriptionBillingCycle;
  rawAmount?: number;
  expectedAmount: number;
  appliedPilotCredit?: EligiblePilotCredit | null;
  errorMsg: string | null;
}

export function PlanActivationFormHeader({
  activePlan,
  effectiveCycle,
  rawAmount,
  expectedAmount,
  appliedPilotCredit,
  errorMsg,
}: PlanActivationFormHeaderProps) {
  return (
    <>
      <div>
        <h2 className="text-sm font-semibold text-ink-primary">Reportar pago y solicitar activación</h2>
        <p className="text-xs text-ink-muted mt-0.5">
          Monto sugerido:{' '}
          <strong className="font-mono text-ink-primary tabular-nums">
            ${expectedAmount.toLocaleString('en-US')} {activePlan?.currency ?? 'USD'}
          </strong>{' '}
          ({activePlan?.oneTimeOnly
            ? 'pago único · 100% acreditable a Agencia en 30 días'
            : effectiveCycle === 'annual'
              ? 'facturación anual'
              : 'facturación mensual'}).
        </p>
      </div>

      {appliedPilotCredit ? (
        <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>Crédito Piloto de ${appliedPilotCredit.amountUsd} aplicado automáticamente:</strong>{' '}
            Plan ${rawAmount ?? expectedAmount + appliedPilotCredit.amountUsd} − ${appliedPilotCredit.amountUsd} ={' '}
            <strong className="font-mono">${expectedAmount} USD</strong> a transferir hoy.
          </span>
        </div>
      ) : null}

      {errorMsg ? (
        <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/35 text-xs text-rose-800 dark:text-rose-300 font-medium">
          {errorMsg}
        </div>
      ) : null}
    </>
  );
}
