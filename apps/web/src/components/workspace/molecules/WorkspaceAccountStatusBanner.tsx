import Link from 'next/link';
import { AlertTriangle, Ban } from 'lucide-react';
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
          href="mailto:soporte@tariffos.com"
          className="font-semibold underline underline-offset-2 hover:opacity-80"
        >
          Contactar soporte
        </a>
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
