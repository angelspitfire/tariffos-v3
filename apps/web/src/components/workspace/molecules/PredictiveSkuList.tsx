'use client';

import { X } from 'lucide-react';
import type { SkuPrecedent } from '@tariffos/shared-types';

export interface PredictiveSkuListProps {
  query: string;
  suggestions: readonly SkuPrecedent[];
  activeIndex?: number;
  listboxId?: string;
  onSelect: (precedent: SkuPrecedent) => void;
  onDismiss: () => void;
}

export function PredictiveSkuList({
  query,
  suggestions,
  activeIndex = -1,
  listboxId = 'predictive-sku-listbox',
  onSelect,
  onDismiss,
}: PredictiveSkuListProps) {
  if (suggestions.length === 0) return null;

  return (
    <section
      aria-label="Búsqueda predictiva arancelaria"
      className="mb-2 overflow-hidden rounded-xl border border-border-subtle bg-surface-panel shadow-lg"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border-hairline bg-surface-muted px-3.5 py-2 text-[11px] text-ink-muted">
        <span className="truncate font-medium text-ink-primary">
          Precedentes SKU para «{query.trim()}»
        </span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar sugerencias predictivas"
          className="cursor-pointer rounded p-0.5 text-ink-subtle transition-colors hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      <div
        id={listboxId}
        role="listbox"
        aria-label="Precedentes SKU sugeridos"
        className="divide-y divide-border-hairline"
      >
        {suggestions.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={item.id}
              id={`${listboxId}-option-${idx}`}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => onSelect(item)}
              className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-brand focus-visible:outline-none ${
                isActive
                  ? 'bg-surface-hover ring-1 ring-inset ring-accent-brand/40'
                  : 'hover:bg-surface-hover'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-ink-primary">{item.sku}</span>
                  <span translate="no" className="font-mono font-semibold text-accent-ink">
                    {item.hsCode}
                  </span>
                </div>
                <p className="truncate text-xs text-ink-secondary">{item.title}</p>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-ink-muted tabular-nums">
                AV {item.adValoremPercent}% · IVA {item.vatPercent}%
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
