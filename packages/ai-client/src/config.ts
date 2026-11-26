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

/** NVIDIA Build (NIM) OpenAI-compatible endpoint: the Nemotron family. */
export const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

/** Gemini API's OpenAI-compatible endpoint (same adapter, no extra SDK). */
export const GOOGLE_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';

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

export interface LlmProviderAvailability {
  provider: LlmProvider;
  configured: boolean;
  envVar: string;
  defaultBaseUrl: string | null;
}

const ALL_LLM_PROVIDERS: readonly LlmProvider[] = [
  'nvidia',
  'google',
  'openrouter',
  'openai-compatible',
];

function currentEnvProviderOrNull(): LlmProvider | null {
  try {
    return llmProvider();
  } catch {
    return null;
  }
}

/** Base URL for a specific provider, optionally overridden at runtime. */
export function resolveBaseUrlForProvider(
  provider: LlmProvider,
  overrideBaseUrl?: string,
): string {
  const explicit = overrideBaseUrl?.trim();
  if (explicit) return explicit;
  if (provider === 'openrouter') {
    return process.env.OPENROUTER_BASE_URL?.trim() || OPENROUTER_BASE_URL;
  }
  const envBaseUrl = currentEnvProviderOrNull() === provider ? llmBaseUrl() : undefined;
  if (envBaseUrl) return envBaseUrl;
  if (provider === 'nvidia') return NVIDIA_BASE_URL;
  if (provider === 'google') return GOOGLE_BASE_URL;
  const fallbackBaseUrl = llmBaseUrl();
  if (fallbackBaseUrl) return fallbackBaseUrl;
  throw new Error(
    'openai-compatible provider requires LLM_BASE_URL (e.g. http://127.0.0.1:11434/v1)',
  );
}

/** Base URL of the endpoint the provider is served from. */
export function resolveBaseUrl(): string {
  return resolveBaseUrlForProvider(llmProvider());
}

/** Credential for a specific provider (never falls back across unrelated providers). */
export function resolveApiKeyForProvider(provider: LlmProvider): string | undefined {
  const isEnvMatch = currentEnvProviderOrNull() === provider;
  const genericKey = llmApiKey();
  if (isEnvMatch && genericKey) return genericKey;
  if (provider === 'openrouter') return process.env.OPENROUTER_API_KEY?.trim() || undefined;
  if (provider === 'nvidia') return process.env.NVIDIA_API_KEY?.trim() || undefined;
  if (provider === 'google') return process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() || undefined;
  return genericKey;
}

/** Credential for the selected provider. */
export function resolveApiKey(): string | undefined {
  return resolveApiKeyForProvider(llmProvider());
}

/** True when a specific provider has enough configuration for live calls. */
export function canRunLiveLlmForProvider(
  provider: LlmProvider,
  overrideBaseUrl?: string,
): boolean {
  if (provider === 'openai-compatible') {
    return Boolean(overrideBaseUrl?.trim() || llmBaseUrl());
  }
  return Boolean(resolveApiKeyForProvider(provider));
}

/** Lists every supported provider and whether server env credentials are ready. */
export function listConfiguredLlmProviders(): LlmProviderAvailability[] {
  const meta: Record<LlmProvider, { envVar: string; defaultBaseUrl: string | null }> = {
    nvidia: { envVar: 'NVIDIA_API_KEY', defaultBaseUrl: NVIDIA_BASE_URL },
    google: { envVar: 'GOOGLE_GENERATIVE_AI_API_KEY', defaultBaseUrl: GOOGLE_BASE_URL },
    openrouter: { envVar: 'OPENROUTER_API_KEY', defaultBaseUrl: OPENROUTER_BASE_URL },
    'openai-compatible': { envVar: 'LLM_BASE_URL', defaultBaseUrl: null },
  };
  return ALL_LLM_PROVIDERS.map((provider) => ({
    provider,
    configured: canRunLiveLlmForProvider(provider),
    envVar: meta[provider].envVar,
    defaultBaseUrl: meta[provider].defaultBaseUrl,
  }));
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
 * True when the active `LLM_PROVIDER` has enough configuration to run live
 * model calls without falling back or failing on missing credentials.
 */
export function canRunLiveLlm(): boolean {
  let provider: LlmProvider;
  try {
    provider = llmProvider();
  } catch {
    return false;
  }
  if (provider === 'openai-compatible') {
    return Boolean(llmBaseUrl());
  }
  return Boolean(resolveApiKey());
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
