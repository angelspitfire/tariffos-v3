'use client';

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
    <section className="rounded-xl border border-border-subtle bg-surface-panel p-3.5 shadow-xs">
      <h4 className="text-xs font-semibold text-ink-primary">{component.question}</h4>
      {component.contextHint && (
        <p className="mt-0.5 text-[11px] text-ink-muted">{component.contextHint}</p>
      )}
      <div className="mt-2.5 space-y-1.5">
        {component.options.map((opt, idx) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt)}
            className="flex w-full items-start gap-2.5 rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-left transition hover:border-accent-border hover:bg-accent-soft"
          >
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-panel font-mono text-[11px] font-semibold text-accent-ink ring-1 ring-border-subtle">
              {idx + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-ink-primary">
                <span>{opt.label}</span>
                {opt.suggestedHsHint && (
                  <span className="font-mono text-[11px] text-accent-ink">
                    {opt.suggestedHsHint}
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-[11px] text-ink-muted">{opt.technicalDetail}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
