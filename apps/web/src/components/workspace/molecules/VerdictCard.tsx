'use client';

import { useState } from 'react';
import {
  BookmarkPlus,
  Calculator,
  ChevronDown,
  ChevronUp,
  FileDown,
  FileText,
  GitBranch,
} from 'lucide-react';
import type { A2UIVerdictComponent } from '@tariffos/shared-types';
import { ConfidenceBadge } from '../atoms/ConfidenceBadge';
import { CopyHsButton } from '../atoms/CopyHsButton';

interface VerdictCardProps {
  verdict: A2UIVerdictComponent;
  onOpenDossier?: () => void;
  onOpenCalculator?: () => void;
  onExportPdf?: () => void;
  onSaveSku?: () => void;
  onOpenRgi?: () => void;
}

export function VerdictCard({
  verdict,
  onOpenDossier,
  onOpenCalculator,
  onExportPdf,
  onSaveSku,
  onOpenRgi,
}: VerdictCardProps) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const summaryPoints = verdict.executiveSummary ?? [];
  const hasHighRisk = summaryPoints.some((pt) => pt.severity === 'high');

  return (
    <section className="tos-rise rounded-surface border border-line-frost bg-surface-frost-strong p-4 sm:p-5 shadow-elev-1 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
          Clasificación sugerida
        </span>
        <ConfidenceBadge label={verdict.confidenceLabel} />
        {verdict.rgiApplied.slice(0, 2).map((rgi) => (
          <span
            key={rgi}
            className="rounded-full border border-border-subtle bg-surface-muted px-2 py-0.5 font-mono text-[10px] font-medium text-ink-secondary"
          >
            {rgi}
          </span>
        ))}
      </div>

      <div className="mt-2">
        <CopyHsButton
          hsCode={verdict.hsCode}
          size="lg"
          className="border-0 bg-transparent px-0 py-0 text-2xl sm:text-3xl font-bold hover:bg-transparent"
        />
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{verdict.description}</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-card border border-border-subtle bg-surface-muted px-3 py-2">
          <div className="text-[11px] text-ink-muted">Ad Valorem</div>
          <div className="mt-0.5 text-sm font-semibold text-ink-primary tabular-nums">
            {verdict.adValoremPercent}%
          </div>
        </div>
        <div className="rounded-card border border-border-subtle bg-surface-muted px-3 py-2">
          <div className="text-[11px] text-ink-muted">IVA</div>
          <div className="mt-0.5 text-sm font-semibold text-ink-primary tabular-nums">
            {verdict.vatPercent}%
          </div>
        </div>
        <div className="rounded-card border border-border-subtle bg-surface-muted px-3 py-2">
          <div className="text-[11px] text-ink-muted">Régimen</div>
          <div className="mt-0.5 truncate text-sm font-semibold text-ink-primary" title={verdict.legalRegimeSummary}>
            {verdict.legalRegimeCode}
          </div>
        </div>
      </div>

      {summaryPoints.length > 0 && (
        <div className="mt-3 border-t border-border-hairline pt-2.5">
          <button
            type="button"
            onClick={() => setSummaryOpen((prev) => !prev)}
            className="flex w-full cursor-pointer items-center justify-between text-xs font-medium text-ink-secondary hover:text-ink-primary"
          >
            <span className="inline-flex items-center gap-2">
              <span>Resumen ejecutivo ({summaryPoints.length})</span>
              {hasHighRisk ? (
                <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-300">
                  Riesgo alto detectado
                </span>
              ) : null}
            </span>
            {summaryOpen ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
          {summaryOpen && (
            <ul className="mt-2 space-y-2">
              {summaryPoints.map((pt) => (
                <li
                  key={pt.title}
                  className="rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-xs"
                >
                  <div className="font-semibold text-ink-primary">{pt.title}</div>
                  <p className="mt-0.5 text-ink-secondary">{pt.risk}</p>
                  <p className="mt-0.5 text-ink-muted">Recomendación: {pt.recommendation}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border-hairline pt-3">
        <button
          type="button"
          onClick={onOpenDossier}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-brand px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-accent-brand-hover"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          Ver Dossier
        </button>
        <button
          type="button"
          onClick={onOpenCalculator}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-ink-primary transition hover:bg-surface-hover"
        >
          <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
          Calcular CIF
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-ink-primary transition hover:bg-surface-hover"
        >
          <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
          Exportar PDF
        </button>
        <button
          type="button"
          onClick={onSaveSku}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-ink-primary transition hover:bg-surface-hover"
        >
          <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Guardar SKU
        </button>
        <button
          type="button"
          onClick={onOpenRgi}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-ink-primary transition hover:bg-surface-hover"
        >
          <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
          Camino RGI
        </button>
      </div>
    </section>
  );
}
