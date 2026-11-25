/**
 * Adapters Layer - Barrel Export
 * Provides a factory to create repository instances.
 * Defaults to MockFilingRepository for testing/offline mode.
 * Can be switched to InsForgeFilingRepository via environment variable.
 */

import { InsForgeFilingRepository } from './insforge-filing-repository';
import { MockFilingRepository } from './mock-filing-repository';
import type { ChatMessage } from '@/domain/repositories/RepositoryInterfaces';
import type {
  IFilingRepository,
  IChatRepository,
  ITariffRepository,
} from './filing-repository';

// Environment switch: use 'INSFORGE' to switch to backend implementation
function getUseInsforge(): boolean {
  return typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_USE_INSFORGE === 'true';
}

/**
 * Factory: creates a filing repository instance.
 * - By default returns MockFilingRepository (localStorage + MOCK_FILINGS)
 * - If NEXT_PUBLIC_USE_INSFORGE=true, returns InsForgeFilingRepository
 */
export function createFilingRepository(
  type?: 'mock' | 'insforge'
): IFilingRepository & IChatRepository & ITariffRepository {
  if (type === 'insforge' || (getUseInsforge() && !type)) {
    return new InsForgeFilingRepository();
  }
  return new MockFilingRepository();
}

/**
 * Factory: creates a chat repository instance.
 * Currently only supports MockFilingRepository chat storage.
 */
export function createChatRepository(
  filingRepository: IFilingRepository & IChatRepository & ITariffRepository
): IChatRepository {
  // Return the chat interface from the provided repository if it implements it,
  // otherwise default to a basic implementation that uses localStorage.
  if ('getMessages' in filingRepository && 'addMessage' in filingRepository) {
    return filingRepository;
  }
  // Fallback: create a simple localStorage-based chat repository
  const messagesMap = new Map<string, ChatMessage[]>();

  return {
    async getMessages(filingId: string): Promise<ChatMessage[]> {
      return messagesMap.get(filingId) ?? [];
    },
    async addMessage(filingId: string, message: ChatMessage): Promise<void> {
      const existing = messagesMap.get(filingId) ?? [];
      messagesMap.set(filingId, [...existing, message]);
    },
    async clearMessages(filingId: string): Promise<void> {
      messagesMap.delete(filingId);
    },
  };
}

/**
 * Factory: creates a tariff repository instance.
 * Currently only supports MockFilingRepository tariff storage.
 */
export function createTariffRepository(
  filingRepository: IFilingRepository & IChatRepository & ITariffRepository
): ITariffRepository {
  if ('searchTariff' in filingRepository && 'getTarItem' in filingRepository) {
    return filingRepository;
  }
  // Fallback: return a no-op implementation
  return {
    async searchTariff(_query: string, _filters: never): Promise<never> {
      throw new Error('Not implemented');
    },
    async getTarItem(_code: string): Promise<never> {
      throw new Error('Not implemented');
    },
    async getChapters(): Promise<never> {
      throw new Error('Not implemented');
    },
  };
}

/**
 * Mock repository exports.
 */
export { MockFilingRepository } from './mock-filing-repository';
export { MockChatRepository } from './mock-chat-repository';
export { MockTariffRepository } from './mock-tariff-repository';

/**
 * InsForge repository exports.
 */
export { InsForgeFilingRepository } from './insforge-filing-repository';
export { InsForgeChatRepository } from './insforge-chat-repository';
export { InsForgeTariffRepository } from './insforge-tariff-repository';

/**
 * Re-export all interface types for convenience.
 */
export type {
  IFilingRepository,
  IChatRepository,
  ITariffRepository,
};