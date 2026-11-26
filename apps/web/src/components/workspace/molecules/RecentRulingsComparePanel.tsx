'use client';

import { useState } from 'react';
import { Columns3 } from 'lucide-react';
import type { RecentRulingItem } from '@/lib/workspace/analytics-metrics';

export interface RecentRulingsComparePanelProps {
  rulings: readonly RecentRulingItem[];
}

export function RecentRulingsComparePanel({ rulings }: RecentRulingsComparePanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    rulings.slice(0, 2).map((r) => r.id),
  );

  if (rulings.length < 2) {
    return (
      <div className="rounded-xl border border-dashed border-border-subtle bg-surface-panel p-6 text-center text-xs text-ink-muted">
        Se necesitan al menos 2 dictámenes emitidos en tus conversaciones para comparar resoluciones lado a lado.
      </div>
    );
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.length > 1 ? prev.filter((x) => x !== id) : prev;
      return [...prev.slice(-2), id];
    });
  };

  const compared = rulings.filter((r) => selectedIds.includes(r.id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-subtle bg-surface-panel p-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-ink-primary">
          <Columns3 className="h-4 w-4 text-accent-ink" aria-hidden="true" />
          <span>Selecciona hasta 3 dictámenes recientes para comparar</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {rulings.map((item) => {
            const active = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSelection(item.id)}
                className={`cursor-pointer rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                  active
                    ? 'bg-surface-inverted text-ink-on-inverted'
                    : 'border border-border-subtle bg-surface-muted text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {item.hsCode}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {compared.map((item) => (
          <article
            key={item.id}
            className="space-y-2.5 rounded-xl border border-border-subtle bg-surface-panel p-4 text-xs shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-bold text-accent-ink">{item.hsCode}</span>
              <span className="rounded-full bg-surface-muted px-2 py-0.5 font-mono text-[10px] text-ink-secondary">
                {item.reviewStatus}
              </span>
            </div>
            <div className="font-semibold text-ink-primary">{item.title}</div>
            <div className="text-[11px] text-ink-muted">Conversación: {item.threadTitle}</div>
            <div className="grid grid-cols-2 gap-2 border-t border-border-hairline pt-2 text-[11px]">
              <div>
                <span className="text-ink-muted">Ad Valorem:</span>{' '}
                <strong className="font-mono text-ink-primary">
                  {item.adValoremPercent !== undefined ? `${item.adValoremPercent}%` : '—'}
                </strong>
              </div>
              <div>
                <span className="text-ink-muted">IVA:</span>{' '}
                <strong className="font-mono text-ink-primary">
                  {item.vatPercent !== undefined ? `${item.vatPercent}%` : '—'}
                </strong>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
