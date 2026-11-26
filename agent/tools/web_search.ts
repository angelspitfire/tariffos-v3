import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { searchParallelFast, type ParallelSearchResponse } from '@tariffos/agent';

export const WebSearchInputSchema = z.object({
  query: z.string().trim().min(2),
  limit: z.number().int().min(1).max(10).default(5),
});

export type WebSearchInput = z.infer<typeof WebSearchInputSchema>;

type ParallelSearchFn = (
  query: string,
  options?: { limit?: number },
) => Promise<ParallelSearchResponse>;

export interface EveWebSearchResult {
  query: string;
  provider: 'vercel-parallel-fast';
  results: ParallelSearchResponse['results'];
  summary: string | null;
}

/** Runs Vercel Parallel Fast web search for technical product specifications. */
export async function executeWebSearch(
  input: WebSearchInput,
  searchFn: ParallelSearchFn = searchParallelFast,
): Promise<EveWebSearchResult> {
  const response = await searchFn(input.query, { limit: input.limit });
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
