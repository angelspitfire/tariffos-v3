'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, Search, Trash2, X } from 'lucide-react';
import type { OperationalStatus } from '@tariffos/shared-types';
import { getThreadMeta } from '@/lib/workspace/thread-meta';
import { deriveThreadProcessSnapshot, groupThreadsForSidebar } from '@/lib/workspace/thread-process-meta';
import type { WorkspaceThread } from '@/lib/workspace/types';

export interface ThreadHistoryListProps {
  threads: readonly WorkspaceThread[];
  loading?: boolean;
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onOpenProcessHub?: () => void;
  onSearchRemote?: (query: string) => void;
}

const DOT_CLASS: Record<OperationalStatus, string> = {
  needs_input: 'bg-rose-500',
  processing: 'bg-sky-500',
  in_review: 'bg-amber-500',
  approved: 'bg-emerald-500',
  archived: 'bg-ink-subtle',
};

function ThreadRow({ thread, active, onSelect, onDelete }: {
  thread: WorkspaceThread; active: boolean; onSelect: (id: string) => void; onDelete: (id: string) => void;
}) {
  const { headline, timeLabel } = getThreadMeta(thread);
  const { operationalStatus } = deriveThreadProcessSnapshot(thread);
  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onSelect(thread.id)}
        aria-current={active ? 'true' : undefined}
        className={`w-full cursor-pointer rounded-card px-2.5 py-2 pr-8 text-left transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${
          active ? 'bg-surface-subtle text-ink-primary' : 'text-ink-secondary hover:bg-surface-hover'
        }`}
      >
        <span className="flex items-center justify-between gap-2 font-mono text-[11px] tabular-nums">
          <span className="inline-flex min-w-0 items-center gap-1.5 font-semibold text-accent-ink">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_CLASS[operationalStatus]}`} aria-hidden="true" />
            <span className="truncate">{headline ?? 'Consulta'}</span>
          </span>
          <span className="shrink-0 text-ink-subtle">{timeLabel}</span>
        </span>
        <span className="mt-0.5 block truncate text-xs font-medium text-ink-primary">{thread.title}</span>
        {thread.clientRef ? <span className="mt-0.5 block truncate text-[10px] text-ink-muted">{thread.clientRef}</span> : null}
      </button>
      <button
        type="button"
        onClick={() => onDelete(thread.id)}
        aria-label={`Eliminar sesión ${thread.title}`}
        className="absolute top-2 right-1.5 cursor-pointer rounded-md p-1 text-ink-subtle opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-600 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none dark:hover:text-rose-400"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </li>
  );
}

export function ThreadHistoryList({
  threads, loading = false, activeThreadId, onSelectThread, onDeleteThread, onOpenProcessHub, onSearchRemote,
}: ThreadHistoryListProps) {
  const [query, setQuery] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    if (!onSearchRemote || !query.trim()) return;
    const t = window.setTimeout(() => onSearchRemote(query.trim()), 280);
    return () => window.clearTimeout(t);
  }, [onSearchRemote, query]);

  const grouped = useMemo(() => groupThreadsForSidebar(threads), [threads]);
  const cleanQuery = query.trim().toLowerCase();
  const searchHits = useMemo(() => {
    if (!cleanQuery) return [];
    return threads.filter(
      (t) =>
        t.title.toLowerCase().includes(cleanQuery) ||
        (t.clientRef ?? '').toLowerCase().includes(cleanQuery) ||
        (getThreadMeta(t).headline ?? '').toLowerCase().includes(cleanQuery) ||
        t.messages.some((m) => m.text.toLowerCase().includes(cleanQuery)),
    );
  }, [cleanQuery, threads]);

  if (threads.length === 0 && loading) {
    return (
      <div role="status" aria-label="Cargando conversaciones" className="space-y-2 px-1 py-2">
        <span className="sr-only">Cargando conversaciones…</span>
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="animate-pulse rounded-card bg-surface-subtle px-2.5 py-2.5">
            <div className="h-2.5 w-20 rounded bg-border-subtle" />
            <div className="mt-1.5 h-3 w-4/5 rounded bg-border-subtle" />
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="px-3 py-8 text-center">
        <MessageSquare className="mx-auto mb-2 h-5 w-5 text-ink-subtle" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-ink-muted">Tus clasificaciones aparecerán aquí para retomarlas cuando quieras.</p>
      </div>
    );
  }

  const sections = [
    { label: 'Hoy', items: grouped.buckets.today },
    { label: 'Ayer', items: grouped.buckets.yesterday },
    { label: 'Anteriores', items: grouped.buckets.older },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="space-y-2">
      <div className="relative pb-1">
        <Search className="pointer-events-none absolute top-[9px] left-3 h-3.5 w-3.5 text-ink-subtle" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar SKU, HS o cliente…"
          aria-label="Buscar en historial"
          className="h-8 w-full rounded-full border border-border-subtle bg-surface-input pr-7 pl-8 text-[11px] text-ink-primary placeholder:text-ink-subtle focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        />
        {query ? (
          <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda" className="absolute top-[9px] right-2.5 cursor-pointer rounded text-ink-subtle hover:text-ink-primary">
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {cleanQuery ? (
        searchHits.length === 0 ? (
          <p className="px-2.5 py-4 text-center text-xs text-ink-muted">No hay despachos para «{query.trim()}».</p>
        ) : (
          <ul className="space-y-0.5">
            {searchHits.map((t) => <ThreadRow key={t.id} thread={t} active={t.id === activeThreadId} onSelect={onSelectThread} onDelete={onDeleteThread} />)}
          </ul>
        )
      ) : (
        <>
          {sections.length > 0 ? (
            <div className="space-y-2.5">
              {sections.map((section) => (
                <div key={section.label}>
                  <p className="px-2 pb-1 text-[10px] font-semibold tracking-wide text-ink-subtle uppercase">{section.label}</p>
                  <ul className="space-y-0.5">
                    {section.items.map((t) => <ThreadRow key={t.id} thread={t} active={t.id === activeThreadId} onSelect={onSelectThread} onDelete={onDeleteThread} />)}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-2 py-3 text-center text-[11px] text-ink-muted">Sin procesos activos en curso.</p>
          )}

          {grouped.recentQuickLookups.length > 0 ? (
            <div className="border-t border-border-hairline pt-2">
              <button
                type="button"
                aria-expanded={quickOpen}
                onClick={() => setQuickOpen((p) => !p)}
                className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-[11px] font-medium text-ink-muted hover:bg-surface-hover hover:text-ink-primary"
              >
                <span className="inline-flex items-center gap-1">
                  {quickOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  Consultas rápidas
                </span>
                <span className="font-mono text-[10px] tabular-nums">{grouped.recentQuickLookups.length}</span>
              </button>
              {quickOpen ? (
                <ul className="mt-1 space-y-0.5">
                  {grouped.recentQuickLookups.map((t) => <ThreadRow key={t.id} thread={t} active={t.id === activeThreadId} onSelect={onSelectThread} onDelete={onDeleteThread} />)}
                </ul>
              ) : null}
            </div>
          ) : null}

          {grouped.sealedCount > 0 && onOpenProcessHub ? (
            <button type="button" onClick={onOpenProcessHub} className="w-full cursor-pointer rounded-lg border border-border-hairline px-2.5 py-1.5 text-center text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary">
              Ver {grouped.sealedCount} {grouped.sealedCount === 1 ? 'sellado' : 'sellados'} en Procesos
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
