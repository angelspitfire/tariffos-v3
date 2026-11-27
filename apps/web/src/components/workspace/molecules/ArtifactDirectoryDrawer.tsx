'use client';

import { useState } from 'react';
import { FolderOpen, Search, X } from 'lucide-react';
import type { ThreadArtifactSummary } from '@/lib/workspace/artifact-versions';

export interface ArtifactDirectoryDrawerProps {
  open: boolean;
  artifacts: readonly ThreadArtifactSummary[];
  activeArtifactId: string | null;
  onSelectArtifact: (artifactId: string) => void;
  onClose: () => void;
}

export function ArtifactDirectoryDrawer({
  open,
  artifacts,
  activeArtifactId,
  onSelectArtifact,
  onClose,
}: ArtifactDirectoryDrawerProps) {
  const [filter, setFilter] = useState('');

  if (!open || artifacts.length === 0) return null;

  const q = filter.trim().toLowerCase();
  const visible = artifacts.filter(
    (art) =>
      !q ||
      art.code.toLowerCase().includes(q) ||
      art.title.toLowerCase().includes(q),
  );

  return (
    <div className="no-print max-h-64 shrink-0 space-y-2.5 overflow-y-auto border-b border-border-subtle bg-surface-muted p-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-primary">
          <FolderOpen className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
          <span>Índice de artefactos ({artifacts.length})</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer text-[11px] font-medium text-ink-secondary hover:text-ink-primary"
        >
          Ocultar índice
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-2 left-2.5 h-3.5 w-3.5 text-ink-subtle" aria-hidden="true" />
        <input
          type="text"
          aria-label="Buscar artefacto por código SA o descripción"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar artefacto por código SA o descripción…"
          className="w-full rounded-field border border-border-subtle bg-surface-input py-1.5 pr-7 pl-8 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        />
        {filter ? (
          <button
            type="button"
            onClick={() => setFilter('')}
            aria-label="Limpiar filtro"
            className="absolute top-1.5 right-2 cursor-pointer p-0.5 text-ink-subtle hover:text-ink-primary"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        {visible.map((art) => {
          const active = art.id === activeArtifactId;
          return (
            <button
              key={art.id}
              type="button"
              onClick={() => {
                onSelectArtifact(art.id);
                onClose();
              }}
              className={`flex cursor-pointer items-center justify-between gap-2 rounded-field border px-2.5 py-2 text-left text-xs transition-colors ${
                active
                  ? 'border-accent-border bg-accent-soft/50 text-ink-primary'
                  : 'border-border-subtle bg-surface-panel text-ink-secondary hover:border-border-strong hover:text-ink-primary'
              }`}
            >
              <div className="min-w-0">
                <div className="font-mono text-[11px] font-semibold text-accent-ink">{art.code}</div>
                <div className="truncate text-[11px]">{art.title}</div>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-ink-muted">v{art.versionNumber}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
