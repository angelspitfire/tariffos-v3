'use client';

import { useMemo, useState } from 'react';
import { MessageSquare, Search, Trash2, X } from 'lucide-react';
import type { WorkspaceThread } from '@/lib/workspace/types';
import { getThreadMeta } from '@/lib/workspace/thread-meta';

export interface ThreadHistoryListProps {
  threads: readonly WorkspaceThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
}

export function ThreadHistoryList({
  threads,
  activeThreadId,
  onSelectThread,
  onDeleteThread,
}: ThreadHistoryListProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (getThreadMeta(t).headline ?? '').toLowerCase().includes(q) ||
        t.messages.some((m) => m.text.toLowerCase().includes(q)),
    );
  }, [query, threads]);

  if (threads.length === 0) {
    return (
      <div className="px-3 py-8 text-center">
        <MessageSquare className="mx-auto mb-2 h-5 w-5 text-ink-subtle" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-ink-muted">
          Tus clasificaciones aparecerán aquí para retomarlas cuando quieras.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="relative pb-1.5">
        <Search
          className="pointer-events-none absolute top-[9px] left-3 h-3.5 w-3.5 text-ink-subtle"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar SKU, HS o texto..."
          aria-label="Buscar en historial"
          className="h-8 w-full rounded-full border border-border-subtle bg-surface-input pr-7 pl-8 text-[11px] text-ink-primary placeholder:text-ink-subtle focus:ring-2 focus:ring-accent-brand/40 focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Limpiar búsqueda"
            className="absolute top-[9px] right-2.5 cursor-pointer text-ink-subtle hover:text-ink-primary"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="px-2.5 py-4 text-center text-xs text-ink-muted">
          No hay despachos para «{query.trim()}».
        </p>
      ) : (
        <ul className="space-y-0.5">
          {filtered.map((thread) => {
            const { headline, timeLabel } = getThreadMeta(thread);
            const isActive = thread.id === activeThreadId;
            return (
              <li key={thread.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelectThread(thread.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`w-full cursor-pointer rounded-card px-2.5 py-2 pr-8 text-left transition-colors ${
                    isActive
                      ? 'bg-surface-subtle text-ink-primary'
                      : 'text-ink-secondary hover:bg-surface-hover'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
                    <span className="truncate font-semibold text-accent-ink">{headline ?? 'Consulta'}</span>
                    <span aria-hidden="true" className="text-border-strong">·</span>
                    <span className="shrink-0 text-ink-subtle">{timeLabel}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-medium text-ink-primary">
                    {thread.title}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteThread(thread.id)}
                  aria-label={`Eliminar sesión ${thread.title}`}
                  className="absolute top-2 right-1.5 cursor-pointer rounded-md p-1 text-ink-subtle opacity-0 transition hover:text-rose-600 group-hover:opacity-100 focus:opacity-100 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
