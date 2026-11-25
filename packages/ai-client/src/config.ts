/**
 * Provider and model resolution for @tariffos/ai-client (F0).
 *
 * Every variable is read from `@tariffos/env`, so the workspace has exactly
 * one definition of each one. This module used to resolve the provider on
 * its own, while `packages/env`'s union still carried the retired provider
 * — a switch over it could not be exhaustive either way (TS2366 without
 * the case, TS2678 with it).
 *
 * That is resolved: the port serves OpenAI-compatible endpoints only, and
 * the resolver below delegates.
 */
import {
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_EMBEDDING_DIMS,
  DEFAULT_MODEL,
  DEFAULT_LLM_PROVIDER,
  embeddingDims,
  embeddingModel,
  llmApiKey,
  llmBaseUrl,
  llmModel,
  llmProvider,
  type LlmProvider,
} from '@tariffos/env';

/** Providers the canonical port can serve. The migration is absolute. */
export type { LlmProvider } from '@tariffos/env';

export { DEFAULT_EMBEDDING_MODEL, DEFAULT_EMBEDDING_DIMS, DEFAULT_MODEL, DEFAULT_LLM_PROVIDER };

/** Where OpenRouter serves its OpenAI-compatible API. */
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

/**
 * Resolve the provider from `LLM_PROVIDER`.
 *
 * Delegates to `@tariffos/env`, which rejects an unknown value — the
 * retired provider included — with a message naming the valid ones. A
 * deployment still configured for it has to hear about it rather than be
 * silently switched to a different provider.
 */
export function resolveProvider(): LlmProvider {
  return llmProvider();
}

/** Base URL of the endpoint the provider is served from. */
export function resolveBaseUrl(): string {
  if (llmProvider() === 'openrouter') {
    return process.env.OPENROUTER_BASE_URL?.trim() || OPENROUTER_BASE_URL;
  }
  const baseUrl = llmBaseUrl();
  if (!baseUrl) {
    throw new Error(
      'openai-compatible provider requires LLM_BASE_URL (e.g. http://127.0.0.1:11434/v1)',
    );
  }
  return baseUrl;
}

/** Credential for the selected provider. */
export function resolveApiKey(): string | undefined {
  const key = llmApiKey();
  if (key) return key;
  if (llmProvider() === 'openrouter') {
    return process.env.OPENROUTER_API_KEY?.trim() || undefined;
  }
  return undefined;
}

/** Model for text generation. */
export function resolveModel(): string {
  return llmModel();
}

/** Model for embeddings. */
export function resolveEmbeddingModel(): string {
  return embeddingModel();
}

/** Width of the embedding vectors. */
export function resolveEmbeddingDims(): number {
  return embeddingDims();
}

/**
 * Base URL of the files endpoint, when the provider has one.
 *
 * Defaults to the generation base URL: OpenAI-compatible servers expose
 * `/files` beside `/chat/completions`.
 */
export function resolveFilesBaseUrl(): string {
  return resolveBaseUrl();
}

/**
 * Requests per minute allowed before pacing kicks in.
 *
 * 0 (or absent) disables pacing, which is the production default. The
 * mechanism exists because every retry of a rate-limited call spends another
 * slot of the same quota.
 */
export function resolveMaxRpm(): number {
  const raw = Number(process.env.LLM_MAX_RPM);
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}
