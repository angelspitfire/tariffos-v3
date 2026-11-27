import Link from 'next/link';
import { AlertTriangle, Ban, Clock } from 'lucide-react';
import type { ClientCurrentUsageSnapshot } from '@tariffos/shared-types';

export function WorkspaceAccountStatusBanner({
  usage,
}: {
  usage: ClientCurrentUsageSnapshot | null;
}) {
  if (!usage) return null;

  if (usage.billingStatus === 'CANCELED') {
    return (
      <div
        role="alert"
        className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/30 bg-rose-500/12 px-4 py-2 text-xs text-rose-800 dark:text-rose-200"
      >
        <div className="flex items-center gap-2 font-medium">
          <Ban className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            <strong>Cuenta dada de baja.</strong> Tus clasificaciones están bloqueadas; puedes consultar dictámenes históricos o contactar a soporte.
          </span>
        </div>
        <a
          href="mailto:soporte@tariffos.app"
          className="font-semibold underline underline-offset-2 hover:opacity-80"
        >
          Contactar soporte
        </a>
      </div>
    );
  }

  if (usage.billingStatus === 'PAST_DUE' && usage.latestPayment?.status === 'pending_verification') {
    return (
      <div
        role="status"
        className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/30 bg-emerald-500/12 px-4 py-2 text-xs text-emerald-900 dark:text-emerald-200"
      >
        <div className="flex items-center gap-2 font-medium">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            <strong>Pago recibido en verificación</strong> (Ref.{' '}
            <span className="font-mono">{usage.latestPayment.referenceCode}</span> ·{' '}
            {usage.latestPayment.planName}). Tu estación se habilitará al confirmarse.
          </span>
        </div>
        <Link href="/activate-plan" className="font-semibold underline underline-offset-2 hover:opacity-80">
          Ver estado
        </Link>
      </div>
    );
  }

  if (usage.billingStatus === 'PAST_DUE' && usage.latestPayment?.status === 'rejected') {
    return (
      <div
        role="alert"
        className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/30 bg-rose-500/12 px-4 py-2 text-xs text-rose-900 dark:text-rose-200"
      >
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            <strong>Pago rechazado (Ref. {usage.latestPayment.referenceCode}):</strong>{' '}
            {usage.latestPayment.rejectionReason ?? 'verifica tu referencia y comprobante.'}
          </span>
        </div>
        <Link href="/activate-plan" className="font-semibold underline underline-offset-2 hover:opacity-80">
          Corregir comprobante
        </Link>
      </div>
    );
  }

  if (usage.billingStatus === 'PAST_DUE' && usage.limit === 0) {
    return (
      <div
        role="alert"
        className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-accent-border bg-accent-soft/65 px-4 py-2 text-xs text-ink-primary"
      >
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-accent-ink" aria-hidden="true" />
          <span>
            <strong>Modo lectura activo.</strong> Activa tu Piloto Operativo ($150 · 250 clasificaciones) o Plan Agencia ($300/mes) para clasificar con IA.
          </span>
        </div>
        <Link href="/activate-plan?plan=pilot" className="font-semibold text-accent-ink underline underline-offset-2 hover:opacity-80">
          Activar plan
        </Link>
      </div>
    );
  }

  if (usage.billingStatus === 'PAST_DUE') {
    return (
      <div
        role="alert"
        className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 bg-amber-500/12 px-4 py-2 text-xs text-amber-900 dark:text-amber-200"
      >
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            <strong>Pago pendiente de regularización.</strong> Reporta tu comprobante para restablecer las clasificaciones.
          </span>
        </div>
        <Link href="/activate-plan" className="font-semibold underline underline-offset-2 hover:opacity-80">
          Activar plan
        </Link>
      </div>
    );
  }

  if (!usage.allowOverage && usage.percentUsed >= 80) {
    return (
      <div className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/25 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-900 dark:text-amber-200">
        <span>
          Has usado el <strong>{usage.percentUsed}%</strong> de tu cuota mensual ({usage.used}/{usage.limit}) en <strong>{usage.planName}</strong>.
        </span>
        <Link href="/activate-plan" className="font-semibold underline underline-offset-2 hover:opacity-80">
          Ampliar plan
        </Link>
      </div>
    );
  }

  return null;
}
