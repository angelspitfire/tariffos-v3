import { createOpenAI } from '@ai-sdk/openai';
import type { EveLanguageModel } from 'eve/models';
import { anthropic } from 'eve/models/anthropic';
import { openai } from 'eve/models/openai';

export const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-5';
export const DEFAULT_OPENAI_MODEL = 'gpt-4.1';
const DEFAULT_GATEWAY_MODEL = 'anthropic/claude-sonnet-5';
export const DEFAULT_NEMOTRON_MODEL = 'nvidia/nemotron-3.5-super-vl-120b-a12b';

export type EveProviderName = 'anthropic' | 'openai' | 'gateway' | 'openrouter' | 'nvidia';

export interface ParsedEveModelSpec {
  provider: EveProviderName;
  modelId: string;
}

const DEFAULT_MODEL_BY_PROVIDER: Record<EveProviderName, string> = {
  anthropic: DEFAULT_ANTHROPIC_MODEL,
  openai: DEFAULT_OPENAI_MODEL,
  gateway: DEFAULT_GATEWAY_MODEL,
  openrouter: DEFAULT_NEMOTRON_MODEL,
  nvidia: DEFAULT_NEMOTRON_MODEL,
};

const OPENAI_COMPAT_ENDPOINTS: Record<
  'openrouter' | 'nvidia',
  { baseURL: string; apiKeyEnv: string }
> = {
  openrouter: { baseURL: 'https://openrouter.ai/api/v1', apiKeyEnv: 'OPENROUTER_API_KEY' },
  nvidia: { baseURL: 'https://integrate.api.nvidia.com/v1', apiKeyEnv: 'NVIDIA_API_KEY' },
};

const SUPPORTED_PROVIDERS = Object.keys(DEFAULT_MODEL_BY_PROVIDER) as EveProviderName[];

function isEveProvider(value: string): value is EveProviderName {
  return value in DEFAULT_MODEL_BY_PROVIDER;
}

/**
 * Parse an EVE_MODEL environment specification into provider + model ID.
 * Supports:
 * - "anthropic:claude-sonnet-4" / "openai:gpt-4.1" / "gateway:anthropic/claude-sonnet-4"
 * - "openrouter:nvidia/nemotron-3.5-super-vl-120b-a12b"
 * - "nvidia:nvidia/nemotron-3.5-super-vl-120b-a12b"
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
  if (spec.provider === 'openrouter' || spec.provider === 'nvidia') {
    const endpoint = OPENAI_COMPAT_ENDPOINTS[spec.provider];
    const provider = createOpenAI({
      name: spec.provider,
      baseURL: endpoint.baseURL,
      apiKey: process.env[endpoint.apiKeyEnv] ?? '',
    });
    return provider.chat(spec.modelId);
  }
  return anthropic(spec.modelId);
}
