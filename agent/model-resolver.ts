import { createOpenAI } from '@ai-sdk/openai';
import { LlmRuntimeConfigSchema, type AdminLlmProvider } from '@tariffos/shared-types';
import type { EveLanguageModel } from 'eve/models';
import { anthropic } from 'eve/models/anthropic';
import { openai } from 'eve/models/openai';

export const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-5';
export const DEFAULT_OPENAI_MODEL = 'gpt-4.1';
const DEFAULT_GATEWAY_MODEL = 'anthropic/claude-sonnet-5';
export const DEFAULT_NEMOTRON_MODEL = 'nvidia/nemotron-3.5-super-vl-120b-a12b';
export const DEFAULT_OPENROUTER_NEMOTRON_MODEL = 'nvidia/nemotron-3.5-super-vl';
export const DEFAULT_GOOGLE_MODEL = 'gemini-2.5-flash';
export const DEFAULT_COMPAT_MODEL = 'gpt-4o-mini';

const LLM_RUNTIME_SETTING_KEY = 'ai.runtime_config';

export type EveProviderName =
  | 'anthropic'
  | 'openai'
  | 'gateway'
  | 'openrouter'
  | 'nvidia'
  | 'google'
  | 'openai-compatible';

export interface ParsedEveModelSpec {
  provider: EveProviderName;
  modelId: string;
}

export type EveRuntimeModelOverride = {
  provider: AdminLlmProvider;
  model: string;
  baseUrl: string | null;
};

const DEFAULT_MODEL_BY_PROVIDER: Record<EveProviderName, string> = {
  anthropic: DEFAULT_ANTHROPIC_MODEL,
  openai: DEFAULT_OPENAI_MODEL,
  gateway: DEFAULT_GATEWAY_MODEL,
  openrouter: DEFAULT_OPENROUTER_NEMOTRON_MODEL,
  nvidia: DEFAULT_NEMOTRON_MODEL,
  google: DEFAULT_GOOGLE_MODEL,
  'openai-compatible': DEFAULT_COMPAT_MODEL,
};

type FixedCompatProvider = 'openrouter' | 'nvidia' | 'google';

const OPENAI_COMPAT_ENDPOINTS: Record<
  FixedCompatProvider,
  { baseURL: string; apiKeyEnv: string }
> = {
  openrouter: { baseURL: 'https://openrouter.ai/api/v1', apiKeyEnv: 'OPENROUTER_API_KEY' },
  nvidia: { baseURL: 'https://integrate.api.nvidia.com/v1', apiKeyEnv: 'NVIDIA_API_KEY' },
  google: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKeyEnv: 'GOOGLE_GENERATIVE_AI_API_KEY',
  },
};

const SUPPORTED_PROVIDERS = Object.keys(DEFAULT_MODEL_BY_PROVIDER) as EveProviderName[];

function isEveProvider(value: string): value is EveProviderName {
  return value in DEFAULT_MODEL_BY_PROVIDER;
}

function buildCompatChatModel(
  providerName: AdminLlmProvider,
  modelId: string,
  baseUrlOverride?: string | null,
): EveLanguageModel {
  if (providerName === 'openai-compatible') {
    const baseURL = baseUrlOverride?.trim() || process.env.LLM_BASE_URL?.trim() || '';
    const provider = createOpenAI({
      name: 'openai-compatible',
      baseURL,
      apiKey: process.env.LLM_API_KEY?.trim() ?? '',
    });
    return provider.chat(modelId);
  }

  const endpoint = OPENAI_COMPAT_ENDPOINTS[providerName];
  const provider = createOpenAI({
    name: providerName,
    baseURL: baseUrlOverride?.trim() || endpoint.baseURL,
    apiKey: process.env[endpoint.apiKeyEnv]?.trim() ?? '',
  });
  return provider.chat(modelId);
}

