import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWebSpecsFetcher } from './web-search-adapter.js';

describe('createWebSpecsFetcher', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('returns null immediately when WEB_SEARCH_PROVIDER or apiKey or query is empty', async () => {
    delete process.env.WEB_SEARCH_PROVIDER;
    const fetchSpy = vi.fn();
    const fetcher = createWebSpecsFetcher(fetchSpy as unknown as typeof fetch);

    await expect(fetcher('MacBook Pro 14 M3')).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();

    process.env.WEB_SEARCH_PROVIDER = 'serper';
    delete process.env.SERPER_API_KEY;
    delete process.env.WEB_SEARCH_SERPER_API_KEY;
    await expect(fetcher('MacBook Pro 14 M3')).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();

    process.env.SERPER_API_KEY = 'serper-test-key';
    await expect(fetcher('   ')).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('queries Serper with X-API-KEY and formats organic snippets up to 1500 chars', async () => {
    process.env.WEB_SEARCH_PROVIDER = 'serper';
    process.env.SERPER_API_KEY = 'serper-key-1';
    process.env.WEB_SEARCH_LIMIT = '2';

    const fetchMock = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      new Response(
        JSON.stringify({
          organic: [
            { title: 'Spec 1', snippet: 'Laptop 14 inch 1.55 kg', link: 'https://example.com/1' },
            { title: 'Spec 2', snippet: 'Aluminum unibody chassis', link: 'https://example.com/2' },
            { title: 'Spec 3', snippet: 'Should be sliced off', link: 'https://example.com/3' },
          ],
        }),
        { status: 200 },
      ),
    );

    const fetcher = createWebSpecsFetcher(fetchMock as unknown as typeof fetch);
    const result = await fetcher('MacBook Pro 14');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://google.serper.dev/search');
    expect((init?.headers as Record<string, string>)['X-API-KEY']).toBe('serper-key-1');
    expect(JSON.parse(String(init?.body))).toEqual({ q: 'MacBook Pro 14', num: 2 });
    expect(result).toBe('- Spec 1: Laptop 14 inch 1.55 kg\n- Spec 2: Aluminum unibody chassis');
  });

  it('queries Context.dev with Bearer token and degrades cleanly to null on non-OK HTTP or errors', async () => {
    process.env.WEB_SEARCH_PROVIDER = 'context';
    process.env.CONTEXT_DEV_API_KEY = 'ctx-key-1';

    const okFetch = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      new Response(
        JSON.stringify({
          results: [{ title: 'Datasheet', content: '24V DC brushless motor 150W' }],
        }),
        { status: 200 },
      ),
    );

    const fetcher = createWebSpecsFetcher(okFetch as unknown as typeof fetch);
    const result = await fetcher('Motor BLDC 24V');
    expect(result).toBe('- Datasheet: 24V DC brushless motor 150W');
    const [, init] = okFetch.mock.calls[0]!;
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer ctx-key-1');

    const failFetch = vi.fn(async () => new Response('Server error', { status: 500 }));
    await expect(createWebSpecsFetcher(failFetch as unknown as typeof fetch)('Motor')).resolves.toBeNull();

    const throwFetch = vi.fn(async () => {
      throw new Error('timeout');
    });
    await expect(createWebSpecsFetcher(throwFetch as unknown as typeof fetch)('Motor')).resolves.toBeNull();
  });
});
