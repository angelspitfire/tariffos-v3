/**
 * OpenAI-compatible adapter for the canonical port (F0): Ollama, OpenRouter,
 * vLLM, or any server speaking the OpenAI `/v1` contract.
 *
 * JSON strategy — two passes, the deterministic barrier always last:
 * 1. `generateObject` lets the SDK negotiate structured output and retry
 *    transport hiccups.
 * 2. When the server rejects object mode (many local servers do), fall back
 *    to plain text, repair it with `jsonrepair`, and enforce the caller's
 *    Zod schema.
 *
 * Embeddings — the width is a contract, not a hint:
 * `providerOptions` is keyed by the provider's `name`, and the adapter
 * validates the width that comes back. Both halves matter:
 *
 * - The key. In `@ai-sdk/openai-compatible`, `OpenAICompatibleEmbeddingModel`
 *   reads `providerOptions` under `providerOptionsName`, which is
 *   `config.provider.split('.')[0]` — the `name` given to
 *   `createOpenAICompatible`. The SDK also accepts `openaiCompatible` and the
 *   deprecated `openai-compatible`. It does NOT accept `openai`: that key is
 *   ignored silently, `parseProviderOptions` returns `undefined` instead of
 *   throwing, the server never receives `dimensions`, and the vector comes
 *   back at the model default width (1536 for `text-embedding-3-small`).
 * - The check. The tariff index is `vector(768)`, and pgvector refuses to
 *   compare vectors of different dimensions: the query does not fail, it
 *   simply stops matching. Validating the width turns that silent
 *   degradation into a loud error on the first call.
 */
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { embed, generateObject, generateText, streamText } from 'ai';
import type { FilePart, ModelMessage, TextPart } from 'ai';
import { jsonrepair } from 'jsonrepair';
import type { ZodType } from 'zod';
import {
  DEFAULT_TIMEOUT_MS,
  EmbeddingDimensionMismatchError,
  validateJson,
  type Attachment,
  type EmbedCallOptions,
  type GenerateCallOptions,
  type LlmProviderPort,
  type TextStream,
} from '../port.js';
import {
  resolveApiKey,
  resolveBaseUrl,
  resolveEmbeddingDims,
  resolveEmbeddingModel,
  resolveModel,
  resolveProvider,
} from '../config.js';
import { createNvidiaTransportFetch } from './nvidia-fetch.js';

/**
 * The provider's `name`. It is both the SDK provider id and the
 * `providerOptions` key — they must be the same string.
 */
export const PROVIDER_NAME = 'tariffos-llm';

/** Retry budget for embedding calls, matching the SDK default. */
const EMBED_MAX_RETRIES = 3;

/** The two model endpoints this adapter consumes from the provider. */
export interface ProviderLike {
  chatModel(modelId: string): LanguageModelLike;
  textEmbeddingModel(modelId: string): EmbeddingModelLike;
}

/** Structural aliases so the methods below are honest about what they need. */
type LanguageModelLike = Parameters<typeof generateText>[0]['model'];
type EmbeddingModelLike = Parameters<typeof embed>[0]['model'];

export class OpenAICompatibleAdapter implements LlmProviderPort {
  private provider: ProviderLike | null = null;
  private readonly providerFactory: () => ProviderLike;

  /** `providerFactory` exists for tests; production uses the default. */
  constructor(providerFactory?: () => ProviderLike) {
    this.providerFactory = providerFactory ?? (() => OpenAICompatibleAdapter.defaultFactory());
  }

  private static defaultFactory(): ProviderLike {
    const isNvidia = resolveProvider() === 'nvidia';
    return createOpenAICompatible({
      name: PROVIDER_NAME,
      baseURL: resolveBaseUrl(),
      apiKey: resolveApiKey(),
      supportsStructuredOutputs: !isNvidia,
      ...(isNvidia ? { fetch: createNvidiaTransportFetch() } : {}),
    });
  }

  /** Lazy: importing this module must not touch the network. */
  private models(): ProviderLike {
    if (!this.provider) this.provider = this.providerFactory();
    return this.provider;
  }

  private chatModel(options: GenerateCallOptions): LanguageModelLike {
    return this.models().chatModel(options.model ?? resolveModel());
  }

  private embeddingModel(options: EmbedCallOptions): EmbeddingModelLike {
    return this.models().textEmbeddingModel(options.model ?? resolveEmbeddingModel());
  }

