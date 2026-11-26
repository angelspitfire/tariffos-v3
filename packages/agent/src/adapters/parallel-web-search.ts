import { createGateway, gateway, generateText } from 'ai';
import {
  DEFAULT_WEB_SEARCH_LIMIT,
  DEFAULT_WEB_SEARCH_TIMEOUT_MS,
  webSearchParallelModel,
} from '@tariffos/env';

const MAX_FORMATTED_CHARS = 1500;
const MAX_TOTAL_EXCERPT_CHARS = 1800;
const MAX_PER_RESULT_EXCERPT_CHARS = 500;
const MAX_TOOL_OUTPUT_TOKENS = 64;

export interface ParallelSearchItem {
  title: string;
  url: string;
  excerpts: string[];
  publishDate?: string | null;
}

export interface ParallelSearchResponse {
  query: string;
  results: ParallelSearchItem[];
  formattedSummary: string | null;
}

export interface ParallelSearchExecutorParams {
  query: string;
  limit: number;
  timeoutMs: number;
  modelId: string;
}

export type ParallelSearchExecutor = (
  params: ParallelSearchExecutorParams,
) => Promise<ParallelSearchItem[]>;

export interface ParallelSearchOptions {
  limit?: number;
  timeoutMs?: number;
  modelId?: string;
  executor?: ParallelSearchExecutor;
}

function readGatewayApiKey(): string | undefined {
  const scoped = process.env.WEB_SEARCH_PARALLEL_API_KEY?.trim();
  if (scoped) return scoped;
  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim();
  if (gatewayKey) return gatewayKey;
  const oidc = process.env.VERCEL_OIDC_TOKEN?.trim();
  return oidc || undefined;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function parseParallelItem(raw: unknown): ParallelSearchItem | null {
  const entry = toRecord(raw);
  if (!entry) return null;
  const url = typeof entry.url === 'string' ? entry.url.trim() : '';
  const title = typeof entry.title === 'string' ? entry.title.trim() : '';
  const excerpts = Array.isArray(entry.excerpts)
    ? entry.excerpts.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
  const publishDate = typeof entry.publish_date === 'string' ? entry.publish_date : null;
  if (!url && !title && excerpts.length === 0) return null;
  return { title, url, excerpts, publishDate };
}

/** Extracts normalized search items from AI SDK `generateText` `toolResults`. */
export function extractParallelResultsFromToolResults(
  toolResults: readonly unknown[],
): ParallelSearchItem[] {
  const items: ParallelSearchItem[] = [];
  for (const part of toolResults) {
    const record = toRecord(part);
    if (!record) continue;
    const payload = toRecord(record.output) ?? toRecord(record.result);
    if (!payload || !Array.isArray(payload.results)) continue;
    for (const rawItem of payload.results) {
      const parsed = parseParallelItem(rawItem);
      if (parsed) items.push(parsed);
    }
  }
  return items;
}

/** Formats Parallel Search excerpts into a concise bullet summary capped at 1500 chars. */
export function formatParallelItems(
  items: readonly ParallelSearchItem[],
  limit: number = DEFAULT_WEB_SEARCH_LIMIT,
): string | null {
  const lines: string[] = [];
  for (const item of items.slice(0, limit)) {
    const title = item.title.trim();
    const firstExcerpt = item.excerpts.find((excerpt) => excerpt.trim().length > 0)?.trim() ?? '';
    if (!title && !firstExcerpt) continue;
    lines.push(title && firstExcerpt ? `- ${title}: ${firstExcerpt}` : `- ${title || firstExcerpt}`);
  }
  if (lines.length === 0) return null;
  const joined = lines.join('\n');
  return joined.length > MAX_FORMATTED_CHARS
    ? `${joined.slice(0, MAX_FORMATTED_CHARS - 3)}...`
    : joined;
}

async function defaultParallelExecutor(
  params: ParallelSearchExecutorParams,
): Promise<ParallelSearchItem[]> {
  const credential = readGatewayApiKey();
  if (!credential) return [];

  const gw = process.env.WEB_SEARCH_PARALLEL_API_KEY?.trim()
    ? createGateway({ apiKey: process.env.WEB_SEARCH_PARALLEL_API_KEY.trim() })
    : gateway;

  const result = await generateText({
    model: gw(params.modelId),
    prompt: `Find technical specifications and commercial product details for customs tariff classification: ${params.query}`,
    tools: {
      parallel_search: gw.tools.parallelSearch({
        mode: 'fast',
        maxResults: params.limit,
        maxCharsTotal: MAX_TOTAL_EXCERPT_CHARS,
        excerpts: { maxCharsPerResult: MAX_PER_RESULT_EXCERPT_CHARS },
      }),
    },
    toolChoice: { type: 'tool', toolName: 'parallel_search' },
    maxOutputTokens: MAX_TOOL_OUTPUT_TOKENS,
    abortSignal: AbortSignal.timeout(params.timeoutMs),
  });

  const extracted = extractParallelResultsFromToolResults(result.toolResults);
  if (extracted.length > 0) return extracted;
  const fallbackText = result.text.trim();
  return fallbackText ? [{ title: 'Resumen web', url: '', excerpts: [fallbackText] }] : [];
}

/**
 * Executes a fail-closed web search via Vercel AI Gateway Parallel Search (`mode: 'fast'`).
 * Never throws; degrades cleanly to an empty result when credentials or gateway are unavailable.
 */
export async function searchParallelFast(
  query: string,
  options: ParallelSearchOptions = {},
): Promise<ParallelSearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { query, results: [], formattedSummary: null };
  }

  const limit = options.limit ?? DEFAULT_WEB_SEARCH_LIMIT;
  const timeoutMs = options.timeoutMs ?? DEFAULT_WEB_SEARCH_TIMEOUT_MS;
  const modelId = options.modelId ?? webSearchParallelModel();
  const executor = options.executor ?? defaultParallelExecutor;

  try {
    const results = await executor({ query: trimmed, limit, timeoutMs, modelId });
    return {
      query: trimmed,
      results,
      formattedSummary: formatParallelItems(results, limit),
    };
  } catch {
    return { query: trimmed, results: [], formattedSummary: null };
  }
}
