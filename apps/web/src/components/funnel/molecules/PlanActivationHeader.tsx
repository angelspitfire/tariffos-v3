import Link from 'next/link';
import { ArrowLeft, CreditCard } from 'lucide-react';

export interface PlanActivationHeaderProps {
  errorMessage: string | null;
  onDismissError: () => void;
}

export function PlanActivationHeader({
  errorMessage,
  onDismissError,
}: PlanActivationHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-inverted text-ink-on-inverted flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-ink-primary">Activar plan comercial</h1>
            <p className="text-xs text-ink-muted">
              Facturación manual asistida: selecciona tu plan, realiza el pago y reporta la referencia.
            </p>
          </div>
        </div>

        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-strong bg-surface-panel hover:bg-surface-hover text-xs font-semibold text-ink-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a TariffOS
        </Link>
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
        >
          <span>{errorMessage}</span>
          <button type="button" onClick={onDismissError} className="font-semibold underline cursor-pointer">
            Cerrar
          </button>
        </div>
      ) : null}
    </>
  );
}
