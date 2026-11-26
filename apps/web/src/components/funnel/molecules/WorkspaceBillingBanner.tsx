import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import type { WorkspacePlanStatusSnapshot } from '@/lib/funnel/billing-port';

export interface WorkspaceBillingBannerProps {
  status: WorkspacePlanStatusSnapshot;
  showActionLink?: boolean;
}

export function WorkspaceBillingBanner({
  status,
  showActionLink = true,
}: WorkspaceBillingBannerProps) {
  if (status.status === 'active') {
    return (
      <div className="px-4 py-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            <strong>Plan {status.planName} activo.</strong> Has usado {status.quotaUsed} de{' '}
            {status.quotaLimit.toLocaleString('en-US')} clasificaciones este mes.
          </span>
        </div>
        {showActionLink ? (
          <Link
            href="/app"
            className="font-semibold text-emerald-700 dark:text-emerald-300 underline-offset-2 hover:underline"
          >
            Ir al workspace
          </Link>
        ) : null}
      </div>
    );
  }

  if (status.status === 'pending_verification') {
    const ref = status.pendingActivation?.referenceCode;
    return (
      <div className="px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            <strong>Pago en verificación</strong>
            {ref ? ` (Ref. ${ref})` : ''}. Validaremos tu comprobante en menos de 24 horas hábiles.
          </span>
        </div>
        {showActionLink ? (
          <Link
            href="/app"
            className="font-semibold text-amber-800 dark:text-amber-300 underline-offset-2 hover:underline"
          >
            Seguir trabajando
          </Link>
        ) : null}
      </div>
    );
  }

  if (status.status === 'rejected') {
    return (
      <div className="px-4 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>No pudimos verificar tu último pago.</strong>{' '}
            {status.rejectionReason ?? 'Revisa la referencia y reporta nuevamente.'}
          </span>
        </div>
        {showActionLink ? (
          <Link
            href="/activate-plan"
            className="font-semibold text-rose-800 dark:text-rose-300 underline-offset-2 hover:underline"
          >
            Reportar de nuevo
          </Link>
        ) : null}
      </div>
    );
  }

  const isQuotaReached = status.status === 'quota_reached';
  return (
    <div className="px-4 py-3 rounded-xl border border-accent-border bg-accent-soft/60 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 text-ink-primary">
        <Sparkles className="w-4 h-4 text-accent-ink shrink-0" />
        <span>
          {isQuotaReached ? (
            <>
              <strong>Alcanzaste el límite de tu plan {status.planName}</strong> ({status.quotaUsed}/
              {status.quotaLimit}). Activa un plan comercial para continuar.
            </>
          ) : (
            <>
              Estás en <strong>{status.planName}</strong> ({status.quotaUsed}/{status.quotaLimit}{' '}
              clasificaciones usadas). Activa un plan para desbloquear mayor cuota y lotes.
            </>
          )}
        </span>
      </div>
      {showActionLink ? (
        <Link
          href="/activate-plan"
          className="font-semibold text-accent-ink underline-offset-2 hover:underline"
        >
          Activar plan
        </Link>
      ) : null}
    </div>
  );
}
