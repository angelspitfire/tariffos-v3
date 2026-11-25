import { parseChatStream, type ParsedChatStream } from './chat-stream-parser';
import type { ChatMessage } from '@/types/domain';

export async function sendChatRequest(
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<ParsedChatStream> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
    signal,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error('Empty response body');

  return parseChatStream(res.body, signal);
}
