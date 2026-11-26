import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getLatestExchangeRates: vi.fn<() => Promise<unknown>>(),
}));

vi.mock('@/lib/bcv/sync-service', () => ({
  getLatestExchangeRates: mocks.getLatestExchangeRates,
}));

import { GET } from './route';

describe('GET /api/exchange-rates/latest', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the latest USD/VES and EUR/VES rates for duty calculations', async () => {
    mocks.getLatestExchangeRates.mockResolvedValue({
      'USD/VES': { pair: 'USD/VES', rate: 52.43, valueDate: '2026-11-26', source: 'bcv.org.ve' },
      'EUR/VES': { pair: 'EUR/VES', rate: 55.1, valueDate: '2026-11-26', source: 'bcv.org.ve' },
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      rates: { 'USD/VES': { rate: number }; 'EUR/VES': { rate: number } };
      fetchedAt: string;
    };
    expect(body.rates['USD/VES'].rate).toBe(52.43);
    expect(body.rates['EUR/VES'].rate).toBe(55.1);
    expect(body.fetchedAt).toBeTruthy();
  });
});
