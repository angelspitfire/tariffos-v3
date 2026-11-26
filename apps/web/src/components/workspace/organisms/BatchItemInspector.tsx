'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { A2UIBatchItem } from '@tariffos/shared-types';
import { buildDefaultMerceologicalSheet } from '@/lib/workspace/merceological-helpers';
import { MerceologicalSheetCard } from '../molecules/MerceologicalSheetCard';

export interface BatchItemConfirmation {
  hsCode: string;
  adValoremPercent: number;
  legalRegime: string;
  answers: Record<string, string>;
}

interface BatchItemInspectorProps {
  item: A2UIBatchItem;
  onConfirm: (update: BatchItemConfirmation) => void;
}

export function BatchItemInspector({ item, onConfirm }: BatchItemInspectorProps) {
  const [hsCode, setHsCode] = useState(item.hsCode);
  const [answers, setAnswers] = useState<Record<string, string>>(item.operatorAnswers ?? {});
  const [showFullSheet, setShowFullSheet] = useState(false);

  const hasQuestions = Boolean(item.clarifyingQuestions && item.clarifyingQuestions.length > 0);
  const sheet = item.merceologicalSheet ?? buildDefaultMerceologicalSheet(item.description);

  return (
    <div className="space-y-3 rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div data-testid="batch-inspector-header">
          <div className="font-mono text-[11px] text-ink-muted">
            Línea #{item.lineNumber} {item.skuOrRef ? `· ${item.skuOrRef}` : ''} · {item.sourceDoc}
          </div>
          <p className="mt-0.5 text-sm font-semibold text-ink-primary">{item.description}</p>
        </div>

        <button
          type="button"
          onClick={() =>
            onConfirm({
              hsCode,
              adValoremPercent: item.adValoremPercent,
              legalRegime: item.legalRegime,
              answers,
            })
          }
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Confirmar ítem</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-border-hairline pt-2 text-xs sm:grid-cols-3">
        <label className="block space-y-1">
          <span className="text-[11px] text-ink-muted">Código HS</span>
          <input
            type="text"
            value={hsCode}
            onChange={(e) => setHsCode(e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5 font-mono font-semibold text-ink-primary"
          />
        </label>
        <div>
          <div className="text-[11px] text-ink-muted">Cantidad / FOB</div>
          <div className="mt-1.5 font-mono text-ink-primary">
            {item.quantityText} · {item.currencyCode} {item.fobValue.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-ink-muted">Tributos / Régimen</div>
          <div className="mt-1.5 font-mono text-ink-primary">
            AV {item.adValoremPercent}% · IVA {item.vatPercent}% · {item.legalRegime}
          </div>
        </div>
      </div>

      {hasQuestions ? (
        <div className="space-y-2 rounded-lg border border-amber-300/70 bg-amber-50/55 p-3 dark:border-amber-900/60 dark:bg-amber-950/20">
          <div className="text-xs font-semibold text-amber-900 dark:text-amber-200">
            Preguntas rápidas de desambiguación
          </div>
          {item.clarifyingQuestions?.map((q) => (
            <div key={q.id} className="space-y-1">
              <div className="text-xs font-medium text-ink-primary">{q.question}</div>
              {q.options && q.options.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                      className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs ${
                        answers[q.id] === opt
                          ? 'border-accent-brand bg-accent-soft font-semibold text-accent-ink'
                          : 'border-border-subtle bg-surface-panel text-ink-secondary'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-1.5 text-xs"
                />
              )}
            </div>
          ))}
        </div>
      ) : null}

      {hasQuestions && !showFullSheet ? (
        <button
          type="button"
          onClick={() => setShowFullSheet(true)}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-xs font-medium text-ink-secondary hover:bg-surface-hover"
        >
          <span>Ficha merceológica completa de 7 atributos (opcional)</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      ) : (
        <MerceologicalSheetCard
          component={{
            type: 'merceological_sheet',
            id: `batch-sheet-${item.lineNumber}`,
            mode: 'hitl_validation',
            title: `Ficha Merceológica · Línea #${item.lineNumber}`,
            sheet,
          }}
          onSubmit={() =>
            onConfirm({
              hsCode,
              adValoremPercent: item.adValoremPercent,
              legalRegime: item.legalRegime,
              answers,
            })
          }
        />
      )}
    </div>
  );
}
