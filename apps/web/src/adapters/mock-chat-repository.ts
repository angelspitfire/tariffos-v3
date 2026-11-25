/**
 * MockChatRepository - mock implementation of IChatRepository.
 * Messages stored in memory per filingId.
 */

import { ChatMessage } from '@/domain/repositories';
import { INITIAL_CHAT_MESSAGES } from '@/lib/a2ui-artifacts';

const CHAT_STORAGE = new Map<string, ChatMessage[]>();

export class MockChatRepository {
  async getMessages(filingId: string): Promise<ChatMessage[]> {
    const stored = CHAT_STORAGE.get(filingId);
    const initial = [...INITIAL_CHAT_MESSAGES];
    const messages = stored ? stored : initial;
    return messages.filter((msg): msg is ChatMessage => 'filingId' in msg && msg.filingId === filingId);
  }

  async addMessage(message: ChatMessage): Promise<void> {
    const existing = CHAT_STORAGE.get(message.filingId) ?? [];
    existing.push(message);
    CHAT_STORAGE.set(message.filingId, existing);
  }

  async clearMessages(filingId: string): Promise<void> {
    CHAT_STORAGE.delete(filingId);
  }
}