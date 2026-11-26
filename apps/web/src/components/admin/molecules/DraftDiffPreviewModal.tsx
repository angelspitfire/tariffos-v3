'use client';

import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import type { LegalDraftDiff } from '@tariffos/shared-types';

export interface DraftDiffPreviewModalProps {
  diff: LegalDraftDiff;
  publishing: boolean;
  onClose: () => void;
  onConfirmPublish: (draftId: string) => Promise<void>;
}

export function DraftDiffPreviewModal({
  diff,
  publishing,
  onClose,
  onConfirmPublish,
}: DraftDiffPreviewModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Preview de impacto y publicación"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-border-subtle bg-surface-panel p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-ink-primary">
              Preview de impacto — {diff.countryCode}/{diff.hierarchyPath}
            </h2>
            <p className="text-xs text-ink-muted">
              Revisa qué versiones vigentes serán derogadas antes de publicar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar preview"
            className="p-1.5 rounded-lg text-ink-muted hover:bg-surface-hover cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5">
            <div className="text-[11px] text-ink-muted">Agregados</div>
            <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
              +{diff.addedChunks}
            </div>
          </div>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5">
            <div className="text-[11px] text-ink-muted">Modificados</div>
            <div className="text-lg font-bold font-mono text-amber-700 dark:text-amber-400">
              ~{diff.modifiedChunks}
            </div>
          </div>
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5">
            <div className="text-[11px] text-ink-muted">Eliminados</div>
            <div className="text-lg font-bold font-mono text-rose-700 dark:text-rose-400">
              -{diff.removedChunks}
            </div>
          </div>
        </div>

        {diff.overlappingPublished.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span>Versiones publicadas que pasarán a DEROGATED ({diff.overlappingPublished.length})</span>
            </div>
            <ul className="space-y-1 text-xs text-ink-primary">
              {diff.overlappingPublished.map((prev) => (
                <li key={prev.id} className="font-mono text-[11px]">
                  • {prev.title} {prev.decreeNumber ? `(${prev.decreeNumber})` : ''} · desde {prev.validFromDate.slice(0, 10)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {diff.affectedHsCodes.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-ink-primary">Códigos HS afectados en scope</div>
            <div className="flex flex-wrap gap-1.5">
              {diff.affectedHsCodes.map((code) => (
                <span
                  key={code}
                  className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border-subtle text-[11px] font-mono text-ink-primary"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}

        {diff.sampleChanges.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-ink-primary">Muestra de cambios</div>
            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {diff.sampleChanges.map((item, idx) => (
                <div key={`${item.heading}-${idx}`} className="rounded-lg border border-border-subtle bg-surface-app p-2 text-xs">
                  <span className="font-bold uppercase text-[10px] mr-2 text-accent-ink">{item.status}</span>
                  <span className="font-semibold text-ink-primary">{item.heading}</span>
                  {item.ruleNumber && <span className="text-ink-muted ml-1">(Nota/Art. {item.ruleNumber})</span>}
                  <p className="text-[11px] text-ink-muted mt-0.5">{item.preview}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {diff.tariffChanges && diff.tariffChanges.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-ink-primary">Muestra de cambios arancelarios</div>
            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {diff.tariffChanges.map((row) => (
                <div key={row.hsCode} className="rounded-lg border border-border-subtle bg-surface-app p-2 text-xs">
                  <span className="font-bold uppercase text-[10px] mr-2 text-accent-ink">{row.changeType}</span>
                  <span className="font-mono font-semibold text-ink-primary">{row.hsCode}</span>
                  <span className="text-ink-muted ml-2">({row.fieldsChanged.join(', ')})</span>
                  {(row.beforeAdValorem !== undefined || row.afterAdValorem !== undefined) && (
                    <span className="ml-2 font-mono text-[11px] text-ink-primary">
                      {row.beforeAdValorem ?? '—'}% → {row.afterAdValorem ?? '—'}%
                    </span>
                  )}
                  <p className="text-[11px] text-ink-muted mt-0.5 truncate">{row.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-strong bg-surface-panel px-3 py-1.5 text-xs font-semibold text-ink-primary hover:bg-surface-hover cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={publishing}
            onClick={() => void onConfirmPublish(diff.draftId)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {publishing ? 'Publicando...' : 'Publicar y derogar versión anterior'}
          </button>
        </div>
      </div>
    </div>
  );
}
