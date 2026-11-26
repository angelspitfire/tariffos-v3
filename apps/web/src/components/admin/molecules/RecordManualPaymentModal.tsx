'use client';

import { useState, type FormEvent } from 'react';
import type { AdminPlanRecord, AdminTenantSummary, ManualPaymentMethod } from '@tariffos/shared-types';
import { X } from 'lucide-react';

export interface RecordManualPaymentModalProps {
  tenants: AdminTenantSummary[];
  plans: AdminPlanRecord[];
  onClose: () => void;
  onRecorded: () => void;
}

export function RecordManualPaymentModal({
  tenants,
  plans,
  onClose,
  onRecorded,
}: RecordManualPaymentModalProps) {
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? '');
  const [planId, setPlanId] = useState(plans[0]?.id ?? 'pro');
  const [amount, setAmount] = useState('299');
  const [method, setMethod] = useState<ManualPaymentMethod>('zelle');
  const [referenceCode, setReferenceCode] = useState('');
  const [notes, setNotes] = useState('');
  const [autoApprove, setAutoApprove] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/billing/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          planId,
          billingCycle: 'monthly',
          amount: Number(amount),
          currency: 'USD',
          method,
          referenceCode: referenceCode.trim(),
          notes: notes.trim() || undefined,
          autoApprove,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? 'Error al registrar el pago');
        return;
      }
      onRecorded();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-panel p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-primary">Registrar pago recibido fuera de la app</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-ink-muted hover:text-ink-primary cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3 text-xs">
          <label className="block space-y-1">
            <span className="font-semibold text-ink-secondary">Tenant / Agencia</span>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.ownerEmail ?? t.id})
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="font-semibold text-ink-secondary">Plan a activar</span>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName} (${p.basePrice})
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="font-semibold text-ink-secondary">Monto (USD)</span>
              <input
                type="number"
                min={1}
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 font-mono text-ink-primary"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="font-semibold text-ink-secondary">Método</span>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as ManualPaymentMethod)}
                className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
              >
                <option value="zelle">Zelle</option>
                <option value="transferencia_usd">Transferencia USD</option>
                <option value="binance_pay">Binance Pay</option>
                <option value="pago_movil">Pago Móvil</option>
                <option value="efectivo">Efectivo</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="font-semibold text-ink-secondary">Referencia</span>
              <input
                required
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                placeholder="ZEL-123456"
                className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 font-mono text-ink-primary"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="font-semibold text-ink-secondary">Nota interna</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Confirmado por WhatsApp"
              className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
            />
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} />
            <span className="text-ink-primary font-medium">Aprobar y activar plan inmediatamente</span>
          </label>
          {error && <p className="text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg border border-border-strong text-ink-secondary cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !tenantId}
              className="px-4 py-2 rounded-lg bg-accent-brand text-white font-semibold hover:bg-accent-brand-hover disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Registrando...' : 'Registrar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
