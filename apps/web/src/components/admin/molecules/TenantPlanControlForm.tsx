'use client';

import { useState, type FormEvent } from 'react';
import type { AdminPlanRecord, TenantBillingStatus } from '@tariffos/shared-types';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';

export interface TenantPlanControlFormProps {
  tenantId: string;
  currentPlanId: string | null;
  currentLimit: number;
  currentStatus: TenantBillingStatus;
  currentAllowOverage: boolean;
  plans: AdminPlanRecord[];
  onUpdated: () => void;
}

export function TenantPlanControlForm({
  tenantId,
  currentPlanId,
  currentLimit,
  currentStatus,
  currentAllowOverage,
  plans,
  onUpdated,
}: TenantPlanControlFormProps) {
  const [planId, setPlanId] = useState(currentPlanId ?? plans[0]?.id ?? 'pro');
  const [billingLimit, setBillingLimit] = useState(String(currentLimit));
  const [billingStatus, setBillingStatus] = useState<TenantBillingStatus>(currentStatus);
  const [allowOverage, setAllowOverage] = useState(currentAllowOverage);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handlePlanChange = (nextPlanId: string) => {
    setPlanId(nextPlanId);
    const matched = plans.find((p) => p.id === nextPlanId);
    if (matched) {
      setBillingLimit(String(matched.classificationLimit));
      setAllowOverage(matched.allowOverage);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 3) {
      setFeedback('Indica un motivo de al menos 3 caracteres.');
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingLimit: Number(billingLimit),
          billingStatus,
          allowOverage,
          reason: reason.trim(),
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        setFeedback(err.error ?? 'Error al actualizar tenant');
        return;
      }
      setReason('');
      setFeedback('Cambios guardados y auditados.');
      onUpdated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <FunnelCard padding="p-4" className="space-y-3">
      <h3 className="text-sm font-bold text-ink-primary">Plan, cuota y estado comercial</h3>
      <form onSubmit={(e) => void handleSubmit(e)} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <label className="block space-y-1">
          <span className="font-semibold text-ink-secondary">Plan asignado</span>
          <select
            value={planId}
            onChange={(e) => handlePlanChange(e.target.value)}
            className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName} (${p.basePrice} · {p.classificationLimit} clasif.)
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="font-semibold text-ink-secondary">Límite mensual (clasificaciones)</span>
          <input
            type="number"
            min={1}
            required
            value={billingLimit}
            onChange={(e) => setBillingLimit(e.target.value)}
            className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 font-mono text-ink-primary"
          />
        </label>
        <label className="block space-y-1">
          <span className="font-semibold text-ink-secondary">Estado comercial</span>
          <select
            value={billingStatus}
            onChange={(e) => setBillingStatus(e.target.value as TenantBillingStatus)}
            className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="TRIALING">TRIALING</option>
            <option value="PAST_DUE">PAST_DUE</option>
            <option value="CANCELED">CANCELED</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="font-semibold text-ink-secondary">Motivo del ajuste</span>
          <input
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. Upgrade negociado por soporte"
            className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
          />
        </label>
        <label className="sm:col-span-2 inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allowOverage}
            onChange={(e) => setAllowOverage(e.target.checked)}
          />
          <span className="text-ink-primary font-medium">Permitir consumo excedente (overage)</span>
        </label>
        <div className="sm:col-span-2 flex items-center justify-between gap-3 pt-1">
          <span className="text-ink-muted">{feedback ?? ''}</span>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-accent-brand text-white font-semibold hover:bg-accent-brand-hover disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Guardando...' : 'Aplicar cambios'}
          </button>
        </div>
      </form>
    </FunnelCard>
  );
}
