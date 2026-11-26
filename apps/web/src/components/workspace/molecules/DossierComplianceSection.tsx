'use client';

import { AlertTriangle, CheckSquare, Info, Square, XCircle } from 'lucide-react';
import type {
  A2UIClassificationFlag,
  A2UIRejectedAlternative,
} from '@tariffos/shared-types';

export interface DossierComplianceSectionProps {
  flags?: readonly A2UIClassificationFlag[];
  rejectedAlternatives?: readonly A2UIRejectedAlternative[];
  unresolved?: readonly string[];
  verifiedAgainstOfficial?: boolean;
  jurisdictionName: string;
}

export function DossierComplianceSection({
  flags = [],
  rejectedAlternatives = [],
  unresolved = [],
  verifiedAgainstOfficial = true,
  jurisdictionName,
}: DossierComplianceSectionProps) {
  if (flags.length === 0 && rejectedAlternatives.length === 0 && unresolved.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {flags.length > 0 ? (
        <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
          <h3 className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Flags de medidas y cumplimiento ({flags.length})
          </h3>
          <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {flags.map((flag, idx) => {
              const isWarn = flag.type === 'warn';
              return (
                <div
                  key={`${flag.title}-${idx}`}
                  className={
                    isWarn
                      ? 'rounded-lg border border-amber-500/35 bg-amber-500/8 p-3 text-xs text-amber-950 dark:text-amber-100'
                      : 'rounded-lg border border-border-subtle bg-surface-muted p-3 text-xs text-ink-secondary'
                  }
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    {isWarn ? (
                      <AlertTriangle
                        className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <Info
                        className="h-3.5 w-3.5 shrink-0 text-accent-ink"
                        aria-hidden="true"
                      />
                    )}
                    <span>{flag.title}</span>
                  </div>
                  <p className="mt-1 leading-relaxed opacity-90">{flag.text}</p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {rejectedAlternatives.length > 0 ? (
        <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
          <h3 className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            <XCircle className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />
            Alternativas Rechazadas ({rejectedAlternatives.length})
          </h3>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-[11px] text-ink-muted">
                  <th className="py-1.5 pr-3 font-semibold">Partida</th>
                  <th className="py-1.5 pr-3 font-semibold">Motivo</th>
                  <th className="py-1.5 font-semibold">Regla / Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {rejectedAlternatives.map((item) => (
                  <tr key={item.hsCode}>
                    <td className="py-2 pr-3 font-mono font-semibold whitespace-nowrap text-ink-primary">
                      {item.hsCode}
                    </td>
                    <td className="py-2 pr-3 text-ink-secondary">{item.reason}</td>
                    <td className="py-2 whitespace-nowrap text-ink-muted">{item.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {unresolved.length > 0 ? (
        <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
          <h3 className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Información no resuelta ({unresolved.length})
          </h3>
          <ul className="mt-2.5 space-y-2 text-xs">
            {verifiedAgainstOfficial ? (
              <li className="flex items-start gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Verificación de partida y texto oficial en {jurisdictionName}.</span>
              </li>
            ) : null}
            {unresolved.map((item) => (
              <li key={item} className="flex items-start gap-2 text-ink-secondary">
                <Square
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
