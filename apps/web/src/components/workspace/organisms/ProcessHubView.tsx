'use client';

import { useEffect, useMemo, useState } from 'react';
import { Columns3, Layers, List, Plus, X } from 'lucide-react';
import type { AgencyMemberSummary, AgencyRole, OperationalStatus, ProcessKind, ProcessScopeFilter } from '@tariffos/shared-types';
import { deriveThreadProcessSnapshot, filterThreadsForProcessHub } from '@/lib/workspace/thread-process-meta';
import type { WorkspaceThread } from '@/lib/workspace/types';
import { ProcessHubToolbar } from '../molecules/ProcessHubToolbar';
import { ProcessKpiStrip } from '../molecules/ProcessKpiStrip';
import { ProcessRowCard } from '../molecules/ProcessRowCard';

export interface ProcessHubViewProps {
  threads: readonly WorkspaceThread[];
  agencyRole?: AgencyRole;
  currentUserId?: string;
  teamMembers?: readonly AgencyMemberSummary[];
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

export function ProcessHubView({
  threads, agencyRole = 'OWNER', currentUserId, teamMembers = [], onOpenProcess, onArchiveProcess, onNewThread, onClose,
}: ProcessHubViewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [scopeFilter, setScopeFilter] = useState<ProcessScopeFilter>(agencyRole === 'ANALYST' ? 'mine' : 'agency');
  const [statusFilter, setStatusFilter] = useState<OperationalStatus | 'all'>(agencyRole === 'REVIEWER' ? 'in_review' : 'all');
  const [kindFilter, setKindFilter] = useState<ProcessKind | 'all'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);

  useEffect(() => {
    setScopeFilter(agencyRole === 'ANALYST' ? 'mine' : 'agency');
    setStatusFilter(agencyRole === 'REVIEWER' ? 'in_review' : 'all');
  }, [agencyRole]);

  const memberNameById = useMemo(() => new Map(teamMembers.map((m) => [m.userId, m.fullName])), [teamMembers]);

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
    () => filterThreadsForProcessHub(threads, { status: statusFilter, kind: kindFilter, clientRef: clientFilter, query, includeArchived, scope: scopeFilter, currentUserId }),
    [clientFilter, currentUserId, includeArchived, kindFilter, query, scopeFilter, statusFilter, threads],
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
            <button type="button" aria-pressed={viewMode === 'table'} onClick={() => setViewMode('table')} className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-surface-panel text-ink-primary shadow-2xs' : 'text-ink-muted hover:text-ink-primary'}`}>
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              Tabla
            </button>
            <button type="button" aria-pressed={viewMode === 'board'} onClick={() => setViewMode('board')} className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${viewMode === 'board' ? 'bg-surface-panel text-ink-primary shadow-2xs' : 'text-ink-muted hover:text-ink-primary'}`}>
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
        <ProcessHubToolbar
          scopeFilter={scopeFilter} onChangeScope={setScopeFilter} query={query} onChangeQuery={setQuery}
          kindFilter={kindFilter} onChangeKind={setKindFilter} clientRefs={clientRefs} clientFilter={clientFilter}
          onChangeClient={setClientFilter} includeArchived={includeArchived} onChangeArchived={setIncludeArchived}
          showScopeBar={teamMembers.length > 0 || agencyRole === 'ANALYST'}
        />

        {filtered.length === 0 ? (
          <div className="rounded-card border border-dashed border-border-subtle bg-surface-panel p-8 text-center">
            <p className="text-xs text-ink-muted">No hay procesos operativos para los filtros actuales.</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="space-y-2">
            {filtered.map((thread) => (
              <ProcessRowCard
                key={thread.id} thread={thread}
                assigneeName={thread.assignedToUserId ? memberNameById.get(thread.assignedToUserId) ?? null : null}
                onOpen={onOpenProcess} onArchive={onArchiveProcess}
              />
            ))}
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
                    items.map((thread) => (
                      <ProcessRowCard
                        key={thread.id} compact thread={thread}
                        assigneeName={thread.assignedToUserId ? memberNameById.get(thread.assignedToUserId) ?? null : null}
                        onOpen={onOpenProcess} onArchive={onArchiveProcess}
                      />
                    ))
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