function hasProviderCredential(provider: AdminLlmProvider, baseUrl?: string | null): boolean {
  if (provider === 'openai-compatible') {
    return Boolean(baseUrl?.trim() || process.env.LLM_BASE_URL?.trim());
  }
  return Boolean(process.env[OPENAI_COMPAT_ENDPOINTS[provider].apiKeyEnv]?.trim());
}

/**
 * Parse an EVE_MODEL environment specification into provider + model ID.
 * Supports:
 * - "anthropic:claude-sonnet-4" / "openai:gpt-4.1" / "gateway:anthropic/claude-sonnet-4"
 * - "openrouter:..." / "nvidia:..." / "google:gemini-2.5-flash" / "openai-compatible:..."
 * - "anthropic/claude-sonnet-4" (Vercel AI Gateway slash format)
 * - bare model name (defaults to Anthropic)
 */
export function parseEveModelSpec(raw: string | undefined = process.env.EVE_MODEL): ParsedEveModelSpec {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return { provider: 'anthropic', modelId: DEFAULT_ANTHROPIC_MODEL };
  }

  const colonIndex = trimmed.indexOf(':');
  if (colonIndex !== -1) {
    const prefix = trimmed.slice(0, colonIndex).trim().toLowerCase();
    const modelPart = trimmed.slice(colonIndex + 1).trim();

    if (isEveProvider(prefix)) {
      return { provider: prefix, modelId: modelPart || DEFAULT_MODEL_BY_PROVIDER[prefix] };
    }

    throw new Error(
      `Unsupported EVE_MODEL provider "${prefix}". Supported providers: ${SUPPORTED_PROVIDERS.join(', ')}.`,
    );
  }

  if (trimmed.includes('/')) {
    return { provider: 'gateway', modelId: trimmed };
  }

  return { provider: 'anthropic', modelId: trimmed };
}

/**
 * Resolve the active Eve language model from EVE_MODEL so swapping providers
 * or models requires only changing an environment variable.
 */
export function resolveEveModel(
  raw: string | undefined = process.env.EVE_MODEL,
): EveLanguageModel | string {
  const spec = parseEveModelSpec(raw);
  if (spec.provider === 'openai') {
    return openai(spec.modelId);
  }
  if (spec.provider === 'gateway') {
    return spec.modelId;
  }
  if (
    spec.provider === 'openrouter' ||
    spec.provider === 'nvidia' ||
    spec.provider === 'google' ||
    spec.provider === 'openai-compatible'
  ) {
    return buildCompatChatModel(spec.provider, spec.modelId);
  }
  return anthropic(spec.modelId);
}

/**
 * Read the admin-configured runtime LLM override from SystemSetting (`ai.runtime_config`).
 * Returns plain JSON suitable for Eve's `ctx.memo`, or null when unset/unavailable.
 */
export async function readSystemLlmRuntimeOverride(): Promise<EveRuntimeModelOverride | null> {
  if (!process.env.DATABASE_URL?.trim()) return null;

  try {
    const { prisma } = await import('@tariffos/database');
    const row = prisma.systemSetting?.findUnique
      ? await prisma.systemSetting.findUnique({ where: { key: LLM_RUNTIME_SETTING_KEY } })
      : null;
    if (!row?.value) return null;

    const parsed = LlmRuntimeConfigSchema.safeParse(JSON.parse(row.value));
    if (!parsed.success) return null;

    return {
      provider: parsed.data.provider,
      model: parsed.data.model,
      baseUrl: parsed.data.baseUrl ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Resolve Eve's active language model honoring an admin DB override when its
 * server credentials are configured, falling back seamlessly to `EVE_MODEL`.
 */
export function resolveEveModelFromOverride(
  override: EveRuntimeModelOverride | null,
  fallbackRaw: string | undefined = process.env.EVE_MODEL,
): EveLanguageModel | string {
  if (override && hasProviderCredential(override.provider, override.baseUrl)) {
    return buildCompatChatModel(override.provider, override.model, override.baseUrl);
  }
  return resolveEveModel(fallbackRaw);
}
