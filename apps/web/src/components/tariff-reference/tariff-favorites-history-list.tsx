'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  type TariffFavorite,
  type TariffHistoryEntry,
  type TariffItem,
} from '@/types';
import { TariffFavoritesHistoryRow } from './tariff-favorites-history-row';

type Tab = 'favorites' | 'history';

interface TariffFavoritesHistoryListProps {
  tab: Tab;
  items: (TariffFavorite | TariffHistoryEntry)[];
  allItems: Map<string, TariffItem>;
  onSelect: (code: string) => void;
  onRemove: (code: string) => void;
  emptyTitle: string;
  emptyIllustration: React.ReactNode;
}

export function TariffFavoritesHistoryList({
  tab,
  items,
  allItems,
  onSelect,
  onRemove,
  emptyTitle,
  emptyIllustration,
}: TariffFavoritesHistoryListProps) {
  const len = items.length;
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    listRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = itemRefs.current[focusedIndex];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [focusedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (len === 0) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((i) => (i + 1) % len);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((i) => (i - 1 + len) % len);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect(items[focusedIndex]?.code ?? '');
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          onRemove(items[focusedIndex]?.code ?? '');
          break;
      }
    },
    [items, len, focusedIndex, onSelect, onRemove]
  );

  return (
    <section
      aria-label={tab === 'favorites' ? 'Favoritos' : 'Historial'}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="flex flex-col h-full"
      style={{ outline: 'none' }}
    >
      {len === 0 ? (
        <div
          className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          style={{ color: 'var(--text-lo)' }}
        >
          {emptyIllustration}
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider">{emptyTitle}</p>
        </div>
      ) : (
        <ul
          ref={listRef}
          role="list"
          className="flex-1 overflow-y-auto divide-y divide-white/5"
          style={{ border: '1px solid var(--border)' }}
        >
          {items.map((item, index) => (
            <TariffFavoritesHistoryRow
              key={item.id ?? item.code}
              item={item}
              tab={tab}
              allItems={allItems}
              focused={focusedIndex === index}
              onSelect={onSelect}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
