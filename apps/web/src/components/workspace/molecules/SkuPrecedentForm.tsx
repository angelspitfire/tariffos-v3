'use client';

import { useState } from 'react';
import type { SkuPrecedent } from '@tariffos/shared-types';
import { normalizeSkuKey } from '@/lib/workspace/persistence';

export interface SkuPrecedentFormProps {
  initialItem?: SkuPrecedent;
  jurisdictionId: string;
  onSave: (precedent: SkuPrecedent) => void;
  onCancel: () => void;
}

const FIELD_CLS =
  'rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5 text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none';

/** Inline form to create or update a SKU tariff precedent inside SkuCatalogModal. */
export function SkuPrecedentForm({
  initialItem,
  jurisdictionId,
  onSave,
  onCancel,
}: SkuPrecedentFormProps) {
  const [sku, setSku] = useState(initialItem?.sku ?? '');
  const [title, setTitle] = useState(initialItem?.title ?? '');
  const [hsCode, setHsCode] = useState(initialItem?.hsCode ?? '');
  const [adValorem, setAdValorem] = useState(String(initialItem?.adValoremPercent ?? 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !hsCode.trim()) return;
    const now = new Date().toISOString();
    onSave({
      id: initialItem?.id ?? `sku-${Date.now()}`,
      sku: sku.trim(),
      normalizedSku: normalizeSkuKey(sku),
      title: title.trim() || sku.trim(),
      description: title.trim() || sku.trim(),
      hsCode: hsCode.trim(),
      jurisdictionId: initialItem?.jurisdictionId ?? jurisdictionId,
      adValoremPercent: Number(adValorem) || 0,
      vatPercent: initialItem?.vatPercent ?? 16,
      legalRegime: initialItem?.legalRegime ?? 'Libre',
      reviewStatus: initialItem?.reviewStatus ?? 'approved',
      usageCount: initialItem?.usageCount ?? 1,
      createdAt: initialItem?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-2 border-b border-border-subtle bg-surface-muted px-5 py-3 text-xs sm:grid-cols-4"
    >
      <input
        required
        aria-label="Código SKU"
        placeholder="Código SKU"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
        className={FIELD_CLS}
      />
      <input
        required
        aria-label="Descripción breve"
        placeholder="Descripción breve"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={`${FIELD_CLS} sm:col-span-2`}
      />
      <input
        required
        aria-label="Partida arancelaria"
        placeholder="Partida (ej. 8504.40.90.00)"
        spellCheck={false}
        value={hsCode}
        onChange={(e) => setHsCode(e.target.value)}
        className={`${FIELD_CLS} font-mono`}
      />
      <div className="flex items-center justify-end gap-2 sm:col-span-4">
        <input
          type="number"
          value={adValorem}
          onChange={(e) => setAdValorem(e.target.value)}
          aria-label="Ad Valorem %"
          className={`${FIELD_CLS} w-20 px-2 py-1 font-mono tabular-nums`}
        />
        <span className="text-[11px] text-ink-muted">% AV</span>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg border border-border-subtle bg-surface-panel px-2.5 py-1.5 font-medium text-ink-secondary transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        >
          Guardar precedente
        </button>
      </div>
    </form>
  );
}
