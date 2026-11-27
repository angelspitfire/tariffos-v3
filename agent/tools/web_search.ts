import { defineTool } from 'eve/tools';
import { z } from 'zod';
import type { WebSearchResultItem } from '@tariffos/agent';

export const WebSearchInputSchema = z.object({
  query: z.string().trim().min(2),
  limit: z.number().int().min(1).max(10).default(5),
});

export type WebSearchInput = z.infer<typeof WebSearchInputSchema>;

type SearchExecutorFn = (
  query: string,
  options?: { limit?: number },
) => Promise<{
  query: string;
  results: WebSearchResultItem[];
  formattedSummary: string | null;
}>;

export interface EveWebSearchResult {
  query: string;
  provider: string;
  results: WebSearchResultItem[];
  summary: string | null;
}

/** Runs configured web search (`WEB_SEARCH_PROVIDER` or Vercel Parallel Fast fallback) for product specs. */
export async function executeWebSearch(
  input: WebSearchInput,
  searchFn?: SearchExecutorFn,
): Promise<EveWebSearchResult> {
  if (searchFn) {
    const response = await searchFn(input.query, { limit: input.limit });
    return {
      query: response.query,
      provider: 'vercel-parallel-fast',
      results: response.results,
      summary: response.formattedSummary,
    };
  }

  const { searchParallelFast, searchWebSpecs } = await import('@tariffos/agent');

  if (process.env.WEB_SEARCH_PROVIDER?.trim()) {
    const response = await searchWebSpecs(input.query, { limit: input.limit });
    return {
      query: response.query,
      provider: response.provider === 'parallel' ? 'vercel-parallel-fast' : response.provider,
      results: response.results,
      summary: response.formattedSummary,
    };
  }

  const response = await searchParallelFast(input.query, { limit: input.limit });
  return {
    query: response.query,
    provider: 'vercel-parallel-fast',
    results: response.results,
    summary: response.formattedSummary,
  };
}

export default defineTool({
  description:
    'Search the web via Vercel Parallel Fast to verify commercial product specifications, model numbers, datasheets, material composition, power/voltage, or technical attributes required for HS classification.',
  inputSchema: WebSearchInputSchema,
  execute: (input) => executeWebSearch(input),
});
