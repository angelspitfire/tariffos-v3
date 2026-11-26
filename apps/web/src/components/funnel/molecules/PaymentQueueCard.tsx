'use client';

import { useState } from 'react';
import { CheckCircle2, FileText, XCircle } from 'lucide-react';
import type { ManualPaymentRecord } from '@tariffos/shared-types';
import { MANUAL_PAYMENT_METHOD_OPTIONS } from '@/lib/funnel/billing-port';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelButton } from '../atoms/FunnelButton';
import { FunnelCard } from '../atoms/FunnelCard';
import { FunnelInput } from '../atoms/FunnelField';

export interface PaymentQueueCardProps {
  item: ManualPaymentRecord;
  isBusy: boolean;
  onApprove: (paymentId: string) => Promise<void>;
  onReject: (paymentId: string, reason: string) => Promise<void>;
}

export function PaymentQueueCard({
  item,
  isBusy,
  onApprove,
  onReject,
}: PaymentQueueCardProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const isPending = item.status === 'pending_verification';
  const methodLabel =
    MANUAL_PAYMENT_METHOD_OPTIONS.find((m) => m.id === item.method)?.label ?? item.method;

  const handleConfirmReject = async () => {
    await onReject(item.paymentId, reason);
    setRejectOpen(false);
    setReason('');
  };

  return (
    <FunnelCard padding="p-4" className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-ink-primary">
              #{item.paymentId}
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
                ? 'Verificado y activo'
                : item.status === 'rejected'
                  ? 'Rechazado'
                  : 'Pendiente'}
            </FunnelBadge>
            <span className="text-xs font-semibold text-accent-ink">
              Plan {item.planName} ({item.billingCycle === 'annual' ? 'Anual' : 'Mensual'})
            </span>
          </div>

          <div className="text-xs text-ink-primary font-medium">
            {item.companyName || 'Operador independiente'}{' '}
            <span className="text-ink-muted font-normal">· {item.userEmail}</span>
          </div>

          <div className="text-[11px] text-ink-muted flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Medio: {methodLabel}</span>
            <span>
              Ref:{' '}
              <strong className="font-mono text-ink-primary">{item.referenceCode}</strong>
            </span>
            <span>Fecha pago: {item.paidAt}</span>
          </div>

          {item.notes ? (
            <p className="text-[11px] text-ink-secondary italic">“{item.notes}”</p>
          ) : null}

          {item.status === 'rejected' && item.rejectionReason ? (
            <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
              Motivo de rechazo: {item.rejectionReason}
            </p>
          ) : null}
        </div>

        <div className="text-right shrink-0 space-y-1.5">
          <div className="font-mono text-base font-bold text-ink-primary tabular-nums">
            ${item.amount.toLocaleString('en-US')} {item.currency}
          </div>
          {item.receiptStorageKey ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-accent-ink">
              <FileText className="w-3 h-3" />
              {item.receiptStorageKey}
            </span>
          ) : null}
        </div>
      </div>

      {isPending ? (
        <div className="pt-2.5 border-t border-border-hairline space-y-2.5">
          {rejectOpen ? (
            <div className="flex flex-wrap items-end gap-2">
              <FunnelInput
                label="Motivo del rechazo"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej. Referencia no localizada o monto incompleto"
                containerClassName="flex-1 min-w-[220px]"
              />
              <FunnelButton
                variant="danger"
                size="sm"
                isLoading={isBusy}
                onClick={() => void handleConfirmReject()}
              >
                Confirmar rechazo
              </FunnelButton>
              <FunnelButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectOpen(false);
                  setReason('');
                }}
              >
                Cancelar
              </FunnelButton>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <FunnelButton
                variant="outline"
                size="sm"
                disabled={isBusy}
                leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
                onClick={() => setRejectOpen(true)}
              >
                Rechazar
              </FunnelButton>
              <FunnelButton
                variant="primary"
                size="sm"
                isLoading={isBusy}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => void onApprove(item.paymentId)}
              >
                Aprobar y activar plan
              </FunnelButton>
            </div>
          )}
        </div>
      ) : null}
    </FunnelCard>
  );
}
