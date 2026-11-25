import { type ApiToolCallPart, parseA2UIArtifact } from '@/lib/a2ui-artifacts';
import { type A2UIArtifact, type OrganismPayload } from '@/types/domain';

export interface ParsedChatStream {
  responseText: string;
  artifact?: A2UIArtifact;
  organism?: OrganismPayload;
  display?: unknown;
}

export async function parseChatStream(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): Promise<ParsedChatStream> {
  const textDecoder = new TextDecoder();
  const reader = body.getReader();
  let buffer = '';
  let responseText = '';
  let artifact: A2UIArtifact | undefined;
  let organism: OrganismPayload | undefined;
  let display: unknown;
  const toolCalls = new Map<string, { toolName: string; artifactKind: string }>();

  try {
    while (true) {
      if (signal && signal.aborted) {
        reader.releaseLock();
        throw new DOMException('Aborted', 'AbortError');
      }
      const { done, value } = await reader.read();
      if (done) {
        buffer += textDecoder.decode();
        break;
      }
      
      // Buffer overflow protection
      if (buffer.length > 1024 * 1024) { // 1MB limit
        buffer = buffer.slice(-512 * 1024); // Keep last 512KB
      }
      
      buffer += textDecoder.decode(value, { stream: true });

      let eventEnd = buffer.indexOf('\n\n');
      while (eventEnd !== -1) {
        const eventBlock = buffer.slice(0, eventEnd);
        buffer = buffer.slice(eventEnd + 2);

        const dataLine = eventBlock.split('\n').find((line) => line.startsWith('data: '));
        if (!dataLine) continue;

        const dataStr = dataLine.slice(6);
        if (dataStr === '[DONE]') continue;

        let chunk: unknown;
        try {
          chunk = JSON.parse(dataStr);
        } catch {
          continue;
        }

        const part = chunk as {
          type?: string;
          delta?: string;
          toolCallId?: string;
          toolName?: string;
          artifactKind?: string;
          output?: unknown;
        };

        if (part.type === 'text-delta' && typeof part.delta === 'string') {
          responseText += part.delta;
        } else if (part.type === 'tool-input-available' && part.toolCallId) {
          toolCalls.set(part.toolCallId, {
            toolName: part.toolName ?? '',
            artifactKind: part.artifactKind ?? '',
          });
        } else if (part.type === 'tool-output-available' && part.toolCallId) {
          const call = toolCalls.get(part.toolCallId);
          if (!call) continue;
          const apiPart: ApiToolCallPart = {
            type: 'tool-call',
            toolName: call.toolName,
            artifactKind: call.artifactKind,
            result: part.output,
          };
          const parsed = parseA2UIArtifact(apiPart);
          if (parsed.artifact) {
            artifact = parsed.artifact;
            organism = parsed.organism;
            if (parsed.display !== undefined) {
              display = parsed.display;
            }
          }
        }

        eventEnd = buffer.indexOf('\n\n');
      }
    }
  } finally {
    reader.releaseLock();
  }

  return { responseText, artifact, organism, display };
}
