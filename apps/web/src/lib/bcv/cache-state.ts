import type { BcvPair, BcvRateQuote } from './parser';

export interface BcvCacheEntry {
  rates: Record<BcvPair, BcvRateQuote>;
  fetchedAt: string;
  cachedAtMs: number;
  stale: boolean;
}

export interface BcvCacheBucket {
  entry: BcvCacheEntry | null;
  lastUpstreamAttemptMs: number;
  inFlightRefresh: Promise<BcvRefreshOutcome> | null;
}

export interface BcvRefreshOutcome {
  rates: Record<BcvPair, BcvRateQuote>;
  stale: boolean;
  refreshed: boolean;
}

const globalForBcvCache = globalThis as unknown as {
  __tariffosBcvCacheBucket?: BcvCacheBucket;
};

/** Returns the process-wide L1 BCV cache bucket (survives Next.js HMR). */
export function getBcvCacheBucket(): BcvCacheBucket {
  if (!globalForBcvCache.__tariffosBcvCacheBucket) {
    globalForBcvCache.__tariffosBcvCacheBucket = {
      entry: null,
      lastUpstreamAttemptMs: 0,
      inFlightRefresh: null,
    };
  }
  return globalForBcvCache.__tariffosBcvCacheBucket;
}

/** Clears the cached L1 snapshot so the next read re-validates against DB/upstream. */
export function invalidateBcvRateCache(): void {
  const bucket = getBcvCacheBucket();
  bucket.entry = null;
}

/** Resets both L1 snapshot and cooldown timer (for unit tests). */
export function resetBcvRateCacheForTests(): void {
  globalForBcvCache.__tariffosBcvCacheBucket = {
    entry: null,
    lastUpstreamAttemptMs: 0,
    inFlightRefresh: null,
  };
}
