'use client';

import { X } from 'lucide-react';
import type { SkuPrecedent } from '@tariffos/shared-types';

export interface PredictiveSkuListProps {
  query: string;
  suggestions: readonly SkuPrecedent[];
  onSelect: (precedent: SkuPrecedent) => void;
  onDismiss: () => void;
}

export function PredictiveSkuList({
  query,
  suggestions,
  onSelect,
  onDismiss,
}: PredictiveSkuListProps) {
  if (suggestions.length === 0) return null;

  return (
    <section
      aria-label="Búsqueda predictiva arancelaria"
      className="mb-2 bg-surface-panel border border-border-subtle rounded-xl shadow-lg overflow-hidden"
    >
      <div className="px-3.5 py-2 border-b border-border-hairline bg-surface-muted flex items-center justify-between gap-3 text-[11px] text-ink-muted">
        <span className="font-medium text-ink-primary truncate">
          Precedentes SKU para «{query.trim()}»
        </span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar sugerencias predictivas"
          className="p-0.5 text-ink-subtle hover:text-ink-primary rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
      <div className="divide-y divide-border-hairline">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className="w-full px-3.5 py-2 text-left hover:bg-surface-hover transition-colors flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono font-bold text-ink-primary">{item.sku}</span>
                <span className="font-mono font-semibold text-accent-ink">{item.hsCode}</span>
              </div>
              <p className="text-xs text-ink-secondary truncate">{item.title}</p>
            </div>
            <span className="font-mono text-[10px] text-ink-muted shrink-0">
              AV {item.adValoremPercent}% · IVA {item.vatPercent}%
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
