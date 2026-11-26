/**
 * Provider-agnostic AI configuration (ADR-02, "proveedor de IA por puerto").
 *
 * `LLM_PROVIDER` selects which endpoint the canonical port talks to; the
 * resolvers below are the only place the workspace reads those variables.
 * All values are read at call time, never cached, so tests can stub the
 * environment without a restart.
 *
 * The port serves OpenAI-compatible endpoints only. A deployment still
 * configured for the retired provider gets an error rather than a silent
 * switch to a different one — a silent switch would send traffic somewhere
 * the operator did not choose.
 */
export type LlmProvider = 'openrouter' | 'openai-compatible' | 'nvidia' | 'google';

/** Reasoning model for the standard RGI pass (Nemotron 3.5 Super VL, 12B active). */
export const DEFAULT_RGI_MODEL = 'nvidia/nemotron-3.5-super-vl-120b-a12b';

/** Reasoning model for deep mode (Nemotron 3 Ultra, 55B active). */
export const DEFAULT_RGI_DEEP_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b';

/** The provider used when `LLM_PROVIDER` is unset. */
export const DEFAULT_LLM_PROVIDER: LlmProvider = 'openai-compatible';

/**
 * Fallback text model: only consulted when LLM_MODEL is unset.
 *
 * Resolved per deployment — one variable moves the whole workspace
 * between a local model and a hosted one.
 */
export const DEFAULT_MODEL = 'gpt-4o-mini';

/** Fallback embedding model: only consulted when EMBEDDING_MODEL is unset. */
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';

/** The tariff index stores vectors truncated to this dimensionality (MRL). */
export const DEFAULT_EMBEDDING_DIMS = 768;

function trimmed(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/**
 * '' | whitespace | unset → default. Anything else is a typo → fail fast.
 *
 * The retired provider name is rejected on purpose: the port does not
 * serve it, and a deployment pointing at it has to hear about it.
 */
export function llmProvider(): LlmProvider {
  const raw = trimmed('LLM_PROVIDER');
  if (!raw) return DEFAULT_LLM_PROVIDER;
  if (raw === 'openrouter') return 'openrouter';
  if (raw === 'openai-compatible') return 'openai-compatible';
  if (raw === 'nvidia') return 'nvidia';
  if (raw === 'google') return 'google';
  throw new Error(
    `LLM_PROVIDER must be 'openrouter' | 'openai-compatible' | 'nvidia' | 'google' (got "${raw}"). ` +
      `The retired provider was removed from the workspace.`,
  );
}

/** Where generation calls POST. Undefined means "provider-native endpoint". */
export function llmBaseUrl(): string | undefined {
  return trimmed('LLM_BASE_URL');
}

/** API key for the selected provider. */
export function llmApiKey(): string | undefined {
  return trimmed('LLM_API_KEY');
}

/**
 * Text model.
 *
 * `LLM_MODEL` decides it. The retired model variable no longer falls
 * back: it would send a retired model id to an endpoint that has no such
 * model, and the failure looks like a bad request rather than a stale
 * variable.
 */
export function llmModel(): string {
  return trimmed('LLM_MODEL') ?? DEFAULT_MODEL;
}

/**
 * Model for the Tier 2 RGI reasoning pass.
 *
 * Standard: `RGI_MODEL`. Deep mode: `RGI_DEEP_MODEL`, then `RGI_MODEL`, then
 * the Ultra default. Independent of `LLM_MODEL` so the chat model and the
 * classification model can move separately.
 */
export function rgiModel(deep: boolean): string {
  const standard = trimmed('RGI_MODEL');
  if (!deep) return standard ?? DEFAULT_RGI_MODEL;
  return trimmed('RGI_DEEP_MODEL') ?? standard ?? DEFAULT_RGI_DEEP_MODEL;
}

/** Vision model for multimodal parsing; VISION_MODEL overrides the text model. */
export function visionModel(): string {
  return trimmed('VISION_MODEL') ?? llmModel();
}

/** Base URL for embeddings; falls back to llmBaseUrl() (same host serves both). */
export function embeddingBaseUrl(): string | undefined {
  return trimmed('EMBEDDING_BASE_URL') ?? llmBaseUrl();
}

/** Embedding model; falls back to the column's stored default. */
export function embeddingModel(): string {
  return trimmed('EMBEDDING_MODEL') ?? DEFAULT_EMBEDDING_MODEL;
}

/** Vector dimensionality for the tariff index (positive integer, no default caps). */
export function embeddingDims(): number {
  const raw = trimmed('EMBEDDING_DIMS');
  if (!raw) return DEFAULT_EMBEDDING_DIMS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`EMBEDDING_DIMS must be a positive integer (got "${raw}").`);
  }
  return parsed;
}

export interface EnvRequirement {
  /** Primary variable name. */
  name: string;
  /** Alternative names — any one of the group satisfies the requirement. */
  altNames?: string[];
  /** Only enforced when this returns true. */
  when?: () => boolean;
  /** Shown next to the name in the error (e.g. "required in production"). */
  note?: string;
}

/** Names of required variables that are currently unset or blank. */
export function missingEnv(requirements: EnvRequirement[]): string[] {
  const missing: string[] = [];
  for (const r of requirements) {
    if (r.when && !r.when()) continue;
    const names = [r.name, ...(r.altNames ?? [])];
    if (!names.some((n) => (process.env[n] ?? '').trim())) missing.push(r.name);
  }
  return missing;
}

/**
 * Fail fast at boot: throws one error listing every missing key, so a
 * misconfigured deploy says what to set instead of dying on the first
 * route that touches the absent variable.
 */
export function assertEnv(app: string, requirements: EnvRequirement[]): string[] {
  const missing = missingEnv(requirements);
  if (missing.length === 0) return [];
  const detail = requirements
    .filter((r) => missing.includes(r.name))
    .map((r) => {
      const group = r.altNames?.length ? `${r.name} (or ${r.altNames.join(', ')})` : r.name;
      return r.note ? `${group} — ${r.note}` : group;
    })
    .join('; ');
  throw new Error(
    `[${app}] missing required environment variables: ${detail}. See .env.example.`,
  );
}

/**
 * True when boot checks should run. Never under vitest (unit tests stub the
 * environment) and never during `next build` (NEXT_PHASE is set while Next
 * compiles; the check belongs to the server boot that follows).
 */
export function shouldValidateEnv(): boolean {
  if (process.env.VITEST) return false;
  if (process.env.NEXT_PHASE === 'phase-production-build') return false;
  return true;
}

export {
  DEFAULT_WEB_SEARCH_LIMIT,
  DEFAULT_WEB_SEARCH_TIMEOUT_MS,
  webSearchLimit,
  webSearchProvider,
  webSearchTimeoutMs,
  type WebSearchKind,
  type WebSearchProviderConfig,
} from './web-search.js';
