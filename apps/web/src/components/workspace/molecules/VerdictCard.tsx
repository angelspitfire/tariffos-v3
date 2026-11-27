'use client';

import { useState } from 'react';
import {
  BookmarkPlus,
  Calculator,
  FileDown,
  FileText,
  GitBranch,
} from 'lucide-react';
import type { A2UIVerdictComponent } from '@tariffos/shared-types';
import { ConfidenceBadge } from '../atoms/ConfidenceBadge';
import { CopyHsButton } from '../atoms/CopyHsButton';
import { VerdictExecutiveSummary } from './VerdictExecutiveSummary';

interface VerdictCardProps {
  verdict: A2UIVerdictComponent;
  onOpenDossier?: () => void;
  onOpenCalculator?: () => void;
  onExportPdf?: () => void;
  onSaveSku?: () => void;
  onOpenRgi?: () => void;
}

const FOCUS_RING =
  'focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none';

export function VerdictCard({
  verdict,
  onOpenDossier,
  onOpenCalculator,
  onExportPdf,
  onSaveSku,
  onOpenRgi,
}: VerdictCardProps) {
  const [descExpanded, setDescExpanded] = useState(false);
  const summaryPoints = verdict.executiveSummary ?? [];
  const isLongDesc = verdict.description.length > 210;
  const uniqueRgiBadges = Array.from(
    new Set(verdict.rgiApplied.map((r) => r.trim()).filter(Boolean)),
  ).slice(0, 2);

  return (
    <section className="@container tos-rise rounded-card border border-border-subtle border-t-2 border-t-accent-brand/85 bg-surface-panel p-3.5 shadow-card sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[var(--color-success)]">
            Clasificación sugerida
          </span>
          <ConfidenceBadge label={verdict.confidenceLabel} />
          {uniqueRgiBadges.map((rgi, idx) => (
            <span
              key={`${rgi}-${idx}`}
              className="rounded-full border border-border-subtle bg-surface-muted px-2 py-0.5 font-mono text-[10px] font-medium text-ink-secondary"
            >
              {rgi}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2.5 min-w-0">
        <CopyHsButton
          hsCode={verdict.hsCode}
          size="lg"
          className={`border-0 bg-transparent px-0 py-0 text-[clamp(1.35rem,5.5cqw,1.875rem)] font-semibold tracking-tight hover:bg-transparent ${FOCUS_RING}`}
        />
      </div>

      <div className="mt-1.5">
        <p className={`text-sm leading-relaxed text-ink-secondary ${isLongDesc && !descExpanded ? 'line-clamp-3' : ''}`}>
          {verdict.description}
        </p>
        {isLongDesc ? (
          <button
            type="button"
            onClick={() => setDescExpanded((prev) => !prev)}
            className={`mt-1 cursor-pointer rounded text-[11px] font-medium text-accent-ink hover:underline ${FOCUS_RING}`}
          >
            {descExpanded ? 'Mostrar menos' : 'Ver designación completa'}
          </button>
        ) : null}
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2.5">
        <div className="rounded-lg border border-border-hairline bg-surface-muted/70 px-3 py-2">
          <div className="text-[11px] text-ink-muted">Ad Valorem</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-ink-primary tabular-nums">
            {verdict.adValoremPercent}%
          </div>
        </div>
        <div className="rounded-lg border border-border-hairline bg-surface-muted/70 px-3 py-2">
          <div className="text-[11px] text-ink-muted">IVA</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-ink-primary tabular-nums">
            {verdict.vatPercent}%
          </div>
        </div>
        <div className="min-w-0 rounded-lg border border-border-hairline bg-surface-muted/70 px-3 py-2">
          <div className="text-[11px] text-ink-muted">Régimen</div>
          <div
            className="mt-0.5 truncate font-mono text-sm font-semibold text-ink-primary tabular-nums"
            title={verdict.legalRegimeSummary}
          >
            {verdict.legalRegimeCode}
          </div>
        </div>
      </div>

      {verdict.legalRegimeSummary ? (
        <p className="mt-3 border-t border-border-hairline pt-2.5 text-xs leading-relaxed text-ink-secondary">
          {verdict.legalRegimeSummary}
        </p>
      ) : null}

      <VerdictExecutiveSummary hsCode={verdict.hsCode} points={summaryPoints} />

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border-hairline pt-3">
        <button
          type="button"
          onClick={onOpenDossier}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-surface-inverted px-3.5 py-2 text-xs font-semibold text-ink-on-inverted transition-colors hover:bg-surface-inverted-hover whitespace-nowrap ${FOCUS_RING}`}
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          Ver Dossier
        </button>
        <button
          type="button"
          onClick={onOpenCalculator}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-surface-subtle px-3.5 py-2 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-hover whitespace-nowrap ${FOCUS_RING}`}
        >
          <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
          Calcular CIF
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent-brand px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-brand-hover whitespace-nowrap ${FOCUS_RING}`}
        >
          <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
          Exportar PDF
        </button>
        <button
          type="button"
          onClick={onSaveSku}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-accent-border bg-accent-soft px-3.5 py-2 text-xs font-semibold text-accent-ink transition-opacity hover:opacity-90 whitespace-nowrap ${FOCUS_RING}`}
        >
          <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Guardar SKU
        </button>
        <button
          type="button"
          onClick={onOpenRgi}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface-panel px-3.5 py-2 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-hover whitespace-nowrap ${FOCUS_RING}`}
        >
          <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
          Camino RGI
        </button>
      </div>
    </section>
  );
}
