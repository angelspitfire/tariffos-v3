import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import type { ManualPaymentRecord } from '@tariffos/shared-types';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelCard } from '../atoms/FunnelCard';

export interface PaymentSubmittedBannerProps {
  payment: ManualPaymentRecord;
}

export function PaymentSubmittedBanner({ payment }: PaymentSubmittedBannerProps) {
  return (
    <FunnelCard
      padding="p-5"
      className="border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/25 flex flex-wrap items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <div className="text-sm font-bold text-ink-primary">
            Solicitud de activación recibida
          </div>
          <p className="text-xs text-ink-secondary">
            Registramos tu reporte para el plan <strong>{payment.planName}</strong> (Ref.{' '}
            <span className="font-mono font-semibold">{payment.referenceCode}</span>). Verificaremos el pago en menos de 24h hábiles y recibirás confirmación por correo.
          </p>
          <p className="text-[11px] text-ink-muted">
            Tu espacio permanecerá en modo lectura mientras verificamos tu pago (menos de 24h hábiles). ¿Urgente? Escríbenos a{' '}
            <a href="mailto:soporte@tariffos.app" className="font-medium text-accent-ink hover:underline">
              soporte@tariffos.app
            </a>{' '}
            indicando tu referencia.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <FunnelBadge variant="warning">Pendiente de verificación</FunnelBadge>
        <Link
          href="/app"
          className="px-3 py-1.5 rounded-lg bg-ink-primary text-ink-on-inverted text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Ir al workspace
        </Link>
      </div>
    </FunnelCard>
  );
}
