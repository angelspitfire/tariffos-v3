'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';
import type {
  A2UIBatchItem,
  A2UIBatchManifestComponent,
  JurisdictionConfig,
} from '@tariffos/shared-types';
import { CopyHsButton } from '../atoms/CopyHsButton';
import { StatusPill } from '../atoms/StatusPill';
import { BatchItemInspector, type BatchItemConfirmation } from './BatchItemInspector';

export interface BatchManifestTriageViewProps {
  manifest?: A2UIBatchManifestComponent;
  component?: A2UIBatchManifestComponent;
  jurisdiction?: JurisdictionConfig;
  onConfirmItem?: (lineNumber: number, update: BatchItemConfirmation) => void;
  onItemsChange?: (items: A2UIBatchItem[]) => void;
}

export function BatchManifestTriageView({
  manifest,
  component,
  onConfirmItem,
  onItemsChange,
}: BatchManifestTriageViewProps) {
  const source = manifest ?? component;
  const [items, setItems] = useState<A2UIBatchItem[]>(() => source?.items ?? []);
  const [selectedLine, setSelectedLine] = useState<number | null>(
    () => source?.items[0]?.lineNumber ?? null
  );
  const [triageMode, setTriageMode] = useState(false);

  const pendingItems = useMemo(
    () => items.filter((item) => item.status === 'needs_review'),
    [items]
  );

  if (!source) return null;

  const activeItem =
    items.find((item) => item.lineNumber === selectedLine) ?? items[0] ?? null;

  const handleStartTriage = () => {
    const firstPending = pendingItems[0];
    if (!firstPending) return;
    setTriageMode(true);
    setSelectedLine(firstPending.lineNumber);
  };

  const handleConfirmItem = (lineNumber: number, update: BatchItemConfirmation) => {
    const nextItems: A2UIBatchItem[] = items.map((item) =>
      item.lineNumber === lineNumber
        ? {
            ...item,
            hsCode: update.hsCode,
            adValoremPercent: update.adValoremPercent,
            legalRegime: update.legalRegime,
            operatorAnswers: update.answers,
            status: 'classified',
            workflowItemState: 'classified',
          }
        : item
    );
    setItems(nextItems);
    onConfirmItem?.(lineNumber, update);
    onItemsChange?.(nextItems);

    const nextPending = nextItems.find(
      (item) => item.status === 'needs_review' && item.lineNumber !== lineNumber
    );
    if (nextPending) {
      setSelectedLine(nextPending.lineNumber);
    } else {
      setTriageMode(false);
    }
  };

  const totalFob = items.reduce((sum, item) => sum + item.fobValue, 0);

  return (
    <div className="space-y-4 p-4">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-ink-primary">{source.title}</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            {items.length} ítems · {items.length - pendingItems.length} clasificados ·{' '}
            <span className="font-mono">
              {source.currencyCode} {totalFob.toLocaleString('en-US')}
            </span>
          </p>
        </div>

        {pendingItems.length > 0 ? (
          <button
            type="button"
            onClick={handleStartTriage}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
          >
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            Iniciar Triage rápido ({pendingItems.length} pendientes)
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Lote 100% verificado
          </span>
        )}
      </section>

      {triageMode && pendingItems.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
          Modo Triage activo: confirma el ítem actual para avanzar automáticamente al siguiente pendiente ({pendingItems.length} restantes).
        </div>
      )}

      {activeItem && (
        <BatchItemInspector
          key={activeItem.lineNumber}
          item={activeItem}
          onConfirm={(update) => handleConfirmItem(activeItem.lineNumber, update)}
        />
      )}

      <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface-panel shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border-subtle bg-surface-muted text-xs font-medium text-ink-muted">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Mercancía / SKU</th>
                <th className="px-3 py-2">Partida SA</th>
                <th className="px-3 py-2">AV</th>
                <th className="px-3 py-2">FOB</th>
                <th className="px-3 py-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline">
              {items.map((item) => (
                <tr
                  key={item.lineNumber}
                  onClick={() => setSelectedLine(item.lineNumber)}
                  className={`cursor-pointer transition ${
                    activeItem?.lineNumber === item.lineNumber ? 'bg-accent-soft' : 'hover:bg-surface-hover'
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-ink-muted">{item.lineNumber}</td>
                  <td className="max-w-64 px-3 py-2">
                    <div className="truncate font-medium text-ink-primary">{item.description}</div>
                    {item.skuOrRef && (
                      <div className="font-mono text-[10px] text-ink-muted">{item.skuOrRef}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <CopyHsButton hsCode={item.hsCode} size="sm" />
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums">{item.adValoremPercent}%</td>
                  <td className="px-3 py-2 font-mono tabular-nums">
                    {item.currencyCode} {item.fobValue.toLocaleString('en-US')}
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill variant={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
