/**
 * InsForgeFilingRepository - Stub implementation for InsForge backend.
 * Ready for backend integration; throws until the InsForge SDK is wired up.
 */

import type { FilingRecord } from '@/lib/filings-catalog';
import type { ChatMessage } from '@/domain/repositories';
import type {
  IFilingRepository,
  IChatRepository,
  ITariffRepository,
  TariffFilters,
  TariffSearchResult,
  TariffItem,
  TariffChapter,
} from '@/adapters/filing-repository';

/**
 * InsForgeFilingRepository - implements IFilingRepository, IChatRepository, ITariffRepository
 * Delegates to the InsForge backend. Throws until the backend is integrated.
 */
export class InsForgeFilingRepository
  implements IFilingRepository, IChatRepository, ITariffRepository
{
  // ------------- IFilingRepository -------------

  async getAllFilings(): Promise<FilingRecord[]> {
    throw new Error(
      'Not implemented - requires InsForge backend integration'
    );
  }

  async getFilingById(_id: string): Promise<FilingRecord | null> {
    throw new Error(
      'Not implemented - requires InsForge backend integration'
    );
  }

  async createFiling(_filing: FilingRecord): Promise<FilingRecord> {
    throw new Error(
      'Not implemented - requires InsForge backend integration'
    );
  }

  async updateFiling(_id: string, _patch: Partial<FilingRecord>): Promise<FilingRecord> {
    throw new Error(
      'Not implemented - requires InsForge backend integration'
    );
  }

  async deleteFiling(_id: string): Promise<void> {
    throw new Error(
      'Not implemented - requires InsForge backend integration'
    );
  }

  async getActiveFilingId(): Promise<string | null> {
    throw new Error(
      'Not implemented - requires InsForge backend integration'
    );
  }

  async setActiveFilingId(_id: string): Promise<void> {
    throw new Error(
      'Not implemented - requires InsForge backend integration'
    );
  }

  // ------------- IChatRepository -------------

  async getMessages(_filingId: string): Promise<ChatMessage[]> {
    throw new Error(
      'Not implemented - requires InsForge backend integration'
    );
  }

  async addMessage(_filingId: string, _message: ChatMessage): Promise<void> {
    throw new Error(
      'Not implemented - requires InsForge backend integration'
    );
  }

  async clearMessages(_filingId: string): Promise<void> {
    throw new Error(
      'Not implemented - requires InsForge backend integration'
    );
  }

  // ------------- ITariffRepository -------------

  async searchTariff(_query: string, _filters: TariffFilters): Promise<TariffSearchResult[]> {
    throw new Error(
      'Not implemented - requires InsForge backend integration'
    );
  }

  async getTarItem(_code: string): Promise<TariffItem | null> {
    throw new Error(
      'Not implemented - requires InsForge backend integration'
    );
  }

  async getChapters(): Promise<TariffChapter[]> {
    throw new Error(
      'Not implemented - requires InsForge backend integration'
    );
  }
}