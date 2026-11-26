import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  exchangeRateFindFirst: vi.fn<() => Promise<unknown>>(),
  exchangeRateFindMany: vi.fn<() => Promise<unknown[]>>(),
  exchangeRateUpsert: vi.fn<() => Promise<unknown>>(),
}));

vi.mock('@tariffos/database', () => ({
  getUnscopedSystemPrisma: () => ({
    exchangeRate: {
      findFirst: mocks.exchangeRateFindFirst,
      findMany: mocks.exchangeRateFindMany,
      upsert: mocks.exchangeRateUpsert,
    },
  }),
}));

import {
  getLatestExchangeRates,
  persistBcvRates,
  resetOfflineExchangeRates,
} from './sync-service';

describe('BCV sync-service', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    vi.clearAllMocks();
    resetOfflineExchangeRates();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it('persists and retrieves latest rates in offline mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';

    const initial = await getLatestExchangeRates();
    expect(initial['USD/VES'].rate).toBeGreaterThan(0);
    expect(initial['EUR/VES'].rate).toBeGreaterThan(0);

    await persistBcvRates([
      { pair: 'USD/VES', rate: 53.12, valueDate: '2026-11-26', source: 'bcv.org.ve' },
    ]);
    const updated = await getLatestExchangeRates();
    expect(updated['USD/VES'].rate).toBe(53.12);
  });

  it('skips anomalous >25% rate jumps unless force is true in cloud mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.exchangeRateFindFirst.mockResolvedValue({ rate: 50 });

    const skippedRes = await persistBcvRates([
      { pair: 'USD/VES', rate: 95, valueDate: '2026-11-26', source: 'bcv.org.ve' },
    ]);
    expect(skippedRes.saved).toHaveLength(0);
    expect(skippedRes.skipped).toHaveLength(1);
    expect(mocks.exchangeRateUpsert).not.toHaveBeenCalled();

    mocks.exchangeRateUpsert.mockResolvedValue({
      id: 'er-1',
      pair: 'USD/VES',
      rate: 95,
      valueDate: new Date('2026-11-26T00:00:00.000Z'),
      source: 'bcv.org.ve',
    });

    const forcedRes = await persistBcvRates(
      [{ pair: 'USD/VES', rate: 95, valueDate: '2026-11-26', source: 'bcv.org.ve' }],
      { force: true },
    );
    expect(forcedRes.saved).toHaveLength(1);
    expect(mocks.exchangeRateUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          pair_valueDate: {
            pair: 'USD/VES',
            valueDate: new Date('2026-11-26T00:00:00.000Z'),
          },
        },
      }),
    );
  });
});
