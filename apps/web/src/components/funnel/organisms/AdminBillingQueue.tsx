'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, ShieldCheck } from 'lucide-react';
import type { ManualPaymentRecord, ManualPaymentStatus } from '@tariffos/shared-types';
import {
  createBillingActivationAdapter,
  type IBillingActivationPort,
} from '@/lib/funnel/billing-port';
import { FunnelCard } from '../atoms/FunnelCard';
import { PaymentQueueCard } from '../molecules/PaymentQueueCard';

export interface AdminBillingQueueProps {
  billingPort?: IBillingActivationPort;
}

export function AdminBillingQueue({ billingPort }: AdminBillingQueueProps) {
  const port = useMemo(
    () => billingPort ?? createBillingActivationAdapter(),
    [billingPort],
  );
  const [items, setItems] = useState<ManualPaymentRecord[]>([]);
  const [filter, setFilter] = useState<ManualPaymentStatus>('pending_verification');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    const list = await port.listPayments();
    setItems(list);
  }, [port]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const counts = useMemo(() => {
    const pending = items.filter((i) => i.status === 'pending_verification');
    const verified = items.filter((i) => i.status === 'verified');
    const rejected = items.filter((i) => i.status === 'rejected');
    const pendingAmount = pending.reduce((acc, i) => acc + i.amount, 0);
    return {
      pending: pending.length,
      verified: verified.length,
      rejected: rejected.length,
      pendingAmount,
    };
  }, [items]);

  const filtered = useMemo(
    () => items.filter((i) => i.status === filter),
    [filter, items],
  );

  const handleApprove = async (paymentId: string) => {
    setBusyId(paymentId);
    try {
      const updated = await port.approvePayment(paymentId);
      setItems((prev) =>
        prev.map((row) => (row.paymentId === updated.paymentId ? updated : row)),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (paymentId: string, reason: string) => {
    setBusyId(paymentId);
    try {
      const updated = await port.rejectPayment(paymentId, reason);
      setItems((prev) =>
        prev.map((row) => (row.paymentId === updated.paymentId ? updated : row)),
      );
    } finally {
      setBusyId(null);
    }
  };

  const tabs: ReadonlyArray<{ id: ManualPaymentStatus; label: string }> = [
    { id: 'pending_verification', label: `Pendientes (${counts.pending})` },
    { id: 'verified', label: `Verificados (${counts.verified})` },
    { id: 'rejected', label: `Rechazados (${counts.rejected})` },
  ];

  return (
    <div className="min-h-screen bg-surface-app py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-inverted text-ink-on-inverted flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-ink-primary">
                Cola de verificación de pagos manuales
              </h1>
              <p className="text-xs text-ink-muted">
                Revisa comprobantes reportados por clientes y activa sus planes al instante.
              </p>
            </div>
          </div>

          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-strong bg-surface-panel hover:bg-surface-hover text-xs font-semibold text-ink-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al workspace
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <FunnelCard padding="p-3.5">
            <div className="text-[11px] text-ink-muted">Pendientes</div>
            <div className="text-xl font-bold font-mono tabular-nums text-amber-700 dark:text-amber-400 mt-0.5">
              {counts.pending}
            </div>
          </FunnelCard>
          <FunnelCard padding="p-3.5">
            <div className="text-[11px] text-ink-muted">Monto pendiente</div>
            <div className="text-xl font-bold font-mono tabular-nums text-ink-primary mt-0.5">
              ${counts.pendingAmount.toLocaleString('en-US')}
            </div>
          </FunnelCard>
          <FunnelCard padding="p-3.5">
            <div className="text-[11px] text-ink-muted">Verificados</div>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5">
              {counts.verified}
            </div>
          </FunnelCard>
          <FunnelCard padding="p-3.5">
            <div className="text-[11px] text-ink-muted">Rechazados</div>
            <div className="text-xl font-bold font-mono tabular-nums text-rose-700 dark:text-rose-400 mt-0.5">
              {counts.rejected}
            </div>
          </FunnelCard>
        </div>

        <div
          role="tablist"
          aria-label="Filtrar solicitudes de pago"
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-surface-subtle rounded-lg"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-surface-panel text-ink-primary shadow-xs'
                  : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <FunnelCard padding="p-8" className="text-center space-y-2">
            <Clock className="w-6 h-6 text-ink-subtle mx-auto" />
            <div className="text-sm font-semibold text-ink-primary">
              Sin pagos en esta vista
            </div>
            <p className="text-xs text-ink-muted">
              Cuando un cliente reporte un pago manual en /activate-plan aparecerá aquí.
            </p>
          </FunnelCard>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <PaymentQueueCard
                key={item.paymentId}
                item={item}
                isBusy={busyId === item.paymentId}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
