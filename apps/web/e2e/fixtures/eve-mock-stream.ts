import type { A2UIEnvelope } from '@tariffos/shared-types';

/** Builds a v27 NDJSON stream response for `@assistant-ui/eve` mock Playwright routes. */
export function buildEveNdjsonBody(
  prompt: string,
  envelope: A2UIEnvelope,
  startIndex: number,
): string {
  if (startIndex >= 1) {
    return '{"$eve":"stream.ended"}\n';
  }
  const commit = {
    at: '2026-11-28T05:00:00.000Z',
    facts: [
      { type: 'session.started', data: {} },
      { type: 'delivery.admitted', data: { deliveryId: 'del-e2e-1' } },
      {
        type: 'turn.started',
        data: { turnId: 'turn-1', cause: { deliveryId: 'del-e2e-1' }, follows: null },
      },
      {
        type: 'delivery.consumed',
        scope: { turnId: 'turn-1' },
        data: {
          deliveryId: 'del-e2e-1',
          turnId: 'turn-1',
          parts: [{ kind: 'text', text: prompt }],
        },
      },
      {
        type: 'model.requested',
        scope: { turnId: 'turn-1' },
        data: { runId: 'run-1', owner: { turnId: 'turn-1' } },
      },
      {
        type: 'model.started',
        scope: { turnId: 'turn-1', runId: 'run-1' },
        data: { runId: 'run-1', modelId: 'mock-e2e', attempt: 0 },
      },
      {
        type: 'call.requested',
        scope: { turnId: 'turn-1', runId: 'run-1' },
        data: {
          callId: 'call-cls-1',
          owner: { runId: 'run-1' },
          capability: { kind: 'tool', name: 'classify_item' },
          input: { description: prompt },
        },
      },
      {
        type: 'call.started',
        scope: { turnId: 'turn-1', runId: 'run-1' },
        data: { callId: 'call-cls-1' },
      },
      {
        type: 'call.settled',
        scope: { turnId: 'turn-1', runId: 'run-1' },
        data: {
          callId: 'call-cls-1',
          outcome: 'completed',
          output: { line: {}, envelope },
        },
      },
      {
        type: 'content.completed',
        scope: { turnId: 'turn-1', runId: 'run-1' },
        data: {
          partId: 'part-1',
          runId: 'run-1',
          kind: 'text',
          phase: 'reply',
          value: envelope.assistantMessage,
        },
      },
      {
        type: 'model.settled',
        scope: { turnId: 'turn-1', runId: 'run-1' },
        data: { runId: 'run-1', outcome: 'completed', finishReason: 'stop' },
      },
      {
        type: 'turn.settled',
        scope: { turnId: 'turn-1' },
        data: { turnId: 'turn-1', outcome: 'completed', reply: ['part-1'] },
      },
      {
        type: 'delivery.settled',
        scope: { turnId: 'turn-1' },
        data: { deliveryId: 'del-e2e-1', outcome: 'handled', turnId: 'turn-1' },
      },
    ],
  };
  return `${JSON.stringify(commit)}\n{"$eve":"stream.ended"}\n`;
}

export function extractPromptText(postBody: unknown): string {
  if (!postBody || typeof postBody !== 'object') return 'Clasificación arancelaria';
  const msg = (postBody as { message?: unknown }).message;
  if (typeof msg === 'string' && msg.trim()) return msg.trim();
  if (Array.isArray(msg)) {
    const joined = msg
      .map((part) => (part && typeof part === 'object' ? (part as { text?: unknown }).text : ''))
      .filter((t): t is string => typeof t === 'string')
      .join(' ')
      .trim();
    if (joined) return joined;
  }
  return 'Clasificación arancelaria';
}
