'use client';

import { ShieldCheck } from 'lucide-react';
import type { A2UIDossierComponent, JurisdictionConfig } from '@tariffos/shared-types';

export interface RegulatoryDiffViewProps {
  dossier?: A2UIDossierComponent;
  jurisdiction: JurisdictionConfig;
}

export function RegulatoryDiffView({ dossier, jurisdiction }: RegulatoryDiffViewProps) {
  const permits = dossier?.permits ?? [];
  const flags = dossier?.flags ?? [];

  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-primary">
          <ShieldCheck className="h-4 w-4 text-accent-ink" />
          <span>Marco Normativo · {jurisdiction.country} ({jurisdiction.authority})</span>
        </div>
        <p className="text-xs leading-relaxed text-ink-secondary">
          {jurisdiction.legalRegimeNotes}
        </p>
      </div>

      {flags.length > 0 ? (
        <div className="space-y-2">
          {flags.map((flag) => (
            <div
              key={`${flag.title}-${flag.text}`}
              className={`rounded-xl border p-3.5 text-xs ${
                flag.type === 'warn'
                  ? 'border-amber-300/80 bg-amber-50/70 dark:bg-amber-950/20'
                  : 'border-border-subtle bg-surface-panel'
              }`}
            >
              <div className="font-semibold text-ink-primary">{flag.title}</div>
              <p className="mt-1 text-ink-secondary">{flag.text}</p>
            </div>
          ))}
        </div>
      ) : null}

      {permits.length > 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Permisos y Controles OGA Aplicables
          </h4>
          <ul className="space-y-1.5 text-xs">
            {permits.map((p) => (
              <li key={`${p.code}-${p.name}`} className="flex items-center justify-between">
                <span className="font-medium text-ink-primary">
                  {p.code} · {p.name}
                </span>
                <span className="font-mono text-[11px] text-ink-muted">{p.organism}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-border-subtle bg-surface-muted p-4 text-xs text-ink-muted">
          Sin alertas regulatorias restrictivas detectadas para la partida actual.
        </div>
      )}
    </section>
  );
}
