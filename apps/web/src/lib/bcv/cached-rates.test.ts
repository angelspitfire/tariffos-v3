import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BcvPair, BcvRateQuote } from './parser';
import {
  BCV_MEMORY_CACHE_TTL_MS,
  BCV_REFRESH_COOLDOWN_MS,
  getCachedBcvRates,
  invalidateBcvRateCache,
  resetBcvRateCacheForTests,
} from './cached-rates';

const SEED_RATES: Record<BcvPair, BcvRateQuote> = {
  'USD/VES': { pair: 'USD/VES', rate: 52.43, valueDate: '2026-11-26', source: 'bcv.org.ve' },
  'EUR/VES': { pair: 'EUR/VES', rate: 55.1, valueDate: '2026-11-26', source: 'bcv.org.ve' },
};

const UPDATED_QUOTES: BcvRateQuote[] = [
  { pair: 'USD/VES', rate: 52.89, valueDate: '2026-11-26', source: 'bcv.org.ve' },
  { pair: 'EUR/VES', rate: 55.62, valueDate: '2026-11-26', source: 'bcv.org.ve' },
];

describe('cached-rates (BCV L1/L2 cache & on-demand refresh)', () => {
  beforeEach(() => {
    resetBcvRateCacheForTests();
  });

  afterEach(() => {
    resetBcvRateCacheForTests();
    vi.restoreAllMocks();
  });

  it('serves from L1 memory cache within 15 min without calling DB or upstream', async () => {
    const loadLatestImpl = vi.fn(async () => SEED_RATES);
    const fetchImpl = vi.fn(async () => UPDATED_QUOTES);
    const persistImpl = vi.fn(async () => ({ saved: UPDATED_QUOTES, skipped: [] }));

    const first = await getCachedBcvRates({
      nowMs: 1_000_000,
      isCloud: false,
      loadLatestImpl,
      fetchImpl,
      persistImpl,
    });
    expect(first.cached).toBe(false);
    expect(first.rates['USD/VES'].rate).toBe(52.43);
    expect(loadLatestImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).not.toHaveBeenCalled();

    const second = await getCachedBcvRates({
      nowMs: 1_000_000 + BCV_MEMORY_CACHE_TTL_MS - 1_000,
      isCloud: false,
      loadLatestImpl,
      fetchImpl,
      persistImpl,
    });
    expect(second.cached).toBe(true);
    expect(second.rates['USD/VES'].rate).toBe(52.43);
    expect(loadLatestImpl).toHaveBeenCalledTimes(1);

    invalidateBcvRateCache();
    await getCachedBcvRates({
      nowMs: 1_000_000 + 5_000,
      isCloud: false,
      loadLatestImpl,
      fetchImpl,
      persistImpl,
    });
    expect(loadLatestImpl).toHaveBeenCalledTimes(2);
  });

  it('coalesces concurrent forceRefresh calls and honors 60s upstream cooldown', async () => {
    let currentDbRates = SEED_RATES;
    const loadLatestImpl = vi.fn(async () => currentDbRates);
    const fetchImpl = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 15));
      return UPDATED_QUOTES;
    });
    const persistImpl = vi.fn(async (quotes: readonly BcvRateQuote[]) => {
      currentDbRates = {
        'USD/VES': quotes[0]!,
        'EUR/VES': quotes[1]!,
      };
      return { saved: [...quotes], skipped: [] };
    });

    const [r1, r2] = await Promise.all([
      getCachedBcvRates({
        forceRefresh: true,
        nowMs: 2_000_000,
        isCloud: true,
        loadLatestImpl,
        fetchImpl,
        persistImpl,
      }),
      getCachedBcvRates({
        forceRefresh: true,
        nowMs: 2_000_000,
        isCloud: true,
        loadLatestImpl,
        fetchImpl,
        persistImpl,
      }),
    ]);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(persistImpl).toHaveBeenCalledTimes(1);
    expect(r1.refreshed).toBe(true);
    expect(r2.rates['USD/VES'].rate).toBe(52.89);

    // Cooldown prevents re-hitting upstream within 60s even with forceRefresh
    const withinCooldown = await getCachedBcvRates({
      forceRefresh: true,
      nowMs: 2_000_000 + BCV_REFRESH_COOLDOWN_MS - 1_000,
      isCloud: true,
      loadLatestImpl,
      fetchImpl,
      persistImpl,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(withinCooldown.cached).toBe(true);
    expect(withinCooldown.refreshed).toBe(false);
  });

  it('degrades cleanly to persisted/cached rates with stale=true when upstream fails', async () => {
    const loadLatestImpl = vi.fn(async () => SEED_RATES);
    const fetchImpl = vi.fn(async () => {
      throw new Error('BCV network timeout');
    });
    const persistImpl = vi.fn();

    const result = await getCachedBcvRates({
      forceRefresh: true,
      nowMs: 3_000_000,
      isCloud: true,
      loadLatestImpl,
      fetchImpl,
      persistImpl,
    });

    expect(result.stale).toBe(true);
    expect(result.refreshed).toBe(false);
    expect(result.rates['USD/VES'].rate).toBe(52.43);
    expect(persistImpl).not.toHaveBeenCalled();
  });
});
