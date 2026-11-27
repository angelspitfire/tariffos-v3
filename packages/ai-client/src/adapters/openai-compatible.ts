import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  embed,
  embedMany as aiEmbedMany,
  generateObject,
  generateText,
  streamText,
} from 'ai';
import type { ZodType } from 'zod';
import {
  EmbeddingDimensionMismatchError,
  validateJson,
  type EmbedCallOptions,
  type GenerateCallOptions,
  type LlmProviderPort,
  type TextStream,
} from '../port.js';
import {
  resolveApiKeyForProvider,
  resolveBaseUrlForProvider,
  resolveEmbeddingDims,
  resolveEmbeddingModel,
  resolveModel,
  resolveProvider,
  type LlmProvider,
} from '../config.js';
import { createNvidiaTransportFetch } from './nvidia-fetch.js';
import { abortSignalFor, repairJson, resolvePrompt } from './prompt-helpers.js';
import { reportCallUsage } from './usage-helpers.js';

export { repairJson } from './prompt-helpers.js';

/** Per-instance runtime override for generation calls (never mutates env). */
export interface LlmRuntimeOverride {
  provider?: LlmProvider;
  baseUrl?: string;
  apiKey?: string;
}

export const PROVIDER_NAME = 'tariffosLlm';
const EMBED_MAX_RETRIES = 3;

export interface ProviderLike {
  chatModel(modelId: string): LanguageModelLike;
  textEmbeddingModel(modelId: string): EmbeddingModelLike;
}

type LanguageModelLike = Parameters<typeof generateText>[0]['model'];
type EmbeddingModelLike = Parameters<typeof embed>[0]['model'];

export class OpenAICompatibleAdapter implements LlmProviderPort {
  private provider: ProviderLike | null = null;
  private readonly providerFactory: () => ProviderLike;
  private readonly runtimeOverride?: LlmRuntimeOverride;

  constructor(providerFactory?: () => ProviderLike, runtimeOverride?: LlmRuntimeOverride) {
    this.runtimeOverride = runtimeOverride;
    this.providerFactory =
      providerFactory ?? (() => OpenAICompatibleAdapter.defaultFactory(runtimeOverride));
  }

  private activeProvider(): LlmProvider {
    return this.runtimeOverride?.provider ?? resolveProvider();
  }

  private static defaultFactory(override?: LlmRuntimeOverride): ProviderLike {
    const provider = override?.provider ?? resolveProvider();
    const isNvidia = provider === 'nvidia';
    return createOpenAICompatible({
      name: PROVIDER_NAME,
      baseURL: resolveBaseUrlForProvider(provider, override?.baseUrl),
      apiKey: override?.apiKey ?? resolveApiKeyForProvider(provider),
      supportsStructuredOutputs: !isNvidia,
      ...(isNvidia ? { fetch: createNvidiaTransportFetch() } : {}),
    });
  }

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

  private buildEmbedProviderOptions(dims: number, options: EmbedCallOptions): Record<string, unknown> {
    const providerOpts: Record<string, unknown> = { dimensions: dims };
    if (this.activeProvider() === 'nvidia') {
      providerOpts.input_type = options.inputType ?? 'query';
      providerOpts.truncate = 'END';
    }
    return providerOpts;
  }

  async generateText(prompt: string, options: GenerateCallOptions = {}): Promise<string> {
    const response = await generateText({
      model: this.chatModel(options),
      ...resolvePrompt(prompt, options.attachments),
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
      ...(options.maxOutputTokens !== undefined ? { maxOutputTokens: options.maxOutputTokens } : {}),
      abortSignal: abortSignalFor(options),
    });
    reportCallUsage(response.usage, options.onUsage);
    return response.text;
  }

  async generateJson<T>(
    prompt: string,
    schema: ZodType<T>,
    options: GenerateCallOptions = {},
  ): Promise<T> {
    if (this.activeProvider() === 'nvidia') {
      const raw = await this.generateText(prompt, options);
      return validateJson(repairJson(raw), schema);
    }

    const callOptions = {
      model: this.chatModel(options),
      ...resolvePrompt(prompt, options.attachments),
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
      ...(options.maxOutputTokens !== undefined ? { maxOutputTokens: options.maxOutputTokens } : {}),
      abortSignal: abortSignalFor(options),
      maxRetries: 0,
    };
    try {
      const response = await generateObject({ ...callOptions, schema });
      reportCallUsage(response.usage, options.onUsage);
      return response.object as T;
    } catch {
      const raw = await this.generateText(prompt, options);
      return validateJson(repairJson(raw), schema);
    }
  }

  async embedText(text: string, options: EmbedCallOptions = {}): Promise<number[]> {
    const dims = options.dims ?? resolveEmbeddingDims();
    const providerOpts = this.buildEmbedProviderOptions(dims, options);
    const response = await embed({
      model: this.embeddingModel(options),
      value: text,
      maxRetries: EMBED_MAX_RETRIES,
      ...(options.timeoutMs ? { abortSignal: AbortSignal.timeout(options.timeoutMs) } : {}),
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

  async embedMany(texts: string[], options: EmbedCallOptions = {}): Promise<number[][]> {
    if (texts.length === 0) return [];
    const dims = options.dims ?? resolveEmbeddingDims();
    const providerOpts = this.buildEmbedProviderOptions(dims, options);
    const response = await aiEmbedMany({
      model: this.embeddingModel(options),
      values: texts,
      maxRetries: EMBED_MAX_RETRIES,
      ...(options.timeoutMs ? { abortSignal: AbortSignal.timeout(options.timeoutMs) } : {}),
      providerOptions: { [PROVIDER_NAME]: providerOpts as Record<string, never> },
    });
    const vectors = response.embeddings;
    if (!Array.isArray(vectors) || vectors.length !== texts.length) {
      throw new Error(`embedding server returned ${vectors?.length ?? 0} of ${texts.length} vectors`);
    }
    for (const vector of vectors) {
      if (!Array.isArray(vector) || vector.length === 0) {
        throw new Error('embedding server returned no values');
      }
      if (vector.length !== dims) {
        throw new EmbeddingDimensionMismatchError(dims, vector.length);
      }
    }
    return vectors;
  }

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
