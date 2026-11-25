/**
 * Repository interfaces (Ports) - abstract contracts for data access.
 * Using Promise<unknown> to allow implementation flexibility.
 */

import type { Filing } from '../entities/Filing';
import type { Artifact, ArtifactType } from '../entities/Artifact';
import type { TariffStatus } from '../entities/TariffItem';
import type { FilingStatus } from '../entities/Filing';

export interface FilingFilters {
  status?: FilingStatus[];
  dateRange?: { from: Date; to: Date };
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface ArtifactFilters {
  filingId?: string;
  type?: ArtifactType[];
  dateRange?: { from: Date; to: Date };
}

export interface TariffSearchFilters {
  query?: string;
  chapter?: string[];
  dutyRange?: [number, number];
  status?: TariffStatus[];
  unit?: string[];
  requiresPermit?: boolean;
}

export interface TariffHistoryEntry {
  id: string;
  code: string;
  name: string;
  searchedAt: Date;
  viewedAt: Date;
}

export interface TariffFavorite {
  id: string;
  code: string;
  name: string;
  notes: string;
  addedAt: Date;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  filingId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parts?: Array<{ type: string; text?: string; data?: unknown }>;
  timestamp: Date;
  artifactIds?: string[];
}

export interface StreamingState {
  isStreaming: boolean;
  currentMessage?: ChatMessage;
}

export interface Settings {
  theme: 'system' | 'dark' | 'light';
  toastDuration: number;
  shortcutsEnabled: boolean;
  notificationsEnabled: boolean;
  language: 'es' | 'en';
  autoSaveInterval: number;
}

export interface IFilingRepository {
  save(filing: Filing): Promise<unknown>;
  findById(id: string): Promise<unknown>;
  findByCode(code: unknown): Promise<unknown>;
  findAll(filters?: FilingFilters): Promise<unknown>;
  delete(id: string): Promise<unknown>;
}

export interface IArtifactRepository {
  save(artifact: Artifact): Promise<unknown>;
  findById(id: string): Promise<unknown>;
  findByFilingId(filingId: string): Promise<unknown>;
  findByType(type: ArtifactType): Promise<unknown>;
  getHistory(artifactId: string): Promise<unknown>;
  delete(id: string): Promise<unknown>;
}

export interface ITariffRepository {
  search(query: string, filters?: unknown): Promise<unknown>;
  getByCode(code: unknown): Promise<unknown>;
  getTree(): Promise<unknown>;
  getFavorites(): Promise<unknown>;
  getHistory(): Promise<unknown>;
  toggleFavorite(code: unknown, isFavorite: boolean): Promise<unknown>;
  addToHistory(entry: unknown): Promise<unknown>;
  removeFromHistory(code: string): Promise<unknown>;
  clearHistory(): Promise<unknown>;
}

export interface IChatRepository {
  saveMessage(message: ChatMessage): Promise<unknown>;
  getMessages(filingId: string, limit?: number): Promise<unknown>;
  getStreamingState(filingId: string): Promise<unknown>;
  setStreamingState(filingId: string, state: StreamingState): Promise<unknown>;
  clearMessages(filingId: string): Promise<unknown>;
}

export interface ISettingsRepository {
  getSettings(): Promise<unknown>;
  saveSettings(settings: Settings): Promise<unknown>;
  updateTheme(theme: 'system' | 'dark' | 'light'): Promise<unknown>;
  updateLanguage(language: 'es' | 'en'): Promise<unknown>;
}

export interface TariffChapter {
  code: string;
  title: string;
  descriptionEs?: string;
  headings: TariffHeading[];
}

export interface TariffHeading {
  code: string;
  description: string;
  descriptionEs?: string;
  subheadings: TariffSubheading[];
}

export interface TariffSubheading {
  code: string;
  description: string;
  descriptionEs?: string;
  items: TariffSubheadingItem[];
}

export interface TariffSubheadingItem {
  code: string;
  description: string;
  descriptionEs?: string;
  dutyAdValorem: number;
  vat: number;
  fodinfa: number;
  unit: string;
  status: string;
  notes?: string;
}
