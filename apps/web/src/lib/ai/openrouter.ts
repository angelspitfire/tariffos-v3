/**
 * OpenRouter client configuration for the Vercel AI SDK.
 *
 * OpenRouter is an OpenAI-compatible model gateway. This module configures
 * the `@ai-sdk/openai` provider to point at OpenRouter's base URL so the
 * application can call any OpenRouter model through a single `openrouter`
 * client, using stable model aliases.
 */

import { createOpenAI, type OpenAIProvider } from '@ai-sdk/openai';

/** OpenRouter-compatible API base URL. */
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

/**
 * Configured OpenAI provider pointing at OpenRouter.
 *
 * The API key is read from `process.env.OPENROUTER_API_KEY`. When the
 * variable is unset, requests fail at call time rather than import time,
 * keeping the module importable everywhere (e.g. during typechecking).
 */
export const openrouter: OpenAIProvider = createOpenAI({
  baseURL: OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  name: 'openrouter',
});

/** Common OpenRouter model aliases. Single source of truth for model ids. */
export const MODELS = {
  /** Route to the best available model automatically. */
  AUTO: 'openrouter/auto',
  /** Anthropic Claude 3.5 Sonnet. */
  CLAUDE_3_5_SONNET: 'anthropic/claude-3.5-sonnet',
  /** OpenAI GPT-4o. */
  GPT_4O: 'openai/gpt-4o',
} as const;

export type ModelAlias = keyof typeof MODELS;
export type ModelId = (typeof MODELS)[keyof typeof MODELS];

/** Default model used when no specific model is requested. */
export const DEFAULT_MODEL: ModelId = MODELS.AUTO;

/**
 * Resolve a model alias to its OpenRouter model id.
 *
 * @param alias - a registered model alias (e.g. `ModelAlias.AUTO`)
 * @returns the OpenRouter model id to pass to `openrouter()` / `openrouter.chat()`
 */
export function getModel(alias: ModelAlias): ModelId {
  return MODELS[alias];
}