  async generateText(prompt: string, options: GenerateCallOptions = {}): Promise<string> {
    const response = await generateText({
      model: this.chatModel(options),
      ...resolvePrompt(prompt, options.attachments),
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
      abortSignal: abortSignalFor(options),
    });
    return response.text;
  }

  async generateJson<T>(
    prompt: string,
    schema: ZodType<T>,
    options: GenerateCallOptions = {},
  ): Promise<T> {
    if (resolveProvider() === 'nvidia') {
      const raw = await this.generateText(prompt, options);
      return validateJson(repairJson(raw), schema);
    }

    const callOptions = {
      model: this.chatModel(options),
      ...resolvePrompt(prompt, options.attachments),
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
      abortSignal: abortSignalFor(options),
      maxRetries: 0,
    };
    try {
      const response = await generateObject({ ...callOptions, schema });
      return response.object as T;
    } catch {
      // Structured output rejected (many local servers do): take the text
      // path once and enforce the barrier manually. `validateJson` maps any
      // residual mismatch to a typed `SchemaViolationError`, so callers
      // classify retries the same way regardless of which pass failed.
      const raw = await this.generateText(prompt, options);
      return validateJson(repairJson(raw), schema);
    }
  }

  async embedText(text: string, options: EmbedCallOptions = {}): Promise<number[]> {
    const dims = options.dims ?? resolveEmbeddingDims();
    const providerOpts: Record<string, unknown> = { dimensions: dims };
    if (resolveProvider() === 'nvidia') {
      providerOpts.input_type = options.inputType ?? 'query';
    }
    const response = await embed({
      model: this.embeddingModel(options),
      value: text,
      maxRetries: EMBED_MAX_RETRIES,
      providerOptions: { [PROVIDER_NAME]: providerOpts as Record<string, never> },
    });
    const vector = response.embedding;
    if (!Array.isArray(vector) || vector.length === 0) {
      throw new Error('embedding server returned no values');
    }
    if (vector.length !== dims) {
      throw new EmbeddingDimensionMismatchError(dims, vector.length);
    }
    return vector;
  }

  /**
   * The same completion as `generateText`, in fragments.
   *
   * The SDK's own stream type never leaves this module: the port exposes an
   * `AsyncIterable<string>`, so a caller depends on the contract and not on
   * how the provider happens to deliver the text.
   */
  streamText(prompt: string, options: GenerateCallOptions = {}): TextStream {
    const result = streamText({
      model: this.chatModel(options),
      ...resolvePrompt(prompt, options.attachments),
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
      abortSignal: abortSignalFor(options),
    });
    return result.textStream;
  }
}

/**
 * The signal that cancels the call: the caller's, if any, combined with the
 * timeout. `AbortSignal.any` keeps whichever fires first.
 */
function abortSignalFor(options: GenerateCallOptions): AbortSignal {
  const timeout = AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  return options.abortSignal ? AbortSignal.any([options.abortSignal, timeout]) : timeout;
}

/**
 * Build the prompt the provider receives.
 *
 * Text-only prompts go through `prompt`, as they always did. A prompt with
 * binary parts needs `messages`, because the provider carries those parts
 * as structured content — an image becomes an `image_url`, a PDF becomes a
 * `file` — and a bare string cannot express them.
 *
 * The translation is where the port's shapes meet the SDK's: an inline
 * attachment becomes a base64 `data:` URL, and a reference becomes the
 * provider's own handle.
 */
function resolvePrompt(
  prompt: string,
  attachments?: Attachment[],
): { prompt: string } | { messages: ModelMessage[] } {
  if (!attachments || attachments.length === 0) return { prompt };

  const parts: Array<TextPart | FilePart> = [{ type: 'text', text: prompt }];
  for (const att of attachments) {
    if (att.type === 'text') {
      parts.push({ type: 'text', text: att.text });
    } else if (att.type === 'inline') {
      // The provider takes images as `file` parts whose media type starts
      // with `image/`; it has no separate image part. A data URL passes
      // through as-is, which is what both an OpenAI-compatible server and
      // OpenRouter expect.
      parts.push({
        type: 'file',
        mediaType: att.mimeType,
        data: att.dataUrl,
      });
    } else {
      // A provider file handle.
      //
      // An OpenAI-compatible server does not accept a file id here: it
      // expects the bytes, and it would base64-encode the id into garbage.
      // So the handle is carried as a URL when it is one, and refused
      // otherwise — the caller has to fetch the bytes and send them inline.
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
      // jsonrepair could not recover it; `validateJson` will fail with a
      // typed SchemaViolationError, which is the contract callers expect.
      return candidate;
    }
  }
}
