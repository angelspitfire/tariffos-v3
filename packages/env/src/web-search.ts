/**
 * Web-search provider selection (ADR-P4).
 *
 * `WEB_SEARCH_PROVIDER` names the **single** engine this deployment uses:
 * `serper` or `context` (Context.dev). Unset means no engine: callers
 * degrade explicitly, never to a second provider. Which engine to use is
 * a deployment decision — this module only resolves the choice.
 *
 * Variables:
 *   WEB_SEARCH_PROVIDER=serper|context
 *   WEB_SEARCH_<KIND>_BASE_URL   endpoint override
 *   WEB_SEARCH_<KIND>_API_KEY    credential
 *   WEB_SEARCH_LIMIT             results per query
 *   WEB_SEARCH_TIMEOUT_MS        per-call ceiling
 *
 * Conventional key aliases are honored: `SERPER_API_KEY`,
 * `CONTEXT_DEV_API_KEY`. Values are read at call time, never cached.
 */

export type WebSearchKind = 'serper' | 'context';

export interface WebSearchProviderConfig {
  kind: WebSearchKind;
  /** Resolved endpoint; providers never invent their own default. */
  baseUrl: string;
  apiKey?: string;
}

/** Results requested per query when the caller does not pass `limit`. */
export const DEFAULT_WEB_SEARCH_LIMIT = 5;

/** Per-call ceiling when the caller does not pass `timeoutMs`. */
export const DEFAULT_WEB_SEARCH_TIMEOUT_MS = 8_000;

const KNOWN_KINDS: readonly WebSearchKind[] = ['serper', 'context'];

const KIND_ALIASES: Record<string, WebSearchKind> = {
  serper: 'serper',
  context: 'context',
  'context.dev': 'context',
  contextdev: 'context',
};

const DEFAULT_BASE_URL: Record<WebSearchKind, string> = {
  serper: 'https://google.serper.dev/search',
  context: 'https://api.context.dev/v1/web/search',
};

const CONVENTIONAL_API_KEY: Record<WebSearchKind, string> = {
  serper: 'SERPER_API_KEY',
  context: 'CONTEXT_DEV_API_KEY',
};

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/** `context.dev` → `CONTEXT_DEV`; matches how operators name variables. */
function envName(kind: string): string {
  return kind.replace(/[^a-z0-9]+/gi, '_').toUpperCase();
}

function resolveKind(raw: string): WebSearchKind {
  const key = raw.trim().toLowerCase();
  const kind = KIND_ALIASES[key];
  if (!kind) {
    throw new Error(
      `WEB_SEARCH_PROVIDER must be ${KNOWN_KINDS.join(' | ')} (got "${raw}").`,
    );
  }
  return kind;
}

/**
 * The engine selected for this deployment, or `null` when
 * `WEB_SEARCH_PROVIDER` is unset (callers run un-grounded, explicitly).
 */
export function webSearchProvider(): WebSearchProviderConfig | null {
  const raw = read('WEB_SEARCH_PROVIDER');
  if (!raw) return null;

  const kind = resolveKind(raw);
  const scoped = `WEB_SEARCH_${envName(kind)}`;
  return {
    kind,
    baseUrl: read(`${scoped}_BASE_URL`) ?? DEFAULT_BASE_URL[kind],
    apiKey: read(`${scoped}_API_KEY`) ?? read(CONVENTIONAL_API_KEY[kind]),
  };
}

function positiveInt(name: string, fallback: number): number {
  const raw = read(name);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0 || String(parsed) !== raw) {
    throw new Error(`${name} must be a positive integer (got "${raw}").`);
  }
  return parsed;
}

/** Results per query; `WEB_SEARCH_LIMIT` overrides the shared default. */
export function webSearchLimit(): number {
  return positiveInt('WEB_SEARCH_LIMIT', DEFAULT_WEB_SEARCH_LIMIT);
}

/** Per-call timeout; `WEB_SEARCH_TIMEOUT_MS` overrides the shared default. */
export function webSearchTimeoutMs(): number {
  return positiveInt('WEB_SEARCH_TIMEOUT_MS', DEFAULT_WEB_SEARCH_TIMEOUT_MS);
}
