import { NextResponse } from 'next/server';
import { dispatchTool, type IncomingMessage, type IncomingPart } from '@/lib/ai/dispatch-tool';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { messages?: IncomingMessage[] };
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastMessage = messages[messages.length - 1];

    let userText = '';
    if (typeof lastMessage?.content === 'string') {
      userText = lastMessage.content;
    } else if (Array.isArray(lastMessage?.content)) {
      userText = lastMessage.content
        .filter((p: IncomingPart) => p.type === 'text' && typeof p.text === 'string')
        .map((p: IncomingPart) => p.text ?? '')
        .join('');
    }

    const { textResponse, toolName, toolArgs, toolResult, artifactKind } =
      dispatchTool(userText);

    const content: Array<Record<string, unknown>> = [{ type: 'text', text: textResponse }];

    if (toolName && toolResult) {
      content.push({
        type: 'tool-call',
        toolCallId: `call-${Date.now()}`,
        toolName,
        artifactKind,
        args: toolArgs,
        result: toolResult,
      });
    }
    return NextResponse.json({ content, artifactKind });
  } catch (error) {
    const text = error instanceof Error ? `Error processing: ${error.message}` : 'Unknown error on the server.';
    return NextResponse.json({ content: [{ type: 'text', text }] }, { status: 500 });
  }
}
