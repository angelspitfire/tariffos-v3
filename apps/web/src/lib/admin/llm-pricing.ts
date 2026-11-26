export interface ModelTokenRates {
  inputPerMillionUsd: number;
  outputPerMillionUsd: number;
}

const DEFAULT_FALLBACK_RATES: ModelTokenRates = {
  inputPerMillionUsd: 0.15,
  outputPerMillionUsd: 0.47,
};

/** USD rates per 1M tokens aligned with docs/LLM_MODELS_CATALOG.md. */
const MODEL_RATES_USD: Record<string, ModelTokenRates> = {
  'nvidia/nemotron-3.5-super-vl': { inputPerMillionUsd: 0.15, outputPerMillionUsd: 0.47 },
  'nvidia/nemotron-3.5-super-vl-120b-a12b': { inputPerMillionUsd: 0.15, outputPerMillionUsd: 0.47 },
  'nvidia/nemotron-3.5-super-vl:free': { inputPerMillionUsd: 0, outputPerMillionUsd: 0 },
  'nvidia/nemotron-3.5-lightning': { inputPerMillionUsd: 0.07, outputPerMillionUsd: 0.2 },
  'nvidia/nemotron-3.5-lightning:free': { inputPerMillionUsd: 0, outputPerMillionUsd: 0 },
  'nvidia/nemotron-3-ultra-550b-a55b': { inputPerMillionUsd: 0.5, outputPerMillionUsd: 2.2 },
  'nvidia/nemotron-3-ultra-550b-a55b:free': { inputPerMillionUsd: 0, outputPerMillionUsd: 0 },
  'google/gemini-2.5-flash': { inputPerMillionUsd: 0.3, outputPerMillionUsd: 2.5 },
  'gemini-2.5-flash': { inputPerMillionUsd: 0.3, outputPerMillionUsd: 2.5 },
  'google/gemini-2.5-pro': { inputPerMillionUsd: 1.25, outputPerMillionUsd: 10.0 },
  'gemini-2.5-pro': { inputPerMillionUsd: 1.25, outputPerMillionUsd: 10.0 },
  'deepseek/deepseek-v3.2': { inputPerMillionUsd: 0.26, outputPerMillionUsd: 0.38 },
  'qwen/qwen3-235b-a22b-2507': { inputPerMillionUsd: 0.14, outputPerMillionUsd: 0.8 },
  'moonshotai/kimi-k2.5': { inputPerMillionUsd: 0.5, outputPerMillionUsd: 2.5 },
  'anthropic/claude-sonnet-4.6': { inputPerMillionUsd: 3.0, outputPerMillionUsd: 15.0 },
  'openai/gpt-4.1-mini': { inputPerMillionUsd: 0.4, outputPerMillionUsd: 1.6 },
};

export function resolveModelTokenRates(modelId: string | null | undefined): ModelTokenRates {
  if (!modelId) return DEFAULT_FALLBACK_RATES;
  const normalized = modelId.trim();
  return MODEL_RATES_USD[normalized] ?? DEFAULT_FALLBACK_RATES;
}

export function estimateTokenCostUsd(
  modelId: string | null | undefined,
  inputTokens: number,
  outputTokens: number,
): number {
  const rates = resolveModelTokenRates(modelId);
  const safeIn = Math.max(0, inputTokens);
  const safeOut = Math.max(0, outputTokens);
  const total =
    (safeIn / 1_000_000) * rates.inputPerMillionUsd +
    (safeOut / 1_000_000) * rates.outputPerMillionUsd;
  return Number(total.toFixed(6));
}

export function computeAvgTokensPerClassification(
  inputTokens: number,
  outputTokens: number,
  used: number,
): number {
  if (used <= 0) return 0;
  return Math.round((Math.max(0, inputTokens) + Math.max(0, outputTokens)) / used);
}