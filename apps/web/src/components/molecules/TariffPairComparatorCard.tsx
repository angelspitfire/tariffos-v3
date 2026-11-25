'use client';

import type { ClassificationAlternative, RejectedAlternative } from '@tariffos/shared-types';
import { Columns2 } from 'lucide-react';

export interface TariffPairComparatorCardProps {
  primaryCode: string;
  primaryDescription: string;
  alternatives: ClassificationAlternative[];
  rejected: RejectedAlternative[];
  onSelectAlternative?: (code: string) => void;
}

/** Side-by-side comparison of candidate HS codes and rejected headings. */
export function TariffPairComparatorCard({
  primaryCode,
  primaryDescription,
  alternatives,
  rejected,
  onSelectAlternative,
}: TariffPairComparatorCardProps) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 space-y-4">
      <header className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Columns2 className="h-4 w-4 text-accent-ink" />
          <h3 className="text-sm font-semibold text-ink-primary">Comparador de Subpartidas</h3>
        </div>
        <span className="tabular-nums text-xs font-medium text-ink-muted">
          Principal: {primaryCode}
        </span>
      </header>

      <div className="rounded-lg border border-accent-border bg-accent-soft p-3">
        <div className="tabular-nums text-xs font-semibold text-accent-ink">{primaryCode}</div>
        <p className="mt-1 text-xs text-ink-primary">{primaryDescription}</p>
      </div>

      {alternatives.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Alternativas plausibles
          </h4>
          {alternatives.map((alt) => (
            <div
              key={alt.code}
              className="rounded-lg border border-border-subtle bg-surface-muted p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="tabular-nums text-xs font-semibold text-ink-primary">{alt.code}</span>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums text-xs text-ink-muted">{alt.confPct}%</span>
                  {onSelectAlternative && (
                    <button
                      type="button"
                      onClick={() => onSelectAlternative(alt.code)}
                      className="rounded-md border border-border-strong bg-surface-panel px-2 py-0.5 text-xs font-medium text-ink-primary hover:bg-surface-hover"
                    >
                      Elegir
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-ink-secondary">{alt.desc}</p>
              <p className="text-[11px] text-ink-muted">Aplica: {alt.whyApply}</p>
              <p className="text-[11px] text-ink-muted">Descartada por: {alt.whyNot}</p>
            </div>
          ))}
        </div>
      )}

      {rejected.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Excluidas por RGI
          </h4>
          <ul className="space-y-1">
            {rejected.map((rej) => (
              <li
                key={rej.code}
                className="flex items-start justify-between gap-2 rounded-md border border-border-subtle px-2.5 py-1.5 text-xs"
              >
                <span className="tabular-nums font-medium text-ink-secondary">{rej.code}</span>
                <span className="text-ink-muted">{rej.reason} ({rej.rule})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
