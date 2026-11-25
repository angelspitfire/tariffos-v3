export interface TariffItem {
  code: string;
  description: string;
  descriptionEs?: string;
  dutyAdValorem: number;
  dutyRate?: number;
  dutySpecific?: number;
  specificDuty?: number;
  vat: number;
  vatRate?: number;
  fodinfa: number;
  fodinfaRate?: number;
  unit: string;
  status: TariffStatus;
  notes?: string;
  requiresPermit?: boolean;
  permitAgencies?: string[];
}

export interface TariffSubheading {
  code: string;
  description: string;
  descriptionEs?: string;
  items: TariffItem[];
}

export interface TariffHeading {
  code: string;
  description: string;
  descriptionEs?: string;
  subheadings: TariffSubheading[];
}

export interface TariffChapter {
  code: string;
  title: string;
  descriptionEs?: string;
  headings: TariffHeading[];
}

export type TariffViewMode = 'search' | 'browse' | 'favorites' | 'history';

export interface TariffSearchResult {
  item: TariffItem;
  chapter: string;
  heading: string;
  subheading: string;
  // Convenience getters that delegate to item
  code: string;
  description: string;
  descriptionEs?: string;
  dutyAdValorem: number;
  dutyRate?: number;
  dutySpecific?: number;
  specificDuty?: number;
  vat: number;
  vatRate?: number;
  fodinfa: number;
  fodinfaRate?: number;
  unit: string;
  status: TariffStatus;
  notes?: string;
  requiresPermit?: boolean;
  permitAgencies?: string[];
}

export type TariffStatus = 'active' | 'inactive' | 'suspended' | 'under-review' | 'discontinued' | 'temporary';

export interface TariffFilters {
  chapter: string[];
  dutyRange: [number, number];
  status: TariffStatus[];
  unit: string[];
  query: string;
}

export const DEFAULT_TARIFF_FILTERS: TariffFilters = {
  chapter: [],
  dutyRange: [0, 30],
  status: [],
  unit: [],
  query: '',
};

export const TARIFF_STATUS_LABELS: Record<TariffStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
  'under-review': 'En Revisión',
  discontinued: 'Descontinuado',
  temporary: 'Temporal',
};

export const DUTY_RATE_MIN = 0;
export const DUTY_RATE_MAX = 30;
export const TARIFF_FILTER_DEBOUNCE_MS = 300;

export interface TariffFavorite {
  id: string;
  code: string;
  name: string;
  addedAt: string;
  createdAt: string;
}

export interface TariffHistoryEntry {
  id: string;
  code: string;
  name: string;
  viewedAt: string;
  searchedAt: string;
}

export interface BreadcrumbItem {
  code: string;
  label: string;
  onClick?: () => void;
}
