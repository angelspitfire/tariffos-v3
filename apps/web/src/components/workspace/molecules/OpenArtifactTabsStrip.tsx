'use client';

import type { ThreadArtifactSummary } from '@/lib/workspace/artifact-versions';

export interface OpenArtifactTabsStripProps {
  artifacts: readonly ThreadArtifactSummary[];
  activeArtifactId: string | null;
  onSelectArtifact: (artifactId: string) => void;
}

export function OpenArtifactTabsStrip({
  artifacts,
  activeArtifactId,
  onSelectArtifact,
}: OpenArtifactTabsStripProps) {
  if (artifacts.length <= 1) return null;

  const resolvedActiveId = activeArtifactId ?? artifacts[artifacts.length - 1]?.id ?? null;

  return (
    <div
      role="tablist"
      aria-label="Artefactos de la conversación"
      className="no-print flex shrink-0 items-center gap-2 overflow-x-auto border-b border-border-subtle bg-surface-muted/60 px-3"
    >
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
  );
}
