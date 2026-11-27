import {
  webSearchLimit,
  webSearchParallelModel,
  webSearchProvider,
  webSearchTimeoutMs,
  type WebSearchKind,
} from '@tariffos/env';
import {
  formatSearchExcerpts,
  searchParallelFast,
  type ParallelSearchItem,
  type ParallelSearchOptions,
  type ParallelSearchResponse,
} from './parallel-web-search.js';

export type WebSearchResultItem = ParallelSearchItem;

export interface WebSearchResponse {
  query: string;
  provider: WebSearchKind | 'none';
  results: WebSearchResultItem[];
  formattedSummary: string | null;
}

interface RawSearchItem {
  title?: string;
  url?: string;
  link?: string;
  snippet?: string;
  content?: string;
  description?: string;
}

type ParallelSearchFn = (
  query: string,
  options?: ParallelSearchOptions,
) => Promise<ParallelSearchResponse>;

function buildRequestSpec(
  kind: Exclude<WebSearchKind, 'parallel'>,
  apiKey: string,
  query: string,
  limit: number,
): { headers: Record<string, string>; body: string } {
  if (kind === 'serper') {
    return {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({ q: query, num: limit }),
    };
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, limit }),
  };
}

function normalizeHttpItems(
  kind: Exclude<WebSearchKind, 'parallel'>,
  payload: unknown,
): WebSearchResultItem[] {
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;
  const rawList = kind === 'serper' ? record.organic : record.results;
  if (!Array.isArray(rawList)) return [];

  const normalized: WebSearchResultItem[] = [];
  for (const entry of rawList) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as RawSearchItem;
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const url =
      typeof item.url === 'string'
        ? item.url.trim()
        : typeof item.link === 'string'
          ? item.link.trim()
          : '';
    const snippetSource =
      typeof item.snippet === 'string'
        ? item.snippet
        : typeof item.content === 'string'
          ? item.content
          : typeof item.description === 'string'
            ? item.description
            : '';
    const snippet = snippetSource.trim();
    if (!title && !snippet) continue;
    normalized.push({
      title,
      url,
      excerpts: snippet ? [snippet] : [],
    });
  }
  return normalized;
}

/**
 * Creates a fail-closed structured web search client honoring `WEB_SEARCH_PROVIDER`
 * (`parallel`, `serper`, or `context`) via `@tariffos/env`.
 */
export function createWebSearchClient(
  fetchImpl: typeof fetch = fetch,
  parallelSearch: ParallelSearchFn = searchParallelFast,
): (query: string, options?: { limit?: number; timeoutMs?: number }) => Promise<WebSearchResponse> {
  return async (
    query: string,
    options?: { limit?: number; timeoutMs?: number },
  ): Promise<WebSearchResponse> => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return { query, provider: 'none', results: [], formattedSummary: null };
    }

    let provider: ReturnType<typeof webSearchProvider>;
    try {
      provider = webSearchProvider();
    } catch {
      return { query: trimmedQuery, provider: 'none', results: [], formattedSummary: null };
    }

    if (!provider?.apiKey) {
      return { query: trimmedQuery, provider: 'none', results: [], formattedSummary: null };
    }

    const limit = options?.limit ?? webSearchLimit();
    const timeoutMs = options?.timeoutMs ?? webSearchTimeoutMs();

    if (provider.kind === 'parallel') {
      const result = await parallelSearch(trimmedQuery, {
        limit,
        timeoutMs,
        modelId: webSearchParallelModel(),
      });
      return {
        query: trimmedQuery,
        provider: 'parallel',
        results: result.results,
        formattedSummary: result.formattedSummary,
      };
    }

    const { headers, body } = buildRequestSpec(
      provider.kind,
      provider.apiKey,
      trimmedQuery,
      limit,
    );

    try {
      const response = await fetchImpl(provider.baseUrl, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) {
        return { query: trimmedQuery, provider: provider.kind, results: [], formattedSummary: null };
      }
      const json: unknown = await response.json();
      const results = normalizeHttpItems(provider.kind, json);
      return {
        query: trimmedQuery,
        provider: provider.kind,
        results,
        formattedSummary: formatSearchExcerpts(results, limit),
      };
    } catch {
      return { query: trimmedQuery, provider: provider.kind, results: [], formattedSummary: null };
    }
  };
}

/**
 * Creates a fail-closed web specs text fetcher honoring `WEB_SEARCH_PROVIDER`,
 * returning `null` cleanly when unconfigured or on errors.
 */
export function createWebSpecsFetcher(
  fetchImpl: typeof fetch = fetch,
  parallelSearch: ParallelSearchFn = searchParallelFast,
): (query: string) => Promise<string | null> {
  const search = createWebSearchClient(fetchImpl, parallelSearch);
  return async (query: string): Promise<string | null> => {
    const res = await search(query);
    return res.formattedSummary;
  };
}

/** Env-configured structured web search helper shared across pipeline and Eve tools. */
export const searchWebSpecs = createWebSearchClient();

/** Env-configured web grounding adapter for `PipelinePorts.fetchWebSpecs`. */
export const fetchWebSpecsFromEnv = createWebSpecsFetcher();
