'use client';

import { CheckCircle2, GitBranch, XCircle } from 'lucide-react';
import type {
  A2UIComparisonCandidate,
  A2UIComparisonComponent,
  A2UIDossierComponent,
  A2UIHierarchyComponent,
} from '@tariffos/shared-types';
import { CopyHsButton } from '../atoms/CopyHsButton';
import { HierarchyTreeView } from './HierarchyTreeView';

export interface RgiPathAndComparatorViewProps {
  dossier?: A2UIDossierComponent;
  comparison?: A2UIComparisonComponent;
  hierarchy?: A2UIHierarchyComponent;
  onAdoptCandidate?: (candidate: A2UIComparisonCandidate) => void;
}

export function RgiPathAndComparatorView({
  dossier,
  comparison,
  hierarchy,
  onAdoptCandidate,
}: RgiPathAndComparatorViewProps) {
  const rgiSteps = dossier?.rgiSteps ?? [];
  const rejected = dossier?.rejectedAlternatives ?? [];
  const candidates = comparison?.candidates ?? [];

  return (
    <section className="space-y-4">
      {rgiSteps.length > 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 space-y-3">
          <h3 className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <GitBranch className="h-3.5 w-3.5 text-accent-ink" />
            Recorrido RGI (1 → 6)
          </h3>
          <ol className="space-y-2.5">
            {rgiSteps.map((step, idx) => (
              <li
                key={`${step.rule}-${idx}`}
                className="rounded-lg border border-border-hairline bg-surface-muted p-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-accent-ink">{step.rule}</span>
                  {step.note ? (
                    <span className="font-mono text-[10px] text-ink-muted">{step.note}</span>
                  ) : null}
                </div>
                <p className="text-ink-secondary">{step.application}</p>
                {step.conclusion ? (
                  <p className="font-medium text-ink-primary">{step.conclusion}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {candidates.length > 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Comparador de Partidas Candidatas ({candidates.length})
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {candidates.map((cand) => (
              <div
                key={cand.hsCode}
                className={`rounded-xl border p-3.5 text-xs space-y-2 ${
                  cand.recommended
                    ? 'border-accent-border bg-accent-soft/35'
                    : 'border-border-subtle bg-surface-muted/50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CopyHsButton hsCode={cand.hsCode} size="sm" />
                    {cand.recommended ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Recomendada
                      </span>
                    ) : null}
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-ink-primary">
                    Ad Valorem {cand.adValoremPercent}% · {cand.legalRegime}
                  </span>
                </div>
                <div className="font-medium text-ink-primary">{cand.title}</div>
                <p className="text-ink-secondary">{cand.rgiRationale}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="rounded-md bg-emerald-500/10 px-2.5 py-1.5 text-emerald-900 dark:text-emerald-200">
                    <strong>Por qué aplica:</strong> {cand.pros}
                  </div>
                  <div className="rounded-md bg-rose-500/10 px-2.5 py-1.5 text-rose-900 dark:text-rose-200">
                    <strong>Por qué no:</strong> {cand.cons}
                  </div>
                </div>
                {!cand.recommended && onAdoptCandidate ? (
                  <button
                    type="button"
                    onClick={() => onAdoptCandidate(cand)}
                    className="rounded-lg border border-border-strong bg-surface-panel px-2.5 py-1 text-[11px] font-semibold text-ink-primary hover:bg-surface-hover cursor-pointer"
                  >
                    Adoptar {cand.hsCode}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {rejected.length > 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 space-y-2.5">
          <h3 className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <XCircle className="h-3.5 w-3.5 text-rose-500" />
            Alternativas Descartadas
          </h3>
          <ul className="space-y-2 text-xs">
            {rejected.map((item) => (
              <li
                key={item.hsCode}
                className="rounded-lg border border-border-hairline bg-surface-muted px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-ink-primary">{item.hsCode}</span>
                  <span className="text-[11px] text-ink-muted">{item.rule}</span>
                </div>
                <p className="mt-0.5 text-ink-secondary">{item.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hierarchy ? <HierarchyTreeView hierarchy={hierarchy} /> : null}
    </section>
  );
}
