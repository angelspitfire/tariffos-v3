'use client';

import { AlertTriangle, BadgeCheck, FileCheck2, Percent, ScrollText, ShieldCheck } from 'lucide-react';
import type {
  A2UIBatchManifestComponent,
  A2UICalculatorComponent,
  A2UIDossierComponent,
  CanvasTabType,
} from '@tariffos/shared-types';

export interface CanvasStatusStripProps {
  dossier?: A2UIDossierComponent;
  calculator?: A2UICalculatorComponent;
  batch?: A2UIBatchManifestComponent;
  onSelectTab: (tab: CanvasTabType) => void;
}

export function CanvasStatusStrip({
  dossier,
  calculator,
  batch,
  onSelectTab,
}: CanvasStatusStripProps) {
  if (!dossier && !calculator && !batch) return null;

  const permitsCount = dossier?.permits.length ?? 0;
  const hasControlFlags = Boolean(dossier?.flags?.some((f) => f.type === 'warn'));
  const batchNeedsReview = batch ? batch.items.some((i) => i.status === 'needs_review') : false;
  const isControlled = permitsCount > 0 || hasControlFlags || batchNeedsReview;

  const adValorem = calculator?.adValoremPercent ?? null;
  const isExempt = adValorem === 0 || Boolean(calculator?.exemptionAvailable);

  return (
    <section
      aria-label="Estado aduanero del expediente"
      className="no-print flex flex-wrap items-center gap-1.5 border-b border-border-subtle bg-surface-muted/45 px-4 py-2"
    >
      <button
        type="button"
        onClick={() => onSelectTab('regulatory_diff')}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors ${
          isControlled
            ? 'border-amber-200 bg-amber-50/90 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-200'
            : 'border-emerald-200 bg-emerald-50/85 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
        }`}
      >
        {isControlled ? (
          <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
        ) : (
          <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden="true" />
        )}
        <span>{isControlled ? 'Sujeta a control' : 'Libre importación'}</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab(dossier ? 'dossier' : 'batch_manifest')}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors ${
          permitsCount > 0
            ? 'border-amber-200 bg-amber-50/90 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-200'
            : 'border-emerald-200 bg-emerald-50/85 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
        }`}
      >
        {permitsCount > 0 ? (
          <ScrollText className="h-3 w-3 shrink-0" aria-hidden="true" />
        ) : (
          <FileCheck2 className="h-3 w-3 shrink-0" aria-hidden="true" />
        )}
        <span>{permitsCount > 0 ? `Requiere permiso (${permitsCount})` : 'Sin licencia previa'}</span>
      </button>

      {adValorem !== null ? (
        <button
          type="button"
          onClick={() => onSelectTab('calculator')}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors ${
            isExempt
              ? 'border-emerald-200 bg-emerald-50/85 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
              : 'border-border-subtle bg-surface-panel text-ink-primary'
          }`}
        >
          {isExempt ? (
            <BadgeCheck className="h-3 w-3 shrink-0" aria-hidden="true" />
          ) : (
            <Percent className="h-3 w-3 shrink-0 text-ink-muted" aria-hidden="true" />
          )}
          <span>{adValorem === 0 ? 'Exenta de aranceles (0%)' : `Gravada (${adValorem}% Ad Valorem)`}</span>
        </button>
      ) : null}
    </section>
  );
}
