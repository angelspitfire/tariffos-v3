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

  return (
    <section className="rounded-[22px] border border-black/[0.07] dark:border-white/[0.09] bg-white/90 dark:bg-[#111827]/85 backdrop-blur-md p-4 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.14)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium tracking-wide text-ink-muted uppercase">
            Veredicto Arancelario
          </span>
          <CopyHsButton hsCode={verdict.hsCode} size="lg" />
        </div>
        <ConfidenceBadge label={verdict.confidenceLabel} />
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-ink-secondary">{verdict.description}</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border-subtle bg-surface-muted px-3 py-2">
          <div className="text-[11px] text-ink-muted">Ad Valorem</div>
          <div className="mt-0.5 text-sm font-semibold text-ink-primary tabular-nums">
            {verdict.adValoremPercent}%
          </div>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface-muted px-3 py-2">
          <div className="text-[11px] text-ink-muted">IVA</div>
          <div className="mt-0.5 text-sm font-semibold text-ink-primary tabular-nums">
            {verdict.vatPercent}%
          </div>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface-muted px-3 py-2">
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
            className="flex w-full items-center justify-between text-xs font-medium text-ink-secondary hover:text-ink-primary"
          >
            <span>Resumen ejecutivo ({summaryPoints.length})</span>
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
          className="inline-flex items-center gap-1.5 rounded-full bg-accent-brand px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-brand-hover cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          Ver Dossier
        </button>
        <button
          type="button"
          onClick={onOpenCalculator}
          className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted px-3 py-1.5 text-xs font-medium text-ink-primary transition hover:bg-surface-hover cursor-pointer"
        >
          <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
          Calcular CIF
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted px-3 py-1.5 text-xs font-medium text-ink-primary transition hover:bg-surface-hover cursor-pointer"
        >
          <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
          Exportar PDF
        </button>
        <button
          type="button"
          onClick={onSaveSku}
          className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted px-3 py-1.5 text-xs font-medium text-ink-primary transition hover:bg-surface-hover cursor-pointer"
        >
          <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Guardar SKU
        </button>
        <button
          type="button"
          onClick={onOpenRgi}
          className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted px-3 py-1.5 text-xs font-medium text-ink-primary transition hover:bg-surface-hover cursor-pointer"
        >
          <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
          Camino RGI
        </button>
      </div>
    </section>
  );
}
