'use client';

import { FileSpreadsheet, Layers } from 'lucide-react';
import type { A2UIDocumentSummaryComponent } from '@tariffos/shared-types';

interface DocumentSummaryCardProps {
  component: A2UIDocumentSummaryComponent;
  onOpenBatch?: () => void;
}

export function DocumentSummaryCard({ component, onOpenBatch }: DocumentSummaryCardProps) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface-panel p-3.5 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-ink-primary">
                {component.documentReference}
              </span>
              {component.docTypesDetected.map((dt) => (
                <span
                  key={dt}
                  className="rounded-md bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium text-ink-secondary"
                >
                  {dt}
                </span>
              ))}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-ink-muted">
              <span>{component.itemsCount} ítems</span>
              {component.routeOrIncoterm && <span>{component.routeOrIncoterm}</span>}
              {component.totalDeclaredValue && (
                <span className="font-mono text-ink-secondary">{component.totalDeclaredValue}</span>
              )}
              {component.grossWeight && <span>{component.grossWeight}</span>}
            </div>
          </div>
        </div>

        {component.isBatch && onOpenBatch && (
          <button
            type="button"
            onClick={onOpenBatch}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-brand px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-accent-brand-hover"
          >
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            Abrir Lote
          </button>
        )}
      </div>
    </section>
  );
}
