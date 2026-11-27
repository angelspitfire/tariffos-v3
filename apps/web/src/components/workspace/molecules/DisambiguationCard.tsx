'use client';

import { ChevronRight } from 'lucide-react';
import type {
  A2UIDisambiguationComponent,
  A2UIDisambiguationOption,
} from '@tariffos/shared-types';

interface DisambiguationCardProps {
  component: A2UIDisambiguationComponent;
  onSelect: (option: A2UIDisambiguationOption) => void;
}

export function DisambiguationCard({ component, onSelect }: DisambiguationCardProps) {
  return (
    <section className="rounded-card border border-border-subtle bg-surface-panel p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink-primary">{component.question}</h3>
          {component.contextHint ? (
            <p className="mt-0.5 text-xs text-ink-muted">{component.contextHint}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-[11px] text-ink-muted">1 clic para elegir</span>
      </div>
      <div className="mt-3 space-y-2">
        {component.options.map((opt, idx) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt)}
            className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-muted px-3.5 py-3 text-left transition-colors hover:border-accent-brand hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-subtle font-mono text-[11px] font-semibold text-ink-muted transition-colors group-hover:bg-accent-brand group-hover:text-white">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-ink-primary group-hover:text-accent-ink">
                    {opt.label}
                  </span>
                  {opt.suggestedHsHint ? (
                    <span className="rounded bg-surface-panel px-1.5 py-0.5 font-mono text-[11px] text-accent-ink tabular-nums">
                      {opt.suggestedHsHint}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">
                  {opt.technicalDetail}
                </p>
              </div>
            </div>
            <div className="inline-flex shrink-0 items-center gap-1">
              <span className="text-[11px] font-semibold text-accent-ink opacity-0 transition-opacity group-hover:opacity-100">
                Elegir
              </span>
              <ChevronRight className="h-4 w-4 text-ink-subtle transition-colors group-hover:text-accent-ink" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
