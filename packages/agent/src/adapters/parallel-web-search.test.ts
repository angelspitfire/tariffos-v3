import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  extractParallelResultsFromToolResults,
  formatParallelItems,
  searchParallelFast,
} from './parallel-web-search.js';

describe('parallel-web-search adapter', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('extracts structured Parallel Search items from AI SDK toolResults output or result', () => {
    const items = extractParallelResultsFromToolResults([
      {
        toolName: 'parallel_search',
        output: {
          search_id: 's1',
          results: [
            {
              url: 'https://example.com/spec',
              title: 'Motor BLDC 24V',
              publish_date: '2026-01-10',
              excerpts: ['Potencia nominal 150W, torque 0.45 Nm.'],
            },
          ],
        },
      },
      {
        toolName: 'parallel_search',
        result: {
          results: [
            {
              url: 'https://example.com/alt',
              title: null,
              excerpts: ['Construcción sin escobillas, IP65.'],
            },
          ],
        },
      },
    ]);

    expect(items).toEqual([
      {
        url: 'https://example.com/spec',
        title: 'Motor BLDC 24V',
        publishDate: '2026-01-10',
        excerpts: ['Potencia nominal 150W, torque 0.45 Nm.'],
      },
      {
        url: 'https://example.com/alt',
        title: '',
        publishDate: null,
        excerpts: ['Construcción sin escobillas, IP65.'],
      },
    ]);
  });

  it('formats and caps snippets at 1500 chars', () => {
    const longExcerpt = 'A'.repeat(1600);
    const formatted = formatParallelItems(
      [
        { url: 'https://example.com/1', title: 'Ficha', excerpts: [longExcerpt] },
        { url: 'https://example.com/2', title: 'Extra', excerpts: ['Ignored'] },
      ],
      1,
    );

    expect(formatted).not.toBeNull();
    expect(formatted!.length).toBeLessThanOrEqual(1500);
    expect(formatted!.endsWith('...')).toBe(true);
  });

  it('fails closed on blank query, missing Gateway credentials, or executor errors', async () => {
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.VERCEL_OIDC_TOKEN;
    delete process.env.WEB_SEARCH_PARALLEL_API_KEY;

    const spy = vi.fn();
    await expect(searchParallelFast('   ', { executor: spy })).resolves.toEqual({
      query: '   ',
      results: [],
      formattedSummary: null,
    });
    expect(spy).not.toHaveBeenCalled();

    // Without custom executor and without Gateway creds, returns empty cleanly
    await expect(searchParallelFast('MacBook Pro 14 M3')).resolves.toEqual({
      query: 'MacBook Pro 14 M3',
      results: [],
      formattedSummary: null,
    });

    const failingExecutor = vi.fn(async () => {
      throw new Error('gateway timeout');
    });
    await expect(searchParallelFast('MacBook Pro 14 M3', { executor: failingExecutor })).resolves.toEqual({
      query: 'MacBook Pro 14 M3',
      results: [],
      formattedSummary: null,
    });
  });

  it('runs injected executor and returns results + formattedSummary', async () => {
    const executor = vi.fn(async () => [
      {
        url: 'https://apple.com/macbook-pro',
        title: 'MacBook Pro 14',
        excerpts: ['Pantalla Liquid Retina XDR 14.2 pulgadas, peso 1.55 kg.'],
      },
    ]);

    const response = await searchParallelFast('MacBook Pro 14 M3', {
      limit: 3,
      modelId: 'google/gemini-2.5-flash-lite',
      executor,
    });

    expect(executor).toHaveBeenCalledWith({
      query: 'MacBook Pro 14 M3',
      limit: 3,
      timeoutMs: 8_000,
      modelId: 'google/gemini-2.5-flash-lite',
    });
    expect(response.results).toHaveLength(1);
    expect(response.formattedSummary).toBe(
      '- MacBook Pro 14: Pantalla Liquid Retina XDR 14.2 pulgadas, peso 1.55 kg.',
    );
  });
});
