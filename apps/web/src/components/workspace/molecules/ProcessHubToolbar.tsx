'use client';

import { Search } from 'lucide-react';
import type { ProcessKind, ProcessScopeFilter } from '@tariffos/shared-types';

export interface ProcessHubToolbarProps {
  scopeFilter: ProcessScopeFilter;
  onChangeScope: (scope: ProcessScopeFilter) => void;
  query: string;
  onChangeQuery: (q: string) => void;
  kindFilter: ProcessKind | 'all';
  onChangeKind: (kind: ProcessKind | 'all') => void;
  clientRefs: readonly string[];
  clientFilter: string;
  onChangeClient: (client: string) => void;
  includeArchived: boolean;
  onChangeArchived: (checked: boolean) => void;
  showScopeBar?: boolean;
}

const SCOPES: ReadonlyArray<{ id: ProcessScopeFilter; label: string }> = [
  { id: 'mine', label: 'Mis procesos' },
  { id: 'assigned', label: 'Asignados a mí' },
  { id: 'agency', label: 'Toda la agencia' },
];

export function ProcessHubToolbar({
  scopeFilter, onChangeScope, query, onChangeQuery, kindFilter, onChangeKind,
  clientRefs, clientFilter, onChangeClient, includeArchived, onChangeArchived, showScopeBar = true,
}: ProcessHubToolbarProps) {
  return (
    <div className="space-y-2.5">
      {showScopeBar ? (
        <div role="group" aria-label="Alcance de procesos" className="inline-flex flex-wrap gap-1 rounded-full border border-border-subtle bg-surface-muted/50 p-0.5">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={scopeFilter === s.id}
              onClick={() => onChangeScope(s.id)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                scopeFilter === s.id ? 'bg-surface-panel text-ink-primary shadow-2xs' : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5 text-ink-subtle" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder="Buscar por producto, HS o cliente…"
            aria-label="Filtrar procesos"
            className="h-8 w-full rounded-full border border-border-subtle bg-surface-panel pr-3 pl-8 text-xs text-ink-primary placeholder:text-ink-subtle focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          />
        </div>
        <select
          aria-label="Filtrar por tipo de proceso"
          value={kindFilter}
          onChange={(e) => onChangeKind(e.target.value as ProcessKind | 'all')}
          className="h-8 rounded-full border border-border-subtle bg-surface-panel px-3 text-xs text-ink-secondary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        >
          <option value="all">Todos los tipos</option>
          <option value="single_ruling">Dictámenes</option>
          <option value="invoice_batch">Lotes</option>
          <option value="oga_escalation">OGA / Revisión</option>
          <option value="cif_simulation">Cálculo CIF</option>
        </select>
        {clientRefs.length > 0 ? (
          <select
            aria-label="Filtrar por cliente o referencia"
            value={clientFilter}
            onChange={(e) => onChangeClient(e.target.value)}
            className="h-8 rounded-full border border-border-subtle bg-surface-panel px-3 text-xs text-ink-secondary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <option value="all">Todos los clientes</option>
            {clientRefs.map((ref) => <option key={ref} value={ref}>{ref}</option>)}
          </select>
        ) : null}
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface-panel px-3 py-1.5 text-xs text-ink-secondary">
          <input type="checkbox" checked={includeArchived} onChange={(e) => onChangeArchived(e.target.checked)} className="accent-accent-brand" />
          Ver archivados
        </label>
      </div>
    </div>
  );
}
