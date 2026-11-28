'use client';

import type { OperationalStatus } from '@tariffos/shared-types';

export interface ProcessKpiStripProps {
  counts: {
    needs_input: number;
    processing: number;
    in_review: number;
    approved: number;
  };
  activeStatus: OperationalStatus | 'all';
  onToggleStatus: (status: OperationalStatus) => void;
}

const CARDS: ReadonlyArray<{
  status: 'needs_input' | 'processing' | 'in_review' | 'approved';
  label: string;
  dotClass: string;
  countClass: string;
}> = [
  { status: 'needs_input', label: 'Requiere dato', dotClass: 'bg-rose-500', countClass: 'text-rose-600 dark:text-rose-400' },
  { status: 'processing', label: 'En curso', dotClass: 'bg-sky-500', countClass: 'text-ink-primary' },
  { status: 'in_review', label: 'Por aprobar', dotClass: 'bg-amber-500', countClass: 'text-amber-600 dark:text-amber-400' },
  { status: 'approved', label: 'Sellados', dotClass: 'bg-emerald-500', countClass: 'text-emerald-600 dark:text-emerald-400' },
];

export function ProcessKpiStrip({ counts, activeStatus, onToggleStatus }: ProcessKpiStripProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => {
        const selected = activeStatus === card.status;
        return (
          <button
            key={card.status}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggleStatus(card.status)}
            className={`cursor-pointer rounded-card border bg-surface-panel p-3.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${
              selected
                ? 'border-accent-brand bg-accent-soft/40 shadow-xs'
                : 'border-border-subtle hover:border-border-strong'
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <span className={`h-2 w-2 rounded-full ${card.dotClass}`} aria-hidden="true" />
              <span>{card.label}</span>
            </div>
            <div className={`mt-1.5 font-mono text-2xl font-bold tabular-nums ${card.countClass}`}>
              {counts[card.status]}
            </div>
          </button>
        );
      })}
    </div>
  );
}
