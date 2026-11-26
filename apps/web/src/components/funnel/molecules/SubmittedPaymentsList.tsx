import type { ManualPaymentRecord } from '@tariffos/shared-types';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelCard } from '../atoms/FunnelCard';

export interface SubmittedPaymentsListProps {
  payments: readonly ManualPaymentRecord[];
}

export function SubmittedPaymentsList({ payments }: SubmittedPaymentsListProps) {
  if (payments.length === 0) return null;

  return (
    <FunnelCard padding="p-4" className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
        Reportes de pago registrados
      </h2>
      <div className="divide-y divide-border-hairline">
        {payments.slice(0, 5).map((item) => (
          <div
            key={item.paymentId}
            className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-semibold text-ink-primary">
                {item.referenceCode}
              </span>
              <span className="text-ink-muted">· Plan {item.planName}</span>
              <span className="text-ink-subtle">({item.paidAt})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-ink-primary tabular-nums">
                ${item.amount.toLocaleString('en-US')} {item.currency}
              </span>
              <FunnelBadge
                variant={
                  item.status === 'verified'
                    ? 'success'
                    : item.status === 'rejected'
                      ? 'danger'
                      : 'warning'
                }
              >
                {item.status === 'verified'
                  ? 'Verificado'
                  : item.status === 'rejected'
                    ? 'Rechazado'
                    : 'Por verificar'}
              </FunnelBadge>
            </div>
          </div>
        ))}
      </div>
    </FunnelCard>
  );
}
