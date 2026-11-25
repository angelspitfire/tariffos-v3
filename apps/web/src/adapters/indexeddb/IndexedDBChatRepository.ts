/**
 * IndexedDB Chat Repository Adapter
 * Production persistence for chat messages
 */

import { StreamingState, ChatMessage } from '@/domain/repositories';
import { idb } from './IDBDatabase';

type ChatRecord = { id: string; timestamp: number; filingId: string; [key: string]: unknown };

export class IndexedDBChatRepository {
  async saveMessage(message: ChatMessage): Promise<unknown> {
    try { await idb.put('chatHistory', message); return { ok: true, value: message }; } 
    catch (error) { return { ok: false, error: error instanceof Error ? error : new Error('Failed to save message') }; }
  }

  async getMessages(filingId: string, limit?: number): Promise<unknown> {
    try {
      const result = await idb.getAllByIndex<ChatRecord>('chatHistory', 'filingId', filingId);
      if (!result.ok) throw result.error;
      const sorted = result.value.sort((a, b) => a.timestamp - b.timestamp);
      return { ok: true, value: limit ? sorted.slice(-limit) : sorted };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error : new Error('Failed to get messages') };
    }
  }

  async getStreamingState(filingId: string): Promise<unknown> {
    try {
      const result = await idb.get<StreamingState>('chatHistory', `streaming:${filingId}`);
      if (!result.ok) throw result.error;
      return { ok: true, value: result.value ?? null };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error : new Error('Failed to get streaming state') };
    }
  }

  async setStreamingState(filingId: string, state: StreamingState): Promise<unknown> {
    try { await idb.put('chatHistory', { ...state, id: `streaming:${filingId}` }); return { ok: true, value: undefined }; } 
    catch (error) { return { ok: false, error: error instanceof Error ? error : new Error('Failed to set streaming state') }; }
  }

  async clearMessages(filingId: string): Promise<unknown> {
    try {
      const result = await idb.getAllByIndex<{ id: string }>('chatHistory', 'filingId', filingId);
      if (!result.ok) throw result.error;
      for (const msg of result.value) { await idb.delete('chatHistory', msg.id); }
      await idb.delete('chatHistory', `streaming:${filingId}`);
      return { ok: true, value: undefined };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error : new Error('Failed to clear messages') };
    }
  }
}
