/**
 * Repository interfaces (Ports) - abstract contracts for data access.
 * These define the contract between the application layer and data sources.
 */

import type { FilingRecord } from '@/lib/filings-catalog';
import type { ChatMessage } from '@/domain/repositories';
import type { TariffFilters, TariffChapter, TariffItem, TariffSearchResult } from '@/types/tariff-reference';

export interface IFilingRepository {
  getAllFilings(): Promise<FilingRecord[]>;
  getFilingById(id: string): Promise<FilingRecord | null>;
  createFiling(filing: FilingRecord): Promise<FilingRecord>;
  updateFiling(id: string, patch: Partial<FilingRecord>): Promise<FilingRecord>;
  deleteFiling(id: string): Promise<void>;
  getActiveFilingId(): Promise<string | null>;
  setActiveFilingId(id: string): Promise<void>;
}

export interface IChatRepository {
  getMessages(filingId: string): Promise<ChatMessage[]>;
  addMessage(filingId: string, message: ChatMessage): Promise<void>;
  clearMessages(filingId: string): Promise<void>;
}

export interface ITariffRepository {
  searchTariff(query: string, filters: TariffFilters): Promise<TariffSearchResult[]>;
  getTarItem(code: string): Promise<TariffItem | null>;
  getChapters(): Promise<TariffChapter[]>;
}

export type {
  FilingRecord,
  ChatMessage,
  TariffFilters,
  TariffChapter,
  TariffItem,
  TariffSearchResult,
};