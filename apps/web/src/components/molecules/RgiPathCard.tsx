'use client';

import type { RgiStep } from '@tariffos/shared-types';
import { GitBranch, CheckCircle2 } from 'lucide-react';

export interface RgiPathCardProps {
  hsCode: string;
  officialDescription: string;
  steps: RgiStep[];
}

/** Displays the step-by-step RGI 1->6 legal reasoning path. */
export function RgiPathCard({ hsCode, officialDescription, steps }: RgiPathCardProps) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 space-y-3">
      <header className="flex items-start justify-between gap-3 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-accent-ink" />
          <h3 className="text-sm font-semibold text-ink-primary">Recorrido RGI 1 → 6</h3>
        </div>
        <span className="tabular-nums rounded-md bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-ink">
          {hsCode}
        </span>
      </header>
      <p className="text-xs text-ink-secondary">{officialDescription}</p>
      <ol className="space-y-2.5">
        {steps.map((step, idx) => (
          <li
            key={`${step.rule}-${idx}`}
            className="rounded-lg border border-border-subtle bg-surface-muted p-3 space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink-primary">{step.rule}</span>
              <span className="text-ink-muted">{step.note}</span>
            </div>
            <ul className="list-disc pl-4 text-xs text-ink-secondary space-y-0.5">
              {step.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <div className="flex items-center gap-1.5 pt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{step.conclusion}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
