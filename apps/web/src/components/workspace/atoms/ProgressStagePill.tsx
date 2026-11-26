'use client';

import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { StreamProgressEvent } from '@tariffos/shared-types';

interface ProgressStagePillProps {
  event: StreamProgressEvent;
}

export function ProgressStagePill({ event }: ProgressStagePillProps) {
  const isComplete = event.stage === 'complete';
  const isError = event.stage === 'error';
  const pct = Math.max(0, Math.min(100, Math.round(event.progressPct)));

  return (
    <output
      aria-live="polite"
      className="flex flex-col gap-1.5 rounded-xl border border-border-subtle bg-surface-panel px-3 py-2 text-xs shadow-xs"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-medium text-ink-primary">
          {isComplete ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          ) : isError ? (
            <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
          ) : (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-ink" aria-hidden="true" />
          )}
          {event.label}
        </span>
        <span className="font-mono text-[11px] text-ink-muted tabular-nums">{pct}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isError ? 'bg-rose-500' : isComplete ? 'bg-emerald-500' : 'bg-accent-brand'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </output>
  );
}
