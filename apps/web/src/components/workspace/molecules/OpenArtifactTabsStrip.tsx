'use client';

import { FolderOpen } from 'lucide-react';
import type { ThreadArtifactSummary } from '@/lib/workspace/artifact-versions';

export interface OpenArtifactTabsStripProps {
  artifacts: readonly ThreadArtifactSummary[];
  activeArtifactId: string | null;
  directoryOpen?: boolean;
  onSelectArtifact: (artifactId: string) => void;
  onToggleDirectory?: () => void;
}

export function OpenArtifactTabsStrip({
  artifacts,
  activeArtifactId,
  directoryOpen = false,
  onSelectArtifact,
  onToggleDirectory,
}: OpenArtifactTabsStripProps) {
  if (artifacts.length <= 1) return null;

  const resolvedActiveId = activeArtifactId ?? artifacts[artifacts.length - 1]?.id ?? null;

  return (
    <div
      role="tablist"
      aria-label="Artefactos de la conversación"
      className="no-print flex shrink-0 items-center justify-between gap-2 border-b border-border-subtle bg-surface-muted/60 px-3"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
        {artifacts.map((art) => {
          const isActive = art.id === resolvedActiveId;
          return (
            <button
              key={art.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectArtifact(art.id)}
              className={`-mb-px flex max-w-[200px] shrink-0 cursor-pointer items-center gap-1.5 border-b-2 py-2 text-left text-[11px] whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-accent-brand font-semibold text-ink-primary'
                  : 'border-transparent font-medium text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <span className="shrink-0 font-mono text-accent-ink tabular-nums">{art.code}</span>
              <span className="truncate">{art.title}</span>
            </button>
          );
        })}
      </div>

      {onToggleDirectory ? (
        <button
          type="button"
          onClick={onToggleDirectory}
          aria-pressed={directoryOpen}
          className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
            directoryOpen
              ? 'bg-accent-soft text-accent-ink'
              : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
          }`}
        >
          <FolderOpen className="h-3 w-3" aria-hidden="true" />
          <span>Índice ({artifacts.length})</span>
        </button>
      ) : null}
    </div>
  );
}
