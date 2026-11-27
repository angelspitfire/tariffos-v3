'use client';

import { FileSpreadsheet, Loader2, X } from 'lucide-react';
import type { UseRealtimeConnectionStatus } from 'inngest/react';
import type { BatchProgressEvent } from '@/lib/inngest/channels';

export interface BatchProgressBannerProps {
  fileName: string;
  totalItems: number;
  connectionStatus: UseRealtimeConnectionStatus | 'polling';
  progress: BatchProgressEvent | null;
  onDismiss: () => void;
}

/** Displays live Inngest Realtime progress for an active invoice batch job. */
export function BatchProgressBanner({
  fileName,
  totalItems,
  connectionStatus,
  progress,
  onDismiss,
}: BatchProgressBannerProps) {
  const pct = Math.max(4, Math.min(100, Math.round(progress?.progressPct ?? 5)));
  const completed = progress?.completedItems ?? 0;
  const total = progress?.totalItems && progress.totalItems > 0 ? progress.totalItems : totalItems;
  const label = progress?.label ?? 'Encolado en motor de lotes…';
  const isLive = connectionStatus === 'open';

  return (
    <div
      role="status"
      aria-live="polite"
      className="max-w-2xl mx-auto w-full rounded-xl border border-accent-brand/30 bg-surface-panel p-3.5 shadow-sm space-y-2"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-xs font-semibold text-ink-primary">{fileName}</span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  isLive
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'bg-surface-muted text-ink-muted'
                }`}
              >
                {isLive ? 'En vivo' : 'Sincronizando'}
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin shrink-0 text-accent-ink motion-reduce:animate-none" aria-hidden="true" />
              <span>{label}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right font-mono text-[11px] tabular-nums">
            <div className="font-semibold text-ink-primary">{pct}%</div>
            <div className="text-[10px] text-ink-muted">
              {total > 0 ? `${completed} / ${total} ítems` : 'Procesando…'}
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Ocultar progreso del lote"
            className="rounded-md p-1 text-ink-subtle transition-colors hover:bg-surface-hover hover:text-ink-primary cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div
          className="h-full w-full origin-left rounded-full bg-accent-brand transition-transform duration-300 motion-reduce:transition-none"
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
    </div>
  );
}
