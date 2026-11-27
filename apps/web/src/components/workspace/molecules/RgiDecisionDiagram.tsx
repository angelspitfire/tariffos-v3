'use client';

import { ArrowRight, GitBranch } from 'lucide-react';
import type { A2UIRgiPathStep } from '@tariffos/shared-types';

export interface RgiDecisionDiagramProps {
  hsCode: string;
  confidencePct?: number;
  rgiSteps: readonly A2UIRgiPathStep[];
  flagsCount?: number;
  unresolvedCount?: number;
  onOpenRgi?: () => void;
  embedded?: boolean;
}

export function RgiDecisionDiagram({
  hsCode,
  confidencePct,
  rgiSteps,
  flagsCount = 0,
  unresolvedCount = 0,
  onOpenRgi,
  embedded = false,
}: RgiDecisionDiagramProps) {
  if (rgiSteps.length === 0) return null;

  const visibleSteps = rgiSteps.slice(0, 4);
  const showFlagsNode = flagsCount > 0 || unresolvedCount > 0;

  return (
    <section
      className={
        embedded
          ? 'px-5 py-4'
          : 'rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs'
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
          <GitBranch className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
          Diagrama de decisión RGI
        </h3>
        {onOpenRgi ? (
          <button
            type="button"
            onClick={onOpenRgi}
            className="no-print cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap text-accent-ink transition-colors hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            Ver comparador completo
          </button>
        ) : null}
      </div>

      <div className="@container mt-3">
        <div
          role="img"
          aria-label={`Diagrama de decisión RGI de ${hsCode}`}
          className="flex flex-wrap items-stretch gap-2"
        >
          {visibleSteps.map((step, idx) => (
            <div key={`${step.rule}-${idx}`} className="flex min-w-0 flex-1 basis-36 items-center gap-2">
              <div className="flex h-full w-full flex-col justify-center rounded-lg border border-border-subtle bg-surface-muted/70 px-3 py-2">
                <div className="font-mono text-[11px] font-semibold text-ink-primary">
                  {step.rule}
                </div>
                <div className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink-secondary">
                  {step.conclusion ?? step.application}
                </div>
              </div>
              <ArrowRight
                className="hidden h-3.5 w-3.5 shrink-0 text-ink-muted @sm:block"
                aria-hidden="true"
              />
            </div>
          ))}

          <div className="flex min-w-0 flex-1 basis-40 items-center gap-2">
            <div className="flex h-full w-full flex-col justify-center rounded-lg border border-emerald-600/50 bg-emerald-500/10 px-3 py-2 dark:border-emerald-400/50">
              <div
                translate="no"
                className="font-mono text-xs font-bold tracking-tight text-emerald-800 dark:text-emerald-200"
              >
                {hsCode}
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-emerald-700 tabular-nums dark:text-emerald-300">
                {confidencePct !== undefined ? `Confianza ${confidencePct}%` : 'Partida final'}
              </div>
            </div>
            {showFlagsNode ? (
              <ArrowRight
                className="hidden h-3.5 w-3.5 shrink-0 text-ink-muted @sm:block"
                aria-hidden="true"
              />
            ) : null}
          </div>

          {showFlagsNode ? (
            <div className="flex min-w-0 flex-1 basis-36 flex-col justify-center rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2">
              <div className="text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                Flags y Alcance
              </div>
              <div className="mt-0.5 text-[11px] text-amber-800 tabular-nums dark:text-amber-300">
                {flagsCount} alertas, {unresolvedCount} pend.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
