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
  onRunSample: (sample: SampleMerchandise) => void;
  onRunBatchSample: (batch: SampleBatchDocument) => void;
}

export function WorkspaceEmptyState({
  onFocusComposer,
  onTriggerUpload,
  onRunSample,
  onRunBatchSample,
}: WorkspaceEmptyStateProps) {
  const firstBatch = SAMPLE_BATCH_DOCUMENTS[0];

  return (
    <div className="my-auto max-w-2xl mx-auto flex flex-col justify-center py-6 space-y-7">
      <div className="text-center space-y-2.5">
        <p className="font-mono text-[11px] tracking-[0.12em] text-ink-muted uppercase">
          TARIFFOS · MOTOR ARANCELARIO AUDITABLE
        </p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-ink-primary [text-wrap:balance] mx-auto">
          ¿Qué mercancía clasificamos hoy?
        </h1>
        <p className="text-sm text-ink-secondary leading-relaxed max-w-lg mx-auto">
          Describe una mercancía abajo o arrastra y suelta documentos (Excel, CSV, PDF o fotos) directamente en esta pantalla.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={onFocusComposer}
          className="text-left p-4 bg-surface-panel/85 backdrop-blur-md border border-border-subtle hover:border-accent-brand rounded-[22px] shadow-[0_8px_24px_-16px_rgba(15,23,42,0.14)] transition-colors group cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between gap-2">
            <Scale className="w-4 h-4 text-accent-ink shrink-0" />
            <ArrowUpRight className="w-3.5 h-3.5 text-ink-subtle group-hover:text-accent-ink" />
          </div>
          <div className="text-xs font-semibold text-ink-primary">
            Clasificar producto
          </div>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Obtén partida HS, criterio RGI, ficha HITL y cálculo tributario.
          </p>
        </button>

        <button
          type="button"
          onClick={onTriggerUpload}
          className="text-left p-4 bg-surface-panel/85 backdrop-blur-md border border-border-subtle hover:border-accent-brand rounded-[22px] shadow-[0_8px_24px_-16px_rgba(15,23,42,0.14)] transition-colors group cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between gap-2">
            <UploadCloud className="w-4 h-4 text-accent-ink shrink-0" />
            <ArrowUpRight className="w-3.5 h-3.5 text-ink-subtle group-hover:text-accent-ink" />
          </div>
          <div className="text-xs font-semibold text-ink-primary">
            Factura, B/L o Ficha PDF
          </div>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Extrae datos técnicos desde PDF, imagen o pegando (<span className="font-mono">Ctrl+V</span>).
          </p>
        </button>

        {firstBatch ? (
          <button
            type="button"
            onClick={() => onRunBatchSample(firstBatch)}
            className="text-left p-4 bg-surface-panel/85 backdrop-blur-md border border-border-subtle hover:border-accent-brand rounded-[22px] shadow-[0_8px_24px_-16px_rgba(15,23,42,0.14)] transition-colors group cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <FileSpreadsheet className="w-4 h-4 text-accent-ink shrink-0" />
              <ArrowUpRight className="w-3.5 h-3.5 text-ink-subtle group-hover:text-accent-ink" />
            </div>
            <div className="text-xs font-semibold text-ink-primary">
              Probar lote manifiesto
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              {firstBatch.label}
            </p>
          </button>
        ) : null}
      </div>

      <div className="space-y-2.5 pt-1 text-center">
        <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-ink-muted">
          Pruebas rápidas en 1 clic
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {SAMPLE_MERCHANDISE.slice(0, 4).map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onRunSample(sample)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border-subtle bg-surface-panel/80 backdrop-blur-sm hover:border-accent-brand hover:text-accent-ink text-xs text-ink-secondary transition-colors cursor-pointer"
            >
              <span className="font-medium text-ink-primary">{sample.label}</span>
              <span className="font-mono text-[10px] text-ink-muted">{sample.hsHint}</span>
            </button>
          ))}
          {SAMPLE_BATCH_DOCUMENTS.slice(1, 2).map((batch) => (
            <button
              key={batch.id}
              type="button"
              onClick={() => onRunBatchSample(batch)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border-subtle bg-surface-panel/80 backdrop-blur-sm hover:border-accent-brand hover:text-accent-ink text-xs text-ink-secondary transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3 h-3 text-accent-ink" />
              <span className="font-medium text-ink-primary">{batch.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
