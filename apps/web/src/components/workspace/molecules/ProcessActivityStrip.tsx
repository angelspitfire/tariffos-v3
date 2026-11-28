'use client';

import { History } from 'lucide-react';
import type { ProcessActivityAction, ProcessActivityEvent } from '@tariffos/shared-types';

export interface ProcessActivityStripProps {
  events?: readonly ProcessActivityEvent[];
}

const ACTION_LABELS: Record<ProcessActivityAction, string> = {
  created: 'Creado',
  review_requested: 'En revisión',
  assigned: 'Asignado',
  approved: 'Sellado',
  archived: 'Archivado',
};

export function ProcessActivityStrip({ events = [] }: ProcessActivityStripProps) {
  if (events.length === 0) return null;
  const recent = events.slice(-5).reverse();

  return (
    <section className="px-5 py-3.5">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
        <History className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
        Bitácora del proceso ({events.length})
      </h3>
      <ul className="mt-2 space-y-1.5">
        {recent.map((evt) => {
          const time = new Date(evt.createdAt).toLocaleTimeString('es-VE', {
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <li
              key={evt.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-hairline bg-surface-muted/40 px-3 py-1.5 text-[11px]"
            >
              <div className="min-w-0 flex-1">
                <span className="mr-1.5 rounded bg-surface-panel px-1.5 py-0.5 font-semibold text-accent-ink ring-1 ring-border-subtle">
                  {ACTION_LABELS[evt.action]}
                </span>
                <span className="font-medium text-ink-primary">
                  {evt.actorName}
                  {evt.targetName ? ` · ${evt.targetName}` : ''}
                </span>
                {evt.note ? <span className="ml-1.5 text-ink-muted">— {evt.note}</span> : null}
              </div>
              <span className="font-mono text-[10px] text-ink-subtle tabular-nums">{time}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
