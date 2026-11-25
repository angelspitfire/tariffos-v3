import type {
  TariffFavorite,
  TariffFilters,
  TariffHistoryEntry,
  TariffItem,
  TariffSearchResult,
} from '@/types/tariff-reference';
import type { TariffRefTabId, TariffRefTab } from '@/__mocks__';

export interface TariffReferenceContextValue {
  viewMode: 'drawer' | 'canvas';
  setViewMode: (mode: 'drawer' | 'canvas') => void;
  activeTab: TariffRefTabId;
  setActiveTab: (tab: TariffRefTabId) => void;
  tabs: readonly TariffRefTab[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: TariffSearchResult[];
  setSearchResults: (results: TariffSearchResult[]) => void;
  filters: TariffFilters;
  setFilters: (filters: TariffFilters) => void;
  selectedItem: TariffItem | null;
  selectItem: (item: TariffItem | null) => void;
  favorites: TariffFavorite[];
  toggleFavorite: (item: TariffItem) => void;
  removeFavorite: (code: string) => void;
  history: TariffHistoryEntry[];
  addToHistory: (entry: Omit<TariffHistoryEntry, 'id'>) => void;
  removeFromHistory: (code: string) => void;
  clearHistory: () => void;
}
