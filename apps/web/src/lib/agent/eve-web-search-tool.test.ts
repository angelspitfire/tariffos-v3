import { describe, expect, it, vi } from 'vitest';
import {
  executeWebSearch,
  WebSearchInputSchema,
} from '../../../../../agent/tools/web_search';

describe('Eve web_search tool (Vercel Parallel Fast)', () => {
  it('validates input query and default limit', () => {
    expect(() => WebSearchInputSchema.parse({ query: 'a' })).toThrow();
    expect(WebSearchInputSchema.parse({ query: 'MacBook Pro 14 M3' })).toEqual({
      query: 'MacBook Pro 14 M3',
      limit: 5,
    });
  });

  it('returns structured Vercel Parallel Fast results and degrades cleanly when empty', async () => {
    const searchFn = vi.fn(async (query: string) => ({
      query,
      results: [
        {
          url: 'https://example.com/spec',
          title: 'MacBook Pro 14 M3',
          excerpts: ['Laptop 14.2 pulgadas, procesador Apple M3, 1.55 kg.'],
          publishDate: '2026-01-10',
        },
      ],
      formattedSummary: '- MacBook Pro 14 M3: Laptop 14.2 pulgadas, procesador Apple M3, 1.55 kg.',
    }));

    const out = await executeWebSearch({ query: 'MacBook Pro 14 M3', limit: 3 }, searchFn);
    expect(searchFn).toHaveBeenCalledWith('MacBook Pro 14 M3', { limit: 3 });
    expect(out).toEqual({
      query: 'MacBook Pro 14 M3',
      provider: 'vercel-parallel-fast',
      results: [
        {
          url: 'https://example.com/spec',
          title: 'MacBook Pro 14 M3',
          excerpts: ['Laptop 14.2 pulgadas, procesador Apple M3, 1.55 kg.'],
          publishDate: '2026-01-10',
        },
      ],
      summary: '- MacBook Pro 14 M3: Laptop 14.2 pulgadas, procesador Apple M3, 1.55 kg.',
    });

    const emptyFn = vi.fn(async (query: string) => ({
      query,
      results: [],
      formattedSummary: null,
    }));
    await expect(executeWebSearch({ query: 'Unknown SKU', limit: 5 }, emptyFn)).resolves.toEqual({
      query: 'Unknown SKU',
      provider: 'vercel-parallel-fast',
      results: [],
      summary: null,
    });
  });
});
