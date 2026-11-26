'use client';

import { useState, type FormEvent } from 'react';
import type { AdminPlanRecord } from '@tariffos/shared-types';
import { X } from 'lucide-react';

export interface PlanFormModalProps {
  initial?: AdminPlanRecord | null;
  onClose: () => void;
  onSaved: (plan: AdminPlanRecord) => void;
}

export function PlanFormModal({ initial, onClose, onSaved }: PlanFormModalProps) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? '');
  const [displayName, setDisplayName] = useState(initial?.displayName ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [basePrice, setBasePrice] = useState(String(initial?.basePrice ?? 99));
  const [annualPriceUsd, setAnnualPriceUsd] = useState(String(initial?.annualPriceUsd ?? 990));
  const [classificationLimit, setClassificationLimit] = useState(String(initial?.classificationLimit ?? 150));
  const [maxUsers, setMaxUsers] = useState(String(initial?.maxUsers ?? 3));
  const [overagePrice, setOveragePrice] = useState(String(initial?.overagePrice ?? 0));
  const [allowOverage, setAllowOverage] = useState(initial?.allowOverage ?? false);
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? true);
  const [annualOnly, setAnnualOnly] = useState(initial?.annualOnly ?? false);
  const [featuresText, setFeaturesText] = useState((initial?.features ?? []).join('\n'));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...(isEdit ? {} : { name: name.trim().toLowerCase() }),
        displayName: displayName.trim(),
        description: description.trim() || undefined,
        basePrice: Number(basePrice),
        annualPriceUsd: Number(annualPriceUsd),
        annualOnly,
        classificationLimit: Number(classificationLimit),
        maxUsers: Number(maxUsers),
        overagePrice: Number(overagePrice),
        allowOverage,
        isPublic,
        features: featuresText.split('\n').map((l) => l.trim()).filter(Boolean),
      };
      const url = isEdit && initial ? `/api/admin/plans/${initial.id}` : '/api/admin/plans';
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { plan?: AdminPlanRecord; error?: string };
      if (!res.ok || !json.plan) {
        setError(json.error ?? 'No se pudo guardar el plan');
        return;
      }
      onSaved(json.plan);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-subtle bg-surface-panel p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-primary">
            {isEdit ? `Editar plan: ${initial?.displayName}` : 'Crear nuevo plan'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-ink-muted hover:text-ink-primary cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3 text-xs">
          {!isEdit && (
            <label className="block space-y-1">
              <span className="font-semibold text-ink-secondary">Slug identificador</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="ej. broker-vip" className={inputCls} />
            </label>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="font-semibold text-ink-secondary">Nombre visible</span>
              <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Broker VIP" className={inputCls} />
            </label>
            <label className="block space-y-1">
              <span className="font-semibold text-ink-secondary">Clasificaciones / mes</span>
              <input type="number" min={0} required value={classificationLimit} onChange={(e) => setClassificationLimit(e.target.value)} className={`${inputCls} font-mono`} />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="block space-y-1">
              <span className="font-semibold text-ink-secondary">Mensual ($)</span>
              <input type="number" min={0} step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className={`${inputCls} font-mono`} />
            </label>
            <label className="block space-y-1">
              <span className="font-semibold text-ink-secondary">Anual ($)</span>
              <input type="number" min={0} step="0.01" value={annualPriceUsd} onChange={(e) => setAnnualPriceUsd(e.target.value)} className={`${inputCls} font-mono`} />
            </label>
            <label className="block space-y-1">
              <span className="font-semibold text-ink-secondary">Máx. usuarios</span>
              <input type="number" min={1} value={maxUsers} onChange={(e) => setMaxUsers(e.target.value)} className={`${inputCls} font-mono`} />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="font-semibold text-ink-secondary">Descripción</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
          </label>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              <span className="text-ink-primary font-medium">Visible en landing pública</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={allowOverage} onChange={(e) => setAllowOverage(e.target.checked)} />
              <span className="text-ink-primary font-medium">Permitir overage (${overagePrice}/extra)</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={annualOnly} onChange={(e) => setAnnualOnly(e.target.checked)} />
              <span className="text-ink-primary font-medium">Solo anual</span>
            </label>
          </div>
          {allowOverage && (
            <label className="block space-y-1">
              <span className="font-semibold text-ink-secondary">Tarifa overage ($)</span>
              <input type="number" min={0} step="0.01" value={overagePrice} onChange={(e) => setOveragePrice(e.target.value)} className={`${inputCls} font-mono`} />
            </label>
          )}
          <label className="block space-y-1">
            <span className="font-semibold text-ink-secondary">Beneficios (uno por línea)</span>
            <textarea rows={3} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} className={inputCls} />
          </label>
          {error && <p className="text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg border border-border-strong text-ink-secondary hover:bg-surface-hover cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-accent-brand text-white font-semibold hover:bg-accent-brand-hover disabled:opacity-50 cursor-pointer">
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
