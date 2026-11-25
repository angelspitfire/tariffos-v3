/**
 * InsForgeChatRepository - InsForge stub implementation of IChatRepository.
 * Placeholder for actual InsForge backend integration.
 */

import type { ChatMessage, StreamingState } from '@/domain/repositories';
import { IChatRepository } from '@/domain/repositories';

export class InsForgeChatRepository implements IChatRepository {
  async saveMessage(_message: ChatMessage): Promise<unknown> {
    // Stub: no-op for InsForge backend integration
    return Promise.resolve(undefined);
  }

  async getMessages(_filingId: string, _limit?: number): Promise<unknown> {
    // Stub: return empty array for InsForge integration
    return Promise.resolve<ChatMessage[]>([]);
  }

  async getStreamingState(_filingId: string): Promise<unknown> {
    // Stub: return null for InsForge integration
    return Promise.resolve<StreamingState | null>(null);
  }

  async setStreamingState(_filingId: string, _state: StreamingState): Promise<unknown> {
    // Stub: no-op for InsForge integration
    return Promise.resolve(undefined);
  }

  async clearMessages(_filingId: string): Promise<unknown> {
    // Stub: no-op for InsForge integration
    return Promise.resolve(undefined);
  }
}