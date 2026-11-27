'use client';

import { ChevronRight } from 'lucide-react';
import type { A2UIHierarchyComponent, A2UIHierarchyNode } from '@tariffos/shared-types';
import { CopyHsButton } from '../atoms/CopyHsButton';

interface HierarchyTreeViewProps {
  hierarchy: A2UIHierarchyComponent;
  onSelectNode?: (node: A2UIHierarchyNode) => void;
}

const LEVEL_INDENT: Record<A2UIHierarchyNode['level'], string> = {
  section: 'pl-0',
  chapter: 'pl-2',
  heading: 'pl-5',
  subheading: 'pl-8',
  national: 'pl-11',
};

const LEVEL_LABELS: Record<A2UIHierarchyNode['level'], string> = {
  section: 'Sección',
  chapter: 'Capítulo',
  heading: 'Partida',
  subheading: 'Subpartida',
  national: 'Nacional',
};

export function HierarchyTreeView({ hierarchy, onSelectNode }: HierarchyTreeViewProps) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-ink-secondary">
          {hierarchy.title}
        </h3>
        <CopyHsButton hsCode={hierarchy.selectedCode} size="sm" />
      </div>

      <ol className="mt-3 space-y-1.5">
        {hierarchy.nodes.map((node) => {
          const active = node.isCurrent || node.code === hierarchy.selectedCode;
          return (
            <li key={`${node.level}-${node.code}`} className={LEVEL_INDENT[node.level]}>
              <div
                className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                  active
                    ? 'border-accent-border bg-accent-soft'
                    : 'border-border-subtle bg-surface-muted hover:border-border-strong'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectNode?.(node)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded text-left focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
                >
                  <ChevronRight
                    className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-accent-ink' : 'text-ink-subtle'}`}
                    aria-hidden="true"
                  />
                  <span className="shrink-0 rounded bg-surface-panel px-1.5 py-0.5 text-[10px] font-medium text-ink-muted ring-1 ring-border-subtle">
                    {LEVEL_LABELS[node.level]}
                  </span>
                  <span className="truncate font-medium text-ink-primary">{node.title}</span>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  {node.dutyRate && (
                    <span className="font-mono text-[11px] text-ink-secondary">{node.dutyRate}</span>
                  )}
                  {node.legalRegime && (
                    <span className="rounded-full bg-surface-panel px-2 py-0.5 text-[10px] font-medium text-ink-muted ring-1 ring-border-subtle">
                      {node.legalRegime}
                    </span>
                  )}
                  <CopyHsButton hsCode={node.code} size="sm" />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
