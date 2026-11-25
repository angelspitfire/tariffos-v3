import { simulateReadableStream } from 'ai';
import { dispatchTool } from '@/lib/ai/dispatch-tool';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const INITIAL_DELAY_MS = 300;
const CHUNK_DELAY_MS = 80;

function buildMockChunks(userText: string): string[] {
  const { textResponse, toolName, toolResult, artifactKind } =
    dispatchTool(userText);
  const msgId = `msg-${Date.now()}`;
  const textPartId = `text-${Date.now()}`;
  const toolCallId = `call-${Date.now()}`;
  const chunks: string[] = [];

  chunks.push(sse({ type: 'start', messageId: msgId }));

  chunks.push(sse({ type: 'text-start', id: textPartId }));
  for (const word of textResponse.split(' ')) {
    chunks.push(sse({ type: 'text-delta', id: textPartId, delta: word + ' ' }));
  }
  chunks.push(sse({ type: 'text-end', id: textPartId }));

  if (toolName && toolResult) {
    chunks.push(
      sse({
        type: 'tool-input-available',
        toolCallId,
        toolName,
        input: {},
        artifactKind,
      }),
    );
    chunks.push(
      sse({
        type: 'tool-output-available',
        toolCallId,
        output: toolResult,
      }),
    );
  }

  chunks.push(sse({ type: 'finish', finishReason: 'stop' }));
  chunks.push('data: [DONE]\n\n');

  return chunks;
}

function sse(payload: Record<string, unknown>): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages?: Array<{
        role: string;
        content: string | Array<{ type: string; text?: string }>;
      }>;
    };
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');

    let userText = '';
    if (typeof lastUser?.content === 'string') {
      userText = lastUser.content;
    } else if (Array.isArray(lastUser?.content)) {
      userText = lastUser.content
        .filter((p) => p.type === 'text' && typeof p.text === 'string')
        .map((p) => p.text)
        .join('');
    }

    const chunks = buildMockChunks(userText);
    const stream = simulateReadableStream({
      initialDelayInMs: INITIAL_DELAY_MS,
      chunkDelayInMs: CHUNK_DELAY_MS,
      chunks,
    }).pipeThrough(new TextEncoderStream());

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'x-vercel-ai-ui-message-stream': 'v1',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
