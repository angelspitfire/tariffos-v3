import type { FilePart, ModelMessage, TextPart } from 'ai';
import { jsonrepair } from 'jsonrepair';
import { DEFAULT_TIMEOUT_MS, type Attachment, type GenerateCallOptions } from '../port.js';

/** Cancels when either the caller's signal aborts or the timeout fires. */
export function abortSignalFor(options: GenerateCallOptions): AbortSignal {
  const timeout = AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  return options.abortSignal ? AbortSignal.any([options.abortSignal, timeout]) : timeout;
}

/**
 * Translates plain prompts and inline/reference attachments into AI SDK prompt shapes.
 */
export function resolvePrompt(
  prompt: string,
  attachments?: Attachment[],
): { prompt: string } | { messages: ModelMessage[] } {
  if (!attachments || attachments.length === 0) return { prompt };

  const parts: Array<TextPart | FilePart> = [{ type: 'text', text: prompt }];
  for (const att of attachments) {
    if (att.type === 'text') {
      parts.push({ type: 'text', text: att.text });
    } else if (att.type === 'inline') {
      parts.push({
        type: 'file',
        mediaType: att.mimeType,
        data: att.dataUrl,
      });
    } else {
      if (!/^(data:|https?:\/\/)/.test(att.uri)) {
        throw new Error(
          'OpenAI-compatible adapter cannot reference a provider file id: ' +
            'this provider takes the document bytes, not a handle. ' +
            'Send the document inline instead.',
        );
      }
      parts.push({ type: 'file', mediaType: att.mimeType, data: att.uri });
    }
  }
  return { messages: [{ role: 'user', content: parts }] };
}

/**
 * Repair non-strict JSON (markdown fences, trailing commas) before the
 * schema barrier. Pure: returns the input unchanged when it is already
 * valid JSON.
 */
export function repairJson(raw: string): string {
  const stripped = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const fenced = stripped.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const candidate =
    fenced ??
    (() => {
      const start = stripped.indexOf('{');
      const end = stripped.lastIndexOf('}');
      return start !== -1 && end > start ? stripped.slice(start, end + 1) : stripped;
    })();

  try {
    JSON.parse(candidate);
    return candidate;
  } catch {
    try {
      return jsonrepair(candidate);
    } catch {
      return candidate;
    }
  }
}
