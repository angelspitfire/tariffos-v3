'use client';

import { useMemo, useState } from 'react';
import { FileSpreadsheet, MessageSquare, MessageSquarePlus, Search, Sparkles, Trash2, X } from 'lucide-react';
import {
  SAMPLE_BATCH_DOCUMENTS,
  SAMPLE_MERCHANDISE,
  type SampleBatchDocument,
  type SampleMerchandise,
} from '@/lib/workspace/jurisdictions';
import type { WorkspaceThread } from '@/lib/workspace/types';

export interface ThreadSidebarProps {
  open: boolean;
  threads: readonly WorkspaceThread[];
  activeThreadId: string | null;
  onNewThread: () => void;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onRunSample: (sample: SampleMerchandise) => void;
  onRunBatchSample: (batch: SampleBatchDocument) => void;
}

function getThreadMeta(thread: WorkspaceThread): { hsCode: string | null; timeLabel: string } {
  let hsCode: string | null = null;
  for (let i = thread.messages.length - 1; i >= 0; i--) {
    const env = thread.messages[i]?.envelope;
    const verdict = env?.inlineComponents.find((c) => c.type === 'verdict');
    if (verdict && verdict.type === 'verdict') {
      hsCode = verdict.hsCode;
      break;
    }
    const batch = env?.canvasComponents.find((c) => c.type === 'batch_manifest');
    if (batch && batch.type === 'batch_manifest') {
      hsCode = `Lote · ${batch.items.length} ítems`;
      break;
    }
  }
  const timeLabel = new Date(thread.updatedAt).toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { hsCode, timeLabel };
}

export function ThreadSidebar({
  open,
  threads,
  activeThreadId,
  onNewThread,
  onSelectThread,
  onDeleteThread,
  onRunSample,
  onRunBatchSample,
}: ThreadSidebarProps) {
  const [query, setQuery] = useState('');

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.messages.some((m) => m.text.toLowerCase().includes(q)),
    );
  }, [query, threads]);

  if (!open) return null;

  return (
    <aside className="no-print flex h-full w-64 shrink-0 flex-col bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-r border-black/[0.06] dark:border-white/[0.08] lg:h-[calc(100%-1.25rem)] lg:my-2.5 lg:ml-2.5 lg:rounded-[22px] lg:border lg:shadow-[0_14px_36px_-18px_rgba(15,23,42,0.14)] overflow-hidden">
      <div className="p-3 space-y-2.5">
        <button
          type="button"
          onClick={onNewThread}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-accent-brand px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-accent-brand-hover shadow-xs cursor-pointer"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
          Nueva clasificación
        </button>

        {threads.length > 0 && (
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-3 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar SKU, HS o texto..."
              aria-label="Buscar en historial"
              className="w-full h-8 pl-8 pr-7 rounded-full border border-black/[0.08] dark:border-white/[0.10] bg-white/90 dark:bg-[#0f1626] text-[11px] text-ink-primary placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent-brand/40"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 text-ink-subtle hover:text-ink-primary cursor-pointer"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-2.5 pb-4">
        <section>
          <h3 className="px-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
            Historial ({filteredThreads.length})
          </h3>
          {filteredThreads.length === 0 ? (
            <div className="mt-3 px-2 py-4 text-center">
              <MessageSquare className="w-4 h-4 text-ink-subtle mx-auto mb-1.5" aria-hidden="true" />
              <p className="text-[11px] text-ink-muted leading-relaxed">
                {query
                  ? 'Sin coincidencias en el historial.'
                  : 'Tus clasificaciones aparecerán aquí para retomarlas cuando quieras.'}
              </p>
            </div>
          ) : (
            <ul className="mt-1.5 space-y-1">
              {filteredThreads.map((thread) => {
                const { hsCode, timeLabel } = getThreadMeta(thread);
                const isActive = thread.id === activeThreadId;
                return (
                  <li key={thread.id} className="group flex items-start gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectThread(thread.id)}
                      className={`min-w-0 flex-1 rounded-xl px-2.5 py-2 text-left transition cursor-pointer ${
                        isActive
                          ? 'bg-accent-soft/80 text-ink-primary ring-1 ring-accent-border/70'
                          : 'text-ink-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-ink-primary'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums">
                        <span className="truncate font-semibold text-accent-ink">
                          {hsCode ?? 'Consulta'}
                        </span>
                        <span aria-hidden="true" className="text-border-strong">·</span>
                        <span className="text-ink-subtle shrink-0">{timeLabel}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs font-medium text-ink-primary">
                        {thread.title}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteThread(thread.id)}
                      aria-label={`Eliminar sesión ${thread.title}`}
                      className="mt-1.5 rounded-lg p-1 text-ink-subtle opacity-0 transition hover:bg-surface-hover hover:text-rose-600 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="border-t border-black/[0.06] dark:border-white/[0.08] pt-3">
          <h3 className="flex items-center gap-1.5 px-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
            <Sparkles className="h-3 w-3 text-accent-ink" aria-hidden="true" />
            Pruebas rápidas
          </h3>
          <div className="mt-1.5 space-y-1.5">
            {SAMPLE_MERCHANDISE.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onRunSample(sample)}
                className="flex w-full flex-col rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.04] px-2.5 py-2 text-left transition hover:border-accent-brand/60 hover:bg-white dark:hover:bg-white/[0.08] cursor-pointer"
              >
                <span className="truncate text-xs font-medium text-ink-primary">{sample.label}</span>
                <span className="font-mono text-[10px] text-ink-muted truncate">{sample.hsHint}</span>
              </button>
            ))}

            {SAMPLE_BATCH_DOCUMENTS.map((batch) => (
              <button
                key={batch.id}
                type="button"
                onClick={() => onRunBatchSample(batch)}
                className="flex w-full items-center gap-2 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.04] px-2.5 py-2 text-left transition hover:border-accent-brand/60 hover:bg-white dark:hover:bg-white/[0.08] cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 shrink-0 text-accent-ink" aria-hidden="true" />
                <span className="truncate text-xs font-medium text-ink-primary">{batch.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
