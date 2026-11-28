'use client';

import { useMemo, useState } from 'react';
import { Columns3, Layers, List, Plus, Search, X } from 'lucide-react';
import type { OperationalStatus, ProcessKind } from '@tariffos/shared-types';
import { deriveThreadProcessSnapshot, filterThreadsForProcessHub } from '@/lib/workspace/thread-process-meta';
import type { WorkspaceThread } from '@/lib/workspace/types';
import { ProcessKpiStrip } from '../molecules/ProcessKpiStrip';
import { ProcessRowCard } from '../molecules/ProcessRowCard';

export interface ProcessHubViewProps {
  threads: readonly WorkspaceThread[];
  onOpenProcess: (threadId: string) => void;
  onArchiveProcess: (threadId: string) => void;
  onNewThread: () => void;
  onClose: () => void;
}

const BOARD_COLUMNS: ReadonlyArray<{ status: 'needs_input' | 'processing' | 'in_review' | 'approved'; title: string }> = [
  { status: 'needs_input', title: 'Requiere dato' },
  { status: 'processing', title: 'En curso' },
  { status: 'in_review', title: 'Por aprobar' },
  { status: 'approved', title: 'Sellados' },
];

export function ProcessHubView({ threads, onOpenProcess, onArchiveProcess, onNewThread, onClose }: ProcessHubViewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [statusFilter, setStatusFilter] = useState<OperationalStatus | 'all'>('all');
  const [kindFilter, setKindFilter] = useState<ProcessKind | 'all'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);

  const counts = useMemo(() => {
    const out = { needs_input: 0, processing: 0, in_review: 0, approved: 0 };
    for (const thread of threads) {
      const snap = deriveThreadProcessSnapshot(thread);
      if (snap.processKind === 'quick_lookup' || snap.operationalStatus === 'archived') continue;
      if (snap.operationalStatus in out) out[snap.operationalStatus as keyof typeof out] += 1;
    }
    return out;
  }, [threads]);

  const clientRefs = useMemo(
    () => Array.from(new Set(threads.map((t) => t.clientRef?.trim()).filter((v): v is string => Boolean(v)))).sort(),
    [threads],
  );

  const filtered = useMemo(
    () => filterThreadsForProcessHub(threads, { status: statusFilter, kind: kindFilter, clientRef: clientFilter, query, includeArchived }),
    [clientFilter, includeArchived, kindFilter, query, statusFilter, threads],
  );

  const toggleStatusFilter = (status: OperationalStatus) => setStatusFilter((curr) => (curr === status ? 'all' : status));

  return (
    <div className="flex h-full flex-col bg-surface-app">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface-panel px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent-ink" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-ink-primary">Centro de Procesos</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-border-subtle bg-surface-muted/60 p-0.5">
            <button
              type="button"
              aria-pressed={viewMode === 'table'}
              onClick={() => setViewMode('table')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-surface-panel text-ink-primary shadow-2xs' : 'text-ink-muted hover:text-ink-primary'}`}
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              Tabla
            </button>
            <button
              type="button"
              aria-pressed={viewMode === 'board'}
              onClick={() => setViewMode('board')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${viewMode === 'board' ? 'bg-surface-panel text-ink-primary shadow-2xs' : 'text-ink-muted hover:text-ink-primary'}`}
            >
              <Columns3 className="h-3.5 w-3.5" aria-hidden="true" />
              Tablero
            </button>
          </div>
          <button type="button" onClick={onNewThread} className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-surface-inverted px-3 py-1.5 text-xs font-semibold text-ink-on-inverted transition-colors hover:bg-surface-inverted-hover">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Nuevo chat
          </button>
          <button type="button" onClick={onClose} className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-subtle px-2.5 py-1 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface-hover">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Volver al chat
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <ProcessKpiStrip counts={counts} activeStatus={statusFilter} onToggleStatus={toggleStatusFilter} />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1">
            <Search className="pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5 text-ink-subtle" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por producto, HS o cliente…"
              aria-label="Filtrar procesos"
              className="h-8 w-full rounded-full border border-border-subtle bg-surface-panel pr-3 pl-8 text-xs text-ink-primary placeholder:text-ink-subtle focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
            />
          </div>
          <select aria-label="Filtrar por tipo de proceso" value={kindFilter} onChange={(e) => setKindFilter(e.target.value as ProcessKind | 'all')} className="h-8 rounded-full border border-border-subtle bg-surface-panel px-3 text-xs text-ink-secondary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none">
            <option value="all">Todos los tipos</option>
            <option value="single_ruling">Dictámenes</option>
            <option value="invoice_batch">Lotes</option>
            <option value="oga_escalation">OGA / Revisión</option>
            <option value="cif_simulation">Cálculo CIF</option>
          </select>
          {clientRefs.length > 0 ? (
            <select aria-label="Filtrar por cliente o referencia" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="h-8 rounded-full border border-border-subtle bg-surface-panel px-3 text-xs text-ink-secondary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none">
              <option value="all">Todos los clientes</option>
              {clientRefs.map((ref) => <option key={ref} value={ref}>{ref}</option>)}
            </select>
          ) : null}
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface-panel px-3 py-1.5 text-xs text-ink-secondary">
            <input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} className="accent-accent-brand" />
            Ver archivados
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-card border border-dashed border-border-subtle bg-surface-panel p-8 text-center">
            <p className="text-xs text-ink-muted">No hay procesos operativos para los filtros actuales.</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="space-y-2">
            {filtered.map((thread) => <ProcessRowCard key={thread.id} thread={thread} onOpen={onOpenProcess} onArchive={onArchiveProcess} />)}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {BOARD_COLUMNS.map((col) => {
              const items = filtered.filter((t) => deriveThreadProcessSnapshot(t).operationalStatus === col.status);
              return (
                <section key={col.status} aria-label={`Columna ${col.title}`} className="flex flex-col gap-2 rounded-card border border-border-subtle bg-surface-muted/40 p-2.5">
                  <div className="flex items-center justify-between px-1 text-xs font-semibold text-ink-secondary">
                    <span>{col.title}</span>
                    <span className="font-mono text-[11px] text-ink-muted tabular-nums">{items.length}</span>
                  </div>
                  {items.length === 0 ? (
                    <p className="py-4 text-center text-[11px] text-ink-subtle">Sin procesos</p>
                  ) : (
                    items.map((thread) => <ProcessRowCard key={thread.id} compact thread={thread} onOpen={onOpenProcess} onArchive={onArchiveProcess} />)
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
