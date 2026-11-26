import type { EveLanguageModel } from 'eve/models';
import { anthropic } from 'eve/models/anthropic';
import { openai } from 'eve/models/openai';

export const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-5';
export const DEFAULT_OPENAI_MODEL = 'gpt-4.1';
const DEFAULT_GATEWAY_MODEL = 'anthropic/claude-sonnet-5';

export type EveProviderName = 'anthropic' | 'openai' | 'gateway';

export interface ParsedEveModelSpec {
  provider: EveProviderName;
  modelId: string;
}

const SUPPORTED_PROVIDERS: readonly EveProviderName[] = ['anthropic', 'openai', 'gateway'];

/**
 * Parse an EVE_MODEL environment specification into provider + model ID.
 * Supports:
 * - "anthropic:claude-sonnet-4" / "openai:gpt-4.1" / "gateway:anthropic/claude-sonnet-4"
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

    if (prefix === 'anthropic') {
      return { provider: 'anthropic', modelId: modelPart || DEFAULT_ANTHROPIC_MODEL };
    }
    if (prefix === 'openai') {
      return { provider: 'openai', modelId: modelPart || DEFAULT_OPENAI_MODEL };
    }
    if (prefix === 'gateway') {
      return { provider: 'gateway', modelId: modelPart || DEFAULT_GATEWAY_MODEL };
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
  return anthropic(spec.modelId);
}
