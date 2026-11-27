import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCachedBcvRates: vi.fn<
    (opts?: { forceRefresh?: boolean }) => Promise<{
      rates: Record<string, { pair: string; rate: number; valueDate: string; source: string }>;
      fetchedAt: string;
      cached: boolean;
      stale: boolean;
      refreshed: boolean;
    }>
  >(),
}));

vi.mock('@/lib/bcv/cached-rates', () => ({
  getCachedBcvRates: mocks.getCachedBcvRates,
}));

import { GET } from './route';

describe('GET /api/exchange-rates/latest', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns cached USD/VES and EUR/VES rates with CDN Cache-Control and supports ?refresh=1', async () => {
    mocks.getCachedBcvRates.mockResolvedValueOnce({
      rates: {
        'USD/VES': { pair: 'USD/VES', rate: 52.43, valueDate: '2026-11-26', source: 'bcv.org.ve' },
        'EUR/VES': { pair: 'EUR/VES', rate: 55.1, valueDate: '2026-11-26', source: 'bcv.org.ve' },
      },
      fetchedAt: '2026-11-26T20:00:00.000Z',
      cached: true,
      stale: false,
      refreshed: false,
    });

    const res = await GET(new Request('http://localhost/api/exchange-rates/latest'));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=300');
    const body = (await res.json()) as {
      rates: { 'USD/VES': { rate: number }; 'EUR/VES': { rate: number } };
      fetchedAt: string;
      cached: boolean;
    };
    expect(body.rates['USD/VES'].rate).toBe(52.43);
    expect(body.rates['EUR/VES'].rate).toBe(55.1);
    expect(body.cached).toBe(true);

    mocks.getCachedBcvRates.mockResolvedValueOnce({
      rates: {
        'USD/VES': { pair: 'USD/VES', rate: 53.02, valueDate: '2026-11-26', source: 'bcv.org.ve' },
        'EUR/VES': { pair: 'EUR/VES', rate: 55.9, valueDate: '2026-11-26', source: 'bcv.org.ve' },
      },
      fetchedAt: '2026-11-26T20:01:00.000Z',
      cached: false,
      stale: false,
      refreshed: true,
    });

    const refreshRes = await GET(new Request('http://localhost/api/exchange-rates/latest?refresh=1'));
    expect(mocks.getCachedBcvRates).toHaveBeenLastCalledWith({ forceRefresh: true });
    expect(refreshRes.headers.get('cache-control')).toBe('no-store');
  });
});
