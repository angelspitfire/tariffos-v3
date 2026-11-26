import { z } from 'zod';

export type InspectableLlmProvider = 'openrouter' | 'nvidia' | 'google';

export interface ProviderModelEntry {
  readonly id: string;
  readonly name: string;
  readonly provider: InspectableLlmProvider;
  readonly contextLength: number | null;
  readonly promptPerMillionUsd: number | null;
  readonly completionPerMillionUsd: number | null;
  readonly isFree: boolean;
  readonly supportsTools: boolean;
}

export interface FetchProviderModelsOptions {
  readonly provider: InspectableLlmProvider;
  readonly freeOnly?: boolean;
  readonly toolsOnly?: boolean;
  readonly search?: string;
  readonly apiKey?: string;
}

export type OpenRouterQuotaResult =
  | { readonly configured: false }
  | {
      readonly configured: true;
      readonly label: string | null;
      readonly isFreeTier: boolean;
      readonly limitUsd: number | null;
      readonly remainingUsd: number | null;
      readonly usageUsd: number;
      readonly usageDailyUsd: number | null;
      readonly usageWeeklyUsd: number | null;
      readonly usageMonthlyUsd: number | null;
      readonly rateLimit: { readonly requests: number; readonly interval: string } | null;
    };

const ONE_MILLION = 1_000_000;
const REQUEST_TIMEOUT_MS = 12_000;

const OpenRouterModelsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      context_length: z.number().nullable().optional(),
      pricing: z
        .object({
          prompt: z.union([z.string(), z.number()]).optional(),
          completion: z.union([z.string(), z.number()]).optional(),
        })
        .optional(),
      supported_parameters: z.array(z.string()).optional(),
    }),
  ),
});

const OpenAiModelsResponseSchema = z.object({ data: z.array(z.object({ id: z.string() })) });

const GoogleModelsResponseSchema = z.object({
  models: z
    .array(z.object({ name: z.string(), displayName: z.string().optional(), inputTokenLimit: z.number().optional() }))
    .default([]),
});

const OpenRouterKeyResponseSchema = z.object({
  data: z.object({
    label: z.string().nullable().optional(),
    is_free_tier: z.boolean().optional(),
    limit: z.number().nullable().optional(),
    limit_remaining: z.number().nullable().optional(),
    usage: z.number().optional(),
    usage_daily: z.number().nullable().optional(),
    usage_weekly: z.number().nullable().optional(),
    usage_monthly: z.number().nullable().optional(),
    rate_limit: z.object({ requests: z.number(), interval: z.string() }).nullable().optional(),
  }),
});

function parsePricePerMillion(raw: string | number | undefined): number | null {
  if (raw === undefined) return null;
  const parsed = typeof raw === 'number' ? raw : Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Number((parsed * ONE_MILLION).toFixed(4));
}

function applyFilters(
  models: ProviderModelEntry[],
  opts: FetchProviderModelsOptions,
): ProviderModelEntry[] {
  const term = opts.search?.trim().toLowerCase() ?? '';
  return models
    .filter((m) => (!opts.freeOnly || m.isFree))
    .filter((m) => (!opts.toolsOnly || m.supportsTools))
    .filter((m) => (!term || m.id.toLowerCase().includes(term) || m.name.toLowerCase().includes(term)))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function fetchProviderModels(
  opts: FetchProviderModelsOptions,
  fetchImpl: typeof fetch = fetch,
): Promise<ProviderModelEntry[]> {
  if (opts.provider === 'openrouter') {
    const res = await fetchImpl('https://openrouter.ai/api/v1/models', {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`OpenRouter /models HTTP ${res.status}`);
    const parsed = OpenRouterModelsResponseSchema.parse(await res.json());
    const entries: ProviderModelEntry[] = parsed.data.map((m) => {
      const promptUsd = parsePricePerMillion(m.pricing?.prompt);
      const completionUsd = parsePricePerMillion(m.pricing?.completion);
      const isFree =
        m.id.endsWith(':free') || (promptUsd === 0 && completionUsd === 0);
      return {
        id: m.id,
        name: m.name ?? m.id,
        provider: 'openrouter',
        contextLength: m.context_length ?? null,
        promptPerMillionUsd: promptUsd,
        completionPerMillionUsd: completionUsd,
        isFree,
        supportsTools: (m.supported_parameters ?? []).includes('tools'),
      };
    });
    return applyFilters(entries, opts);
  }

  if (opts.provider === 'nvidia') {
    const key = opts.apiKey ?? process.env.NVIDIA_API_KEY?.trim() ?? '';
    const res = await fetchImpl('https://integrate.api.nvidia.com/v1/models', {
      headers: key ? { Authorization: `Bearer ${key}` } : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`NVIDIA Build /models HTTP ${res.status}`);
    const parsed = OpenAiModelsResponseSchema.parse(await res.json());
    const entries: ProviderModelEntry[] = parsed.data.map((m) => ({
      id: m.id,
      name: m.id,
      provider: 'nvidia',
      contextLength: null,
      promptPerMillionUsd: null,
      completionPerMillionUsd: null,
      isFree: false,
      supportsTools: true,
    }));
    return applyFilters(entries, opts);
  }

  const key = opts.apiKey ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ?? '';
  if (!key) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is required to list Google AI models');
  const res = await fetchImpl(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
    { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
  );
  if (!res.ok) throw new Error(`Google AI /models HTTP ${res.status}`);
  const parsed = GoogleModelsResponseSchema.parse(await res.json());
  const entries: ProviderModelEntry[] = parsed.models.map((m) => ({
    id: m.name.replace(/^models\//, ''),
    name: m.displayName ?? m.name,
    provider: 'google',
    contextLength: m.inputTokenLimit ?? null,
    promptPerMillionUsd: null,
    completionPerMillionUsd: null,
    isFree: false,
    supportsTools: true,
  }));
  return applyFilters(entries, opts);
}

export async function fetchOpenRouterQuota(
  apiKey: string | undefined = process.env.OPENROUTER_API_KEY,
  fetchImpl: typeof fetch = fetch,
): Promise<OpenRouterQuotaResult> {
  const trimmed = apiKey?.trim();
  if (!trimmed) {
    return { configured: false };
  }

  const res = await fetchImpl('https://openrouter.ai/api/v1/auth/key', {
    headers: { Authorization: `Bearer ${trimmed}` },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter /auth/key HTTP ${res.status}`);
  }
  const parsed = OpenRouterKeyResponseSchema.parse(await res.json());
  const d = parsed.data;
  return {
    configured: true,
    label: d.label ?? null,
    isFreeTier: Boolean(d.is_free_tier),
    limitUsd: d.limit ?? null,
    remainingUsd: d.limit_remaining ?? null,
    usageUsd: d.usage ?? 0,
    usageDailyUsd: d.usage_daily ?? null,
    usageWeeklyUsd: d.usage_weekly ?? null,
    usageMonthlyUsd: d.usage_monthly ?? null,
    rateLimit: d.rate_limit ?? null,
  };
}
