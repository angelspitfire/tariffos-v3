'use client';

import { useCallback, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type TariffFavorite,
  type TariffHistoryEntry,
  type TariffItem,
} from '@/types';

type Tab = 'favorites' | 'history';

const SWIPE_THRESHOLD = 44;
const ICON_SIZE = 14;

const DATE_FMT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
} as const;

function formatDate(iso?: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('es-VE', DATE_FMT);
}

function itemFor(code: string, allItems: Map<string, TariffItem>) {
  return allItems.get(code);
}

function descriptionOf(
  item: TariffFavorite | TariffHistoryEntry,
  allItems: Map<string, TariffItem>
): string {
  const tariffItem = itemFor(item.code, allItems);
  if ('searchedAt' in item) {
    return item.name ?? tariffItem?.description ?? '';
  }
  return item.name ?? tariffItem?.description ?? '';
}

function dutyOf(
  item: TariffFavorite | TariffHistoryEntry,
  allItems: Map<string, TariffItem>
): string {
  const tariffItem = itemFor(item.code, allItems);
  if (tariffItem && tariffItem.dutyRate != null)
    return `${tariffItem.dutyRate.toFixed(2)}%`;
  return '-';
}

interface TariffFavoritesHistoryRowProps {
  item: TariffFavorite | TariffHistoryEntry;
  tab: Tab;
  allItems: Map<string, TariffItem>;
  focused: boolean;
  onSelect: (code: string) => void;
  onRemove: (code: string) => void;
}

export function TariffFavoritesHistoryRow({
  item,
  tab,
  allItems,
  focused,
  onSelect,
  onRemove,
}: TariffFavoritesHistoryRowProps) {
  const code = item.code;
  const tariffItem = itemFor(code, allItems);
  const showDuty = tab === 'favorites';

  const touchStartX = useRef(0);
  const [dragX, setDragX] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setDragX(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    setDragX(Math.min(0, dx));
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (dragX < -SWIPE_THRESHOLD) {
      onRemove(code);
    }
    setDragX(0);
  }, [code, dragX, onRemove]);

  const isActive = focused;
  const swiped = dragX < 0;

  return (
    <li
      onClick={() => onSelect(code)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        'flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer group',
        isActive
          ? 'bg-[var(--surface-active)] border-l-2 border-l-[var(--brand)] text-[var(--text-hi)]'
          : 'bg-[var(--surface-raised)] border border-transparent hover:border-white/10 hover:bg-white/5'
      )}
      style={{
        transform: `translateX(${dragX}px)`,
        transition: swiped ? 'none' : 'transform 120ms ease-out',
      }}
    >
      <div className="min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[var(--text-hi)] tabular truncate">
            {code}
          </span>
          {showDuty && tariffItem && (
            <span
              className="text-[10px] font-mono-numbers text-[var(--cleared-text)] border border-[var(--cleared-border)] rounded px-1.5 py-0.5 shrink-0"
              style={{ background: 'var(--cleared-subtle)' }}
            >
              {dutyOf(item, allItems)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[var(--text-mid)] truncate leading-snug">
          {descriptionOf(item, allItems)}
        </p>
        <p className="text-[9px] font-mono text-[var(--text-lo)] mt-0.5">
          {formatDate(
            'searchedAt' in item ? item.searchedAt : item.createdAt
          )}
        </p>
      </div>
      <button
        type="button"
        aria-label={`Eliminar ${code}`}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(code);
        }}
        className={cn(
          'shrink-0 p-1.5 rounded transition-colors',
          swiped || isActive ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'
        )}
        style={{ color: 'var(--danger-text)' }}
      >
        <Trash2 size={ICON_SIZE} aria-hidden />
      </button>
    </li>
  );
}
