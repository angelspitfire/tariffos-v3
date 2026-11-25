'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TariffItem } from '@/types/tariff-reference';
import {
  COLUMN_KEYS,
  COLUMN_LABELS,
  COLUMN_WIDTHS,
  type TableColumn,
} from './tariff-table-columns';
import { TariffTableRow } from './tariff-table-row';
import { TariffTableSkeleton } from './tariff-table-skeleton';
import { TariffTableEmpty } from './tariff-table-empty';
import { TARIFF_TABLE_MIN_HEIGHT } from '@/__mocks__';

export interface TariffTableProps {
  items: TariffItem[];
  selectedCode?: string;
  onSelect: (item: TariffItem) => void;
  sortConfig?: { key: keyof TariffItem; direction: 'asc' | 'desc' } | null;
  onSort: (key: keyof TariffItem) => void;
  loading?: boolean;
}

export function TariffTable({
  items,
  selectedCode,
  onSelect,
  sortConfig,
  onSort,
  loading = false,
}: TariffTableProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;
    const { key, direction } = sortConfig;
    return [...items].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av === undefined && bv === undefined) return 0;
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      const aStr = String(av);
      const bStr = String(bv);
      if (aStr === bStr) return 0;
      const cmp = aStr < bStr ? -1 : 1;
      return direction === 'asc' ? cmp : -cmp;
    });
  }, [items, sortConfig]);

  const handleRowClick = useCallback((item: TariffItem) => onSelect(item), [onSelect]);

  const handleHeaderClick = useCallback(
    (key: TableColumn) => {
      if (key === 'specific') return;
      onSort(key as keyof TariffItem);
    },
    [onSort],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (loading || sortedItems.length === 0) return;
      const lastIndex = sortedItems.length - 1;
      let next = focusedIndex;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          next = Math.min(lastIndex, focusedIndex + 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          next = Math.max(0, focusedIndex - 1);
          break;
        case 'Home':
          event.preventDefault();
          next = 0;
          break;
        case 'End':
          event.preventDefault();
          next = lastIndex;
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0) handleRowClick(sortedItems[focusedIndex]);
          return;
        default:
          return;
      }

      if (next !== focusedIndex) {
        setFocusedIndex(next);
        const row = tbodyRef.current?.querySelector(
          `[data-row-index="${next}"]`,
        ) as HTMLElement | null;
        row?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, sortedItems, loading, handleRowClick]);

  if (loading) {
    return (
      <div className="tariff-table-wrapper overflow-x-auto border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-card)]">
        <TariffTableSkeleton />
      </div>
    );
  }

  if (sortedItems.length === 0) {
    return <TariffTableEmpty />;
  }

  return (
    <div
      className="tariff-table-wrapper overflow-x-auto border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-card)]"
      style={{ minHeight: TARIFF_TABLE_MIN_HEIGHT }}
    >
      <table className="w-full border-collapse text-left text-xs">
        <thead className="bg-[var(--surface-elevated)] text-[var(--text-muted)] font-semibold text-[10px] uppercase tracking-wider border-b border-[var(--border-divider)] sticky top-0 z-10">
          <tr>
            {COLUMN_KEYS.map((key) => {
              const isSorted = sortConfig?.key === key;
              const dir = sortConfig?.direction;
              return (
                <th
                  key={key}
                  className={cn(
                    'p-3 cursor-pointer select-none transition-colors hover:bg-[var(--surface-active)]',
                    COLUMN_WIDTHS[key],
                    isSorted && 'bg-[var(--brand)]/10 text-[var(--brand)]',
                  )}
                  onClick={() => handleHeaderClick(key)}
                >
                  <div className="flex items-center gap-1">
                    {COLUMN_LABELS[key]}
                    {isSorted && (dir === 'asc' ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody ref={tbodyRef} className="divide-y divide-[var(--border-subtle)]/30">
          {sortedItems.map((item, index) => (
            <TariffTableRow
              key={item.code}
              item={item}
              index={index}
              isSelected={item.code === selectedCode}
              isFocused={index === focusedIndex}
              onSelect={handleRowClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
