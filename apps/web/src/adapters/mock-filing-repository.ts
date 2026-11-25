/**
 * MockFilingRepository - implementation wrapping MOCK_FILINGS and localStorage.
 * Used for testing and offline fallbacks.
 */

import { MOCK_FILINGS } from '@/lib/filings-catalog';
import {
  IFilingRepository,
  IChatRepository,
  ITariffRepository,
} from '@/adapters/filing-repository';
import type { FilingRecord } from '@/lib/filings-catalog';
import type { ChatMessage } from '@/domain/repositories';
import type { TariffFilters, TariffSearchResult, TariffItem, TariffChapter } from '@/types/tariff-reference';

// localStorage keys
const ACTIVE_FILING_KEY = 'tariffos_active_filing';

// In-memory store that gets initialized from MOCK_FILINGS and localStorage
let filingsStore: Record<string, FilingRecord> = { ...MOCK_FILINGS };

/**
 * Helper: persist active filing ID to localStorage.
 */
function setActiveFilingInStorage(id: string | null): void {
  if (typeof window !== 'undefined') {
    if (id) {
      localStorage.setItem(ACTIVE_FILING_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_FILING_KEY);
    }
  }
}

/**
 * Helper: read active filing ID from localStorage.
 */
function getActiveFilingFromStorage(): string | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(ACTIVE_FILING_KEY);
    // Normalize empty string to null
    return stored || null;
  }
  return null;
}

/**
 * MockFilingRepository - implements IFilingRepository, IChatRepository, ITariffRepository
 * using a mutable in-memory store (initialized from MOCK_FILINGS) and localStorage.
 */
export class MockFilingRepository
  implements IFilingRepository, IChatRepository, ITariffRepository
{
  // ------------- IFilingRepository -------------

  async getAllFilings(): Promise<FilingRecord[]> {
    return Object.values(filingsStore);
  }

  async getFilingById(id: string): Promise<FilingRecord | null> {
    const record = filingsStore[id];
    return record ?? null;
  }

  async createFiling(filing: FilingRecord): Promise<FilingRecord> {
    filingsStore[filing.id] = filing;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tariffos_all_filings', JSON.stringify(filingsStore));
    }
    return filing;
  }

  async updateFiling(id: string, patch: Partial<FilingRecord>): Promise<FilingRecord> {
    const existing = filingsStore[id];
    if (!existing) {
      throw new Error(`Filing with id ${id} not found`);
    }
    const updated = { ...existing, ...patch };
    filingsStore[id] = updated;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tariffos_all_filings', JSON.stringify(filingsStore));
    }
    return updated;
  }

  async deleteFiling(id: string): Promise<void> {
    delete filingsStore[id];
    if (typeof window !== 'undefined') {
      localStorage.setItem('tariffos_all_filings', JSON.stringify(filingsStore));
    }
    // If the deleted filing was active, clear active filing
    const active = await this.getActiveFilingId();
    if (active === id) {
      await this.setActiveFilingId(null);
    }
  }

  async getActiveFilingId(): Promise<string | null> {
    return getActiveFilingFromStorage();
  }

  async setActiveFilingId(id: string | null): Promise<void> {
    setActiveFilingInStorage(id);
  }

  // ------------- IChatRepository -------------

  async getMessages(filingId: string): Promise<ChatMessage[]> {
    const key = `tariffos_messages_${filingId}`;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      try {
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  async addMessage(filingId: string, message: ChatMessage): Promise<void> {
    const key = `tariffos_messages_${filingId}`;
    const existing: ChatMessage[] = await this.getMessages(filingId);
    const updated = [...existing, message];
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(updated));
    }
  }

  async clearMessages(filingId: string): Promise<void> {
    const key = `tariffos_messages_${filingId}`;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  // ------------- ITariffRepository -------------

  async searchTariff(_query: string, _filters: TariffFilters): Promise<TariffSearchResult[]> {
    // Intentionally unused in mock implementation
    return [];
  }

  async getTarItem(_code: string): Promise<TariffItem | null> {
    // Intentionally unused in mock implementation
    return null;
  }

  async getChapters(): Promise<TariffChapter[]> {
    return [];
  }
}
