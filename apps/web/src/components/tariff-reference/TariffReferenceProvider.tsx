'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  TariffFavorite,
  TariffFilters,
  TariffHistoryEntry,
  TariffItem,
  TariffSearchResult,
} from '@/types/tariff-reference';
import { TARIFF_REF_TABS, type TariffRefTabId } from '@/__mocks__';
import type { TariffReferenceContextValue } from './context-types';

export type { TariffReferenceContextValue };

const TariffReferenceContext =
  createContext<TariffReferenceContextValue | null>(null);

const FAVORITES_STORAGE_KEY = 'tariffos:favorites';
const HISTORY_STORAGE_KEY = 'tariffos:history';

const DEFAULT_FILTERS: TariffFilters = {
  query: '',
  chapter: [],
  dutyRange: [0, 30],
  status: [],
  unit: [],
};

export function TariffReferenceProvider({
  children,
}: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<'drawer' | 'canvas'>('canvas');
  const [activeTab, setActiveTab] = useState<TariffRefTabId>('buscar');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TariffSearchResult[]>([]);
  const [filters, setFilters] = useState<TariffFilters>(DEFAULT_FILTERS);
  const [selectedItem, setSelectedItem] = useState<TariffItem | null>(null);
  const [favorites, setFavorites] = useState<TariffFavorite[]>([]);
  const [history, setHistory] = useState<TariffHistoryEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      // malformed storage; start empty
    }
    try {
      const stored = sessionStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      // malformed storage; start empty
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // storage quota or private mode
    }
  }, [favorites]);

  useEffect(() => {
    try {
      sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // storage quota or private mode
    }
  }, [history]);

  const toggleFavorite = useCallback((item: TariffItem) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.code === item.code);
      if (exists) {
        return prev.filter((f) => f.code !== item.code);
      }
      return [
        ...prev,
        {
          id: `fav-${item.code}-${Date.now()}`,
          code: item.code,
          name: item.descriptionEs ?? item.description,
          notes: '',
          addedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const addToHistory = useCallback(
    (entry: Omit<TariffHistoryEntry, 'id'>) => {
      setHistory((prev) => {
        const exists = prev.find((h) => h.code === entry.code);
        if (exists) {
          return prev.map((h) =>
            h.code === entry.code ? { ...h, searchedAt: entry.searchedAt } : h
          );
        }
        return [
          { ...entry, id: `hist-${entry.code}-${Date.now()}` },
          ...prev,
        ];
      });
    },
    []
  );

  const removeFavorite = useCallback((code: string) => {
    setFavorites((prev) => prev.filter((f) => f.code !== code));
  }, []);

  const removeFromHistory = useCallback((code: string) => {
    setHistory((prev) => prev.filter((h) => h.code !== code));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const value = useMemo(
    () => ({
      viewMode,
      setViewMode,
      activeTab,
      setActiveTab,
      tabs: TARIFF_REF_TABS,
      searchQuery,
      setSearchQuery,
      searchResults,
      setSearchResults,
      filters,
      setFilters,
      selectedItem,
      selectItem: setSelectedItem,
      favorites,
      toggleFavorite,
      removeFavorite,
      history,
      addToHistory,
      removeFromHistory,
      clearHistory,
    }),
    [
      viewMode,
      activeTab,
      searchQuery,
      searchResults,
      filters,
      selectedItem,
      favorites,
      history,
      removeFavorite,
      removeFromHistory,
      clearHistory,
    ]
  );

  return (
    <TariffReferenceContext.Provider value={value}>{children}</TariffReferenceContext.Provider>
  );
}

export function useTariffReference(): TariffReferenceContextValue {
  const ctx = useContext(TariffReferenceContext);
  if (!ctx) {
    throw new Error('useTariffReference must be used within TariffReferenceProvider');
  }
  return ctx;
}
