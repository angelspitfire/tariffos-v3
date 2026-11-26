import {
  A2UIEnvelopeSchema,
  StreamProgressEventSchema,
  type A2UIEnvelope,
  type StreamProgressEvent,
} from '@tariffos/shared-types';

export function formatSseFrame(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function encodeProgressEvent(event: StreamProgressEvent): string {
  const validated = StreamProgressEventSchema.parse(event);
  return formatSseFrame('progress', validated);
}

export function encodeResultEvent(envelope: A2UIEnvelope): string {
  const validated = A2UIEnvelopeSchema.parse(envelope);
  return formatSseFrame('result', validated);
}

export function encodeErrorEvent(message: string, code = 'CLASSIFICATION_ERROR'): string {
  return formatSseFrame('error', { code, message });
}
