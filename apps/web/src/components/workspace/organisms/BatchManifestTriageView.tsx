'use client';

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import type { A2UIBatchItem, A2UIBatchManifestComponent, JurisdictionConfig } from '@tariffos/shared-types';
import { formatCurrencyAmount } from '@/lib/workspace/format-locale';
import { CopyHsButton } from '../atoms/CopyHsButton';
import { StatusPill } from '../atoms/StatusPill';
import { BatchTriageToolbar, type BatchStatusFilter } from '../molecules/BatchTriageToolbar';
import { BatchItemInspector, type BatchItemConfirmation } from './BatchItemInspector';

export interface BatchManifestTriageViewProps {
  manifest?: A2UIBatchManifestComponent;
  component?: A2UIBatchManifestComponent;
  jurisdiction?: JurisdictionConfig;
  onConfirmItem?: (lineNumber: number, update: BatchItemConfirmation) => void;
  onItemsChange?: (items: A2UIBatchItem[]) => void;
}

const VIRTUALIZE_ROW_THRESHOLD = 50;

export function BatchManifestTriageView({
  manifest,
  component,
  onConfirmItem,
  onItemsChange,
}: BatchManifestTriageViewProps) {
  const source = manifest ?? component;
  const [items, setItems] = useState<A2UIBatchItem[]>(() => source?.items ?? []);
  const [selectedLine, setSelectedLine] = useState<number | null>(() => source?.items[0]?.lineNumber ?? null);
  const [triageMode, setTriageMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BatchStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const nextItems = source?.items ?? [];
    setItems(nextItems);
    setSelectedLine((prev) =>
      prev !== null && nextItems.some((item) => item.lineNumber === prev) ? prev : (nextItems[0]?.lineNumber ?? null),
    );
  }, [source]);

  const pendingItems = useMemo(() => items.filter((item) => item.status === 'needs_review'), [items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.description.toLowerCase().includes(q) ||
        (item.skuOrRef?.toLowerCase().includes(q) ?? false) ||
        item.hsCode.toLowerCase().includes(q)
      );
    });
  }, [items, statusFilter, searchQuery]);

  if (!source) return null;

  const activeItem = items.find((item) => item.lineNumber === selectedLine) ?? items[0] ?? null;

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
        : item,
    );
    setItems(nextItems);
    onConfirmItem?.(lineNumber, update);
    onItemsChange?.(nextItems);

    const nextPending = nextItems.find((item) => item.status === 'needs_review' && item.lineNumber !== lineNumber);
    if (nextPending) {
      setSelectedLine(nextPending.lineNumber);
    } else {
      setTriageMode(false);
    }
  };

  const handleRowKeyDown = (e: KeyboardEvent<HTMLTableRowElement>, lineNumber: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedLine(lineNumber);
    }
  };

  const totalFob = items.reduce((sum, item) => sum + item.fobValue, 0);
  const rowContentVisibility =
    filteredItems.length > VIRTUALIZE_ROW_THRESHOLD ? '[content-visibility:auto] [contain-intrinsic-size:auto_48px]' : '';

  return (
    <div className="space-y-4 p-4">
      <BatchTriageToolbar
        title={source.title}
        currencyCode={source.currencyCode}
        totalCount={items.length}
        pendingCount={pendingItems.length}
        totalFob={totalFob}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onStatusFilterChange={setStatusFilter}
        onSearchChange={setSearchQuery}
        onStartTriage={handleStartTriage}
      />

      {triageMode && pendingItems.length > 0 ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
          Modo Triage activo: confirma el ítem actual para avanzar automáticamente al siguiente pendiente ({pendingItems.length} restantes).
        </div>
      ) : null}

      {activeItem ? (
        <BatchItemInspector
          key={activeItem.lineNumber}
          item={activeItem}
          onConfirm={(update) => handleConfirmItem(activeItem.lineNumber, update)}
        />
      ) : null}

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
              {filteredItems.map((item) => {
                const isSelected = activeItem?.lineNumber === item.lineNumber;
                return (
                  <tr
                    key={item.lineNumber}
                    tabIndex={0}
                    aria-selected={isSelected}
                    onClick={() => setSelectedLine(item.lineNumber)}
                    onKeyDown={(e) => handleRowKeyDown(e, item.lineNumber)}
                    className={`cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none focus-visible:ring-inset ${rowContentVisibility} ${
                      isSelected ? 'bg-accent-soft' : 'hover:bg-surface-hover'
                    }`}
                  >
                    <td className="px-3 py-2 font-mono text-ink-muted tabular-nums">{item.lineNumber}</td>
                    <td className="max-w-64 px-3 py-2">
                      <div className="truncate font-medium text-ink-primary">{item.description}</div>
                      {item.skuOrRef ? <div className="font-mono text-[10px] text-ink-muted">{item.skuOrRef}</div> : null}
                    </td>
                    <td className="px-3 py-2"><CopyHsButton hsCode={item.hsCode} size="sm" /></td>
                    <td className="px-3 py-2 font-mono tabular-nums">{item.adValoremPercent}%</td>
                    <td className="px-3 py-2 font-mono tabular-nums">
                      {formatCurrencyAmount(item.currencyCode, item.fobValue, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2"><StatusPill variant={item.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
