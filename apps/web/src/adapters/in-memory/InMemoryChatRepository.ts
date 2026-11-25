/**
 * InMemoryChatRepository - in-memory implementation of IChatRepository.
 * Messages stored per filingId; streaming state per filingId.
 */

import {
  IChatRepository,
  ChatMessage,
  StreamingState,
} from '@/domain/repositories';
import { Result, Ok } from '@/domain/Result';

const SIMULATED_IO_DELAY_MS = 10;

async function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_IO_DELAY_MS));
}

export class InMemoryChatRepository implements IChatRepository {
  private readonly messages = new Map<string, ChatMessage[]>();
  private readonly streamingState = new Map<string, StreamingState>();

  async saveMessage(message: ChatMessage): Promise<Result<void, Error>> {
    await delay();
    const existing = this.messages.get(message.filingId) ?? [];
    existing.push(message);
    this.messages.set(message.filingId, existing);
    return Ok(undefined);
  }

  async getMessages(
    filingId: string,
    limit?: number
  ): Promise<Result<ChatMessage[], Error>> {
    await delay();
    const messages = (this.messages.get(filingId) ?? []).slice();
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return Ok(limit ? messages.slice(-limit) : messages);
  }

  async getStreamingState(filingId: string): Promise<Result<StreamingState | null, Error>> {
    await delay();
    const state = this.streamingState.get(filingId) ?? null;
    return Ok(state);
  }

  async setStreamingState(
    filingId: string,
    state: StreamingState
  ): Promise<Result<void, Error>> {
    await delay();
    this.streamingState.set(filingId, { ...state });
    return Ok(undefined);
  }

  async clearMessages(filingId: string): Promise<Result<void, Error>> {
    await delay();
    this.messages.delete(filingId);
    this.streamingState.delete(filingId);
    return Ok(undefined);
  }
}
