'use client';

import { useMemo, useState } from 'react';
import { GitCompareArrows, History, X } from 'lucide-react';
import {
  computeDossierDiff,
  type DiffStatus,
  type ThreadArtifactSummary,
} from '@/lib/workspace/artifact-versions';
import { WorkspaceDialogShell } from '../atoms/WorkspaceDialogShell';

export interface ChangeTimelineModalProps {
  open: boolean;
  artifacts: readonly ThreadArtifactSummary[];
  onClose: () => void;
  onSelectArtifact: (artifactId: string) => void;
}

const STATUS_BADGE: Record<DiffStatus, string> = {
  same: 'border-border-subtle bg-surface-panel',
  changed: 'border-amber-400/80 bg-amber-50/70 dark:bg-amber-950/30',
  added: 'border-emerald-400/80 bg-emerald-50/70 dark:bg-emerald-950/30',
  removed: 'border-rose-400/80 bg-rose-50/70 dark:bg-rose-950/30',
};

export function ChangeTimelineModal({
  open,
  artifacts,
  onClose,
  onSelectArtifact,
}: ChangeTimelineModalProps) {
  const dossierVersions = useMemo(
    () => artifacts.filter((a) => Boolean(a.dossier)),
    [artifacts],
  );
  const [leftId, setLeftId] = useState<string>(dossierVersions[0]?.id ?? '');
  const [rightId, setRightId] = useState<string>(
    dossierVersions[Math.max(0, dossierVersions.length - 1)]?.id ?? '',
  );
  const [onlyChanges, setOnlyChanges] = useState(false);

  const left = dossierVersions.find((v) => v.id === leftId) ?? dossierVersions[0];
  const right =
    dossierVersions.find((v) => v.id === rightId) ??
    dossierVersions[dossierVersions.length - 1];

  const diffRows =
    left?.dossier && right?.dossier
      ? computeDossierDiff(left.dossier, right.dossier).filter(
          (row) => !onlyChanges || row.status !== 'same',
        )
      : [];

  return (
    <WorkspaceDialogShell
      open={open}
      onClose={onClose}
      label="Historial y comparador de versiones del dictamen"
      maxWidthClassName="max-w-4xl"
      contentClassName="max-h-[85vh]"
    >
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4 text-accent-ink" aria-hidden="true" />
          <h2 className="text-sm font-semibold">Línea de tiempo y comparador de versiones</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar comparador de versiones"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
              <History className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
              Versiones emitidas en esta conversación ({artifacts.length})
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {artifacts.map((art) => (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => {
                    onSelectArtifact(art.id);
                    onClose();
                  }}
                  className="cursor-pointer rounded-card border border-border-subtle bg-surface-muted/60 p-3 text-left text-xs transition-colors hover:border-accent-brand"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-accent-ink">{art.code}</span>
                    <span className="font-mono text-[10px] text-ink-muted">v{art.versionNumber}</span>
                  </div>
                  <div className="mt-1 truncate font-medium text-ink-primary">{art.title}</div>
                </button>
              ))}
            </div>
          </div>

          {dossierVersions.length >= 2 && left && right ? (
            <div className="space-y-3 border-t border-border-hairline pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    aria-label="Versión base"
                    value={left.id}
                    onChange={(e) => setLeftId(e.target.value)}
                    className="rounded-field border border-border-subtle bg-surface-input px-2.5 py-1.5 font-mono text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
                  >
                    {dossierVersions.map((v) => (
                      <option key={v.id} value={v.id} className="bg-surface-panel text-ink-primary">
                        v{v.versionNumber} · {v.code}
                      </option>
                    ))}
                  </select>
                  <span className="text-ink-muted">vs</span>
                  <select
                    aria-label="Versión comparada"
                    value={right.id}
                    onChange={(e) => setRightId(e.target.value)}
                    className="rounded-field border border-border-subtle bg-surface-input px-2.5 py-1.5 font-mono text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
                  >
                    {dossierVersions.map((v) => (
                      <option key={v.id} value={v.id} className="bg-surface-panel text-ink-primary">
                        v{v.versionNumber} · {v.code}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={onlyChanges}
                    onChange={(e) => setOnlyChanges(e.target.checked)}
                    className="h-3.5 w-3.5 accent-accent-brand"
                  />
                  Solo diferencias
                </label>
              </div>

              <div className="space-y-2">
                {diffRows.map((row) => (
                  <div
                    key={row.label}
                    className={`grid gap-2 rounded-card border p-3 text-xs sm:grid-cols-12 ${STATUS_BADGE[row.status]}`}
                  >
                    <div className="font-semibold text-ink-primary sm:col-span-3">{row.label}</div>
                    <div className="text-ink-secondary sm:col-span-4">{row.leftValue}</div>
                    <div className="font-medium text-ink-primary sm:col-span-5">{row.rightValue}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
    </WorkspaceDialogShell>
  );
}
