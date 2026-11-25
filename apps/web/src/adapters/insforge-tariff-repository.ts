/**
 * InsForgeTariffRepository - InsForge stub implementation of ITariffRepository.
 * Placeholder for actual InsForge backend integration.
 */

import type { TariffChapter } from '@/domain/repositories';
import { ITariffRepository } from '@/domain/repositories';

export class InsForgeTariffRepository implements ITariffRepository {
  async search(_query: string, _filters?: unknown): Promise<unknown> {
    // Stub: return empty results for InsForge integration
    return Promise.resolve<TariffChapter[]>([]);
  }

  async getByCode(_code: unknown): Promise<unknown> {
    // Stub: return null for InsForge integration
    return Promise.resolve<TariffChapter | null>(null);
  }

  async getTree(): Promise<unknown> {
    // Stub: return empty array for InsForge integration
    return Promise.resolve<TariffChapter[]>([]);
  }

  async getFavorites(): Promise<unknown> {
    // Stub: return empty array for InsForge integration
    return Promise.resolve<TariffChapter[]>([]);
  }

  async getHistory(): Promise<unknown> {
    // Stub: return empty array for InsForge integration
    return Promise.resolve<TariffChapter[]>([]);
  }

  async toggleFavorite(_code: unknown, _isFavorite: boolean): Promise<unknown> {
    // Stub: no-op for InsForge integration
    return Promise.resolve(undefined);
  }

  async addToHistory(_entry: unknown): Promise<unknown> {
    // Stub: no-op for InsForge integration
    return Promise.resolve(undefined);
  }

  async removeFromHistory(_code: string): Promise<unknown> {
    // Stub: no-op for InsForge integration
    return Promise.resolve(undefined);
  }

  async clearHistory(): Promise<unknown> {
    // Stub: no-op for InsForge integration
    return Promise.resolve(undefined);
  }
}