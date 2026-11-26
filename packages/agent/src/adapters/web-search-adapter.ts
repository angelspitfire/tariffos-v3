import {
  webSearchLimit,
  webSearchParallelModel,
  webSearchProvider,
  webSearchTimeoutMs,
  type WebSearchKind,
} from '@tariffos/env';
import {
  searchParallelFast,
  type ParallelSearchOptions,
  type ParallelSearchResponse,
} from './parallel-web-search.js';

const MAX_FORMATTED_CHARS = 1500;

interface SearchItem {
  title?: string;
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

function extractItems(kind: Exclude<WebSearchKind, 'parallel'>, payload: unknown): SearchItem[] {
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;
  const rawList = kind === 'serper' ? record.organic : record.results;
  if (!Array.isArray(rawList)) return [];
  return rawList.filter((item): item is SearchItem => Boolean(item && typeof item === 'object'));
}

function formatSearchItems(items: SearchItem[], limit: number): string | null {
  const lines: string[] = [];
  for (const item of items.slice(0, limit)) {
    const title = typeof item.title === 'string' ? item.title.trim() : '';
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
    lines.push(title && snippet ? `- ${title}: ${snippet}` : `- ${title || snippet}`);
  }

  if (lines.length === 0) return null;
  const joined = lines.join('\n');
  return joined.length > MAX_FORMATTED_CHARS
    ? `${joined.slice(0, MAX_FORMATTED_CHARS - 3)}...`
    : joined;
}

/**
 * Creates a fail-closed web specs fetcher honoring `WEB_SEARCH_PROVIDER`
 * (`parallel`, `serper`, or `context`), returning `null` cleanly when unconfigured or on errors.
 */
export function createWebSpecsFetcher(
  fetchImpl: typeof fetch = fetch,
  parallelSearch: ParallelSearchFn = searchParallelFast,
): (query: string) => Promise<string | null> {
  return async (query: string): Promise<string | null> => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return null;

    let provider: ReturnType<typeof webSearchProvider>;
    try {
      provider = webSearchProvider();
    } catch {
      return null;
    }

    if (!provider?.apiKey) {
      return null;
    }

    const limit = webSearchLimit();
    const timeoutMs = webSearchTimeoutMs();

    if (provider.kind === 'parallel') {
      const result = await parallelSearch(trimmedQuery, {
        limit,
        timeoutMs,
        modelId: webSearchParallelModel(),
      });
      return result.formattedSummary;
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
      if (!response.ok) return null;
      const json: unknown = await response.json();
      const items = extractItems(provider.kind, json);
      return formatSearchItems(items, limit);
    } catch {
      return null;
    }
  };
}

/** Env-configured web grounding adapter for `PipelinePorts.fetchWebSpecs`. */
export const fetchWebSpecsFromEnv = createWebSpecsFetcher();
