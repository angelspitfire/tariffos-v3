'use client';

import { FileSpreadsheet, MessageSquarePlus, Sparkles, Trash2 } from 'lucide-react';
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
  if (!open) return null;

  return (
    <aside className="no-print flex h-full w-64 shrink-0 flex-col border-r border-border-subtle bg-surface-panel/85 backdrop-blur-xl">
      <div className="p-3">
        <button
          type="button"
          onClick={onNewThread}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-brand px-3 py-2 text-xs font-medium text-white transition hover:bg-accent-brand-hover"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
          Nueva clasificación
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
        <section>
          <h3 className="px-1 text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
            Historial ({threads.length})
          </h3>
          {threads.length === 0 ? (
            <p className="mt-2 px-1 text-xs text-ink-subtle">
              Aún no hay sesiones guardadas. Inicia una consulta o prueba un ejemplo.
            </p>
          ) : (
            <ul className="mt-1.5 space-y-1">
              {threads.map((thread) => (
                <li key={thread.id} className="group flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSelectThread(thread.id)}
                    className={`min-w-0 flex-1 truncate rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                      thread.id === activeThreadId
                        ? 'bg-accent-soft font-semibold text-accent-ink'
                        : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
                    }`}
                  >
                    {thread.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteThread(thread.id)}
                    aria-label={`Eliminar sesión ${thread.title}`}
                    className="rounded-md p-1 text-ink-subtle opacity-0 transition hover:bg-surface-hover hover:text-rose-600 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border-t border-border-hairline pt-3">
          <h3 className="flex items-center gap-1 px-1 text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
            <Sparkles className="h-3 w-3 text-accent-ink" aria-hidden="true" />
            Casos de prueba rápidos
          </h3>
          <div className="mt-1.5 space-y-1">
            {SAMPLE_MERCHANDISE.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onRunSample(sample)}
                className="flex w-full flex-col rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-left transition hover:border-accent-border hover:bg-accent-soft"
              >
                <span className="truncate text-xs font-medium text-ink-primary">{sample.label}</span>
                <span className="text-[10px] text-ink-muted">
                  {sample.category} · {sample.hsHint}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="border-t border-border-hairline pt-3">
          <h3 className="flex items-center gap-1 px-1 text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
            <FileSpreadsheet className="h-3 w-3 text-accent-ink" aria-hidden="true" />
            Manifiestos en lote
          </h3>
          <div className="mt-1.5 space-y-1">
            {SAMPLE_BATCH_DOCUMENTS.map((batch) => (
              <button
                key={batch.id}
                type="button"
                onClick={() => onRunBatchSample(batch)}
                className="flex w-full flex-col rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-left transition hover:border-accent-border hover:bg-accent-soft"
              >
                <span className="truncate text-xs font-medium text-ink-primary">{batch.label}</span>
                <span className="text-[10px] text-ink-muted">
                  {batch.docTypes} · {batch.itemsCount} ítems
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
