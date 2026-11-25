'use client';

import { useCallback } from 'react';
import { Star, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type TariffFavorite,
  type TariffHistoryEntry,
  type TariffItem,
} from '@/types';
import { TariffFavoritesHistoryList } from './tariff-favorites-history-list';

type Tab = 'favorites' | 'history';

export interface TariffFavoritesHistoryProps {
  favorites: TariffFavorite[];
  history: TariffHistoryEntry[];
  allItems: Map<string, TariffItem>;
  onSelect: (code: string) => void;
  onRemoveFavorite: (code: string) => void;
  onRemoveHistory?: (code: string) => void;
  onClearHistory: () => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TAB_LABELS: Record<Tab, { label: string; icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }> }> = {
  favorites: { label: 'Favoritos', icon: Star },
  history: { label: 'Historial', icon: Clock },
};

const FAVORITES_ILLUSTRATION = (
  <svg
    viewBox="0 0 48 48"
    className="w-10 h-10"
    style={{ color: 'var(--text-lo)' }}
    aria-hidden
  >
    <path
      d="M24 8c-1.5 0-3 0.6-4 1.6L14 14c-1 1-1 3 0 4l6 6c0.4 0.4 1 0.4 1.4 0l6-6c1-1 1-3 0-4l-6-6c-1-1-2.5-1.6-4-1.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 30c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const HISTORY_ILLUSTRATION = (
  <svg
    viewBox="0 0 48 48"
    className="w-10 h-10"
    style={{ color: 'var(--text-lo)' }}
    aria-hidden
  >
    <circle cx="24" cy="16" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M24 22c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M24 30c-0.8 0-1.5-0.3-2-0.8l-2-2c-0.8-0.8-0.8-2 0-2.8s2-0.8 2.8 0l2 2c0.4 0.4 0.4 1 0 1.4-0.5 0.5-1.2 0.8-1.8 0.8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function TariffFavoritesHistory({
  favorites,
  history,
  allItems,
  onSelect,
  onRemoveFavorite,
  onRemoveHistory,
  onClearHistory,
  activeTab,
  onTabChange,
}: TariffFavoritesHistoryProps) {
  const handleTabChange = useCallback(
    (tab: Tab) => {
      onTabChange(tab);
    },
    [onTabChange]
  );

  const historyEntries = [...history].sort(
    (a, b) =>
      new Date(b.searchedAt).getTime() - new Date(a.searchedAt).getTime()
  );

  return (
    <section
      aria-label="Favoritos e historial arancelario"
      className="flex flex-col h-full"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card, 0.75rem)',
      }}
    >
      {/* Tabs */}
      <div className="flex shrink-0 border-b border-white/5">
        {Object.entries(TAB_LABELS).map(([key, { label, icon: Icon }]) => {
          const tab = key as Tab;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(tab)}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors shrink-0',
                isActive
                  ? 'bg-[var(--surface-active)] text-[var(--text-hi)] border-b-2 border-b-[var(--brand)]'
                  : 'text-[var(--text-mid)] hover:bg-white/5 hover:text-[var(--text-hi)]'
              )}
            >
              <Icon size={13} aria-hidden />
              <span>{label}</span>
              {isActive && <ChevronRight size={11} className="text-[var(--brand)]" aria-hidden />}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'favorites' ? (
          <TariffFavoritesHistoryList
            tab="favorites"
            items={favorites}
            allItems={allItems}
            onSelect={onSelect}
            onRemove={onRemoveFavorite}
            emptyTitle="No hay favoritos guardados"
            emptyIllustration={FAVORITES_ILLUSTRATION}
          />
        ) : (
          <div className="flex flex-col h-full">
            <TariffFavoritesHistoryList
              tab="history"
              items={historyEntries}
              allItems={allItems}
              onSelect={onSelect}
              onRemove={onRemoveHistory ?? (() => {})}
              emptyTitle="Sin historial reciente"
              emptyIllustration={HISTORY_ILLUSTRATION}
            />
            <div
              className="shrink-0 p-3 border-t border-white/5"
              style={{ background: 'var(--surface-raised)' }}
            >
              <button
                type="button"
                onClick={onClearHistory}
                className="w-full text-xs font-medium text-[var(--danger-text)] hover:bg-white/5 transition-colors rounded-lg"
              >
                Limpiar historial
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
