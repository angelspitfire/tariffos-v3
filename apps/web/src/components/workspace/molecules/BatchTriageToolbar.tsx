'use client';

import { CheckCircle2, Search, Zap } from 'lucide-react';
import { formatCurrencyAmount } from '@/lib/workspace/format-locale';

export type BatchStatusFilter = 'all' | 'needs_review' | 'classified';

interface BatchTriageToolbarProps {
  title: string;
  currencyCode: string;
  totalCount: number;
  pendingCount: number;
  totalFob: number;
  statusFilter: BatchStatusFilter;
  searchQuery: string;
  onStatusFilterChange: (filter: BatchStatusFilter) => void;
  onSearchChange: (query: string) => void;
  onStartTriage: () => void;
}

export function BatchTriageToolbar({
  title,
  currencyCode,
  totalCount,
  pendingCount,
  totalFob,
  statusFilter,
  searchQuery,
  onStatusFilterChange,
  onSearchChange,
  onStartTriage,
}: BatchTriageToolbarProps) {
  const classifiedCount = totalCount - pendingCount;
  const filters: ReadonlyArray<{ id: BatchStatusFilter; label: string; count: number }> = [
    { id: 'all', label: 'Todos', count: totalCount },
    { id: 'needs_review', label: 'Pendientes', count: pendingCount },
    { id: 'classified', label: 'Clasificados', count: classifiedCount },
  ];

  return (
    <section className="space-y-3 rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-primary">{title}</h3>
          <p className="mt-0.5 text-xs text-ink-muted tabular-nums">
            {totalCount} ítems · {classifiedCount} clasificados ·{' '}
            <span className="font-mono">
              {formatCurrencyAmount(currencyCode, totalFob, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </span>
          </p>
        </div>

        {pendingCount > 0 ? (
          <button
            type="button"
            onClick={onStartTriage}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700 focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            Iniciar Triage rápido ({pendingCount} pendientes)
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Lote 100% verificado
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-hairline pt-3">
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filtrar por estado">
          {filters.map((filter) => {
            const active = statusFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={active}
                onClick={() => onStatusFilterChange(filter.id)}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${
                  active
                    ? 'bg-accent-soft text-accent-ink ring-1 ring-accent-border'
                    : 'bg-surface-muted text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            );
          })}
        </div>

        <label className="relative flex min-w-48 flex-1 items-center sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-ink-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            name="batchSearch"
            aria-label="Buscar ítem en manifiesto"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar SKU, descripción o SA…"
            className="w-full rounded-lg border border-border-subtle bg-surface-input py-1.5 pr-2.5 pl-8 text-xs text-ink-primary focus:border-accent-brand focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          />
        </label>
      </div>
    </section>
  );
}
