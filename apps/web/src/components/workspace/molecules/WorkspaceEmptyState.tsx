'use client';

import { ArrowUpRight, FileSpreadsheet, Scale, UploadCloud } from 'lucide-react';
import {
  SAMPLE_BATCH_DOCUMENTS,
  SAMPLE_MERCHANDISE,
  type SampleBatchDocument,
  type SampleMerchandise,
} from '@/lib/workspace/jurisdictions';

export interface WorkspaceEmptyStateProps {
  onFocusComposer: () => void;
  onTriggerUpload: () => void;
  onTriggerBatchUpload?: () => void;
  onRunSample: (sample: SampleMerchandise) => void;
  onRunBatchSample: (batch: SampleBatchDocument) => void;
}

const WORKFLOW_CARD =
  'tos-rise group cursor-pointer space-y-2 rounded-surface border border-border-subtle bg-surface-panel p-4 text-left shadow-elev-1 transition-colors hover:border-accent-brand focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none';

const QUICK_CHIP =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface-panel px-3.5 py-1.5 text-xs text-ink-secondary transition-colors hover:border-accent-brand hover:text-accent-ink focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none';

export function WorkspaceEmptyState({
  onFocusComposer,
  onTriggerUpload,
  onTriggerBatchUpload,
  onRunSample,
  onRunBatchSample,
}: WorkspaceEmptyStateProps) {
  const firstBatch = SAMPLE_BATCH_DOCUMENTS[0];

  return (
    <div className="mx-auto my-auto flex max-w-2xl flex-col justify-center space-y-7 py-4">
      <div className="space-y-2.5 text-center">
        <h1 className="mx-auto text-3xl font-medium tracking-[-0.03em] text-ink-primary [text-wrap:balance] sm:text-4xl">
          ¿Qué mercancía clasificamos hoy?
        </h1>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-ink-secondary">
          Conversa sobre normativa aduanera, describe un producto o arrastra facturas, fichas técnicas y manifiestos aquí.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button type="button" onClick={onFocusComposer} className={WORKFLOW_CARD}>
          <div className="flex items-center justify-between gap-2">
            <Scale className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
            <ArrowUpRight className="h-3.5 w-3.5 text-ink-subtle group-hover:text-accent-ink" aria-hidden="true" />
          </div>
          <div className="text-xs font-semibold text-ink-primary">Clasificar producto</div>
          <p className="text-[11px] leading-relaxed text-ink-muted">
            Obtén partida HS, criterio RGI, ficha técnica y cálculo tributario CIF.
          </p>
        </button>

        <button type="button" onClick={onTriggerUpload} className={WORKFLOW_CARD}>
          <div className="flex items-center justify-between gap-2">
            <UploadCloud className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
            <ArrowUpRight className="h-3.5 w-3.5 text-ink-subtle group-hover:text-accent-ink" aria-hidden="true" />
          </div>
          <div className="text-xs font-semibold text-ink-primary">Factura, B/L o Ficha PDF</div>
          <p className="text-[11px] leading-relaxed text-ink-muted">
            Adjunta PDF, imagen o pega capturas (<span className="font-mono">Ctrl+V</span>) al hilo.
          </p>
        </button>

        {firstBatch ? (
          <button
            type="button"
            onClick={() => (onTriggerBatchUpload ? onTriggerBatchUpload() : onRunBatchSample(firstBatch))}
            className={WORKFLOW_CARD}
          >
            <div className="flex items-center justify-between gap-2">
              <FileSpreadsheet className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
              <ArrowUpRight className="h-3.5 w-3.5 text-ink-subtle group-hover:text-accent-ink" aria-hidden="true" />
            </div>
            <div className="text-xs font-semibold text-ink-primary">
              {onTriggerBatchUpload ? 'Lote masivo Excel / PDF' : 'Probar lote manifiesto'}
            </div>
            <p className="text-[11px] leading-relaxed text-ink-muted">
              {onTriggerBatchUpload
                ? 'Procesa facturas extensas (.xlsx, .csv, PDF) con triage en vivo.'
                : firstBatch.label}
            </p>
          </button>
        ) : null}
      </div>

      <div className="space-y-2.5 pt-1 text-center">
        <div className="text-xs font-medium text-ink-muted">Pruebas rápidas en 1 clic</div>
        <div className="flex flex-wrap justify-center gap-2">
          {SAMPLE_MERCHANDISE.slice(0, 3).map((sample) => (
            <button key={sample.id} type="button" onClick={() => onRunSample(sample)} className={QUICK_CHIP}>
              <span className="font-medium text-ink-primary">{sample.label}</span>
              <span className="font-mono text-[10px] text-ink-muted">{sample.hsHint}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              onRunSample({
                id: 'bcv-query',
                label: 'Tasa oficial BCV',
                category: 'Divisas',
                description: '¿Cuál es la tasa oficial del BCV hoy?',
                origin: 'VE',
                hsHint: 'BCV',
              })
            }
            className={QUICK_CHIP}
          >
            <span className="font-medium text-ink-primary">Tasa oficial BCV</span>
          </button>
          {SAMPLE_BATCH_DOCUMENTS.slice(1, 2).map((batch) => (
            <button key={batch.id} type="button" onClick={() => onRunBatchSample(batch)} className={QUICK_CHIP}>
              <FileSpreadsheet className="h-3 w-3 text-accent-ink" aria-hidden="true" />
              <span className="font-medium text-ink-primary">{batch.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
