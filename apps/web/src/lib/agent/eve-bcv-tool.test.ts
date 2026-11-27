import { describe, expect, it, vi } from 'vitest';
import { executeGetBcvRate, GetBcvRateInputSchema } from '../../../../../agent/tools/get_bcv_rate';

describe('Eve get_bcv_rate tool', () => {
  it('validates pair and refresh flags with defaults', () => {
    expect(GetBcvRateInputSchema.parse({})).toEqual({
      pair: 'ALL',
      refresh: false,
    });
    expect(GetBcvRateInputSchema.parse({ pair: 'EUR/VES', refresh: true })).toEqual({
      pair: 'EUR/VES',
      refresh: true,
    });
  });

  it('returns cached or refreshed BCV rates for ALL or a specific currency pair', async () => {
    const loader = vi.fn(async (opts?: { forceRefresh?: boolean }) => ({
      rates: {
        'USD/VES': { pair: 'USD/VES' as const, rate: 53.1, valueDate: '2026-11-26', source: 'bcv.org.ve' },
        'EUR/VES': { pair: 'EUR/VES' as const, rate: 56.2, valueDate: '2026-11-26', source: 'bcv.org.ve' },
      },
      fetchedAt: '2026-11-26T20:00:00.000Z',
      cached: !opts?.forceRefresh,
      stale: false,
      refreshed: Boolean(opts?.forceRefresh),
    }));

    const all = await executeGetBcvRate({ pair: 'ALL', refresh: true }, loader);
    expect(loader).toHaveBeenCalledWith({ forceRefresh: true });
    expect(all.refreshed).toBe(true);
    expect(all.rates['USD/VES'].rate).toBe(53.1);

    const usdOnly = await executeGetBcvRate({ pair: 'USD/VES', refresh: false }, loader);
    expect(usdOnly.selectedRate).toEqual({
      pair: 'USD/VES',
      rate: 53.1,
      valueDate: '2026-11-26',
      source: 'bcv.org.ve',
    });
  });
});
