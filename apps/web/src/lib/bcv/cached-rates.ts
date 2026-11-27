import { isCloudModeEnabled } from '@/lib/runtime-config';
import {
  getBcvCacheBucket,
  invalidateBcvRateCache,
  resetBcvRateCacheForTests,
  type BcvRefreshOutcome,
} from './cache-state';
import { fetchBcvRates } from './client';
import type { BcvPair, BcvRateQuote } from './parser';
import {
  getLatestExchangeRateTimestamp,
  getLatestExchangeRates,
  persistBcvRates,
} from './sync-service';

export const BCV_MEMORY_CACHE_TTL_MS = 15 * 60 * 1000;
export const BCV_DB_STALE_AFTER_MS = 2 * 60 * 60 * 1000;
export const BCV_REFRESH_COOLDOWN_MS = 60 * 1000;

export { invalidateBcvRateCache, resetBcvRateCacheForTests };

export interface CachedBcvRatesResponse {
  rates: Record<BcvPair, BcvRateQuote>;
  fetchedAt: string;
  cached: boolean;
  stale: boolean;
  refreshed: boolean;
}

export interface GetCachedBcvRatesOptions {
  forceRefresh?: boolean;
  nowMs?: number;
  isCloud?: boolean;
  fetchImpl?: typeof fetchBcvRates;
  persistImpl?: typeof persistBcvRates;
  loadLatestImpl?: typeof getLatestExchangeRates;
  loadTimestampImpl?: typeof getLatestExchangeRateTimestamp;
}

function getCaracasDateString(nowMs: number): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Caracas' }).format(
    new Date(nowMs),
  );
}

async function isDbSnapshotStale(
  rates: Record<BcvPair, BcvRateQuote>,
  nowMs: number,
  loadTimestampImpl: typeof getLatestExchangeRateTimestamp,
): Promise<boolean> {
  const todayVe = getCaracasDateString(nowMs);
  if (rates['USD/VES'].valueDate < todayVe || rates['EUR/VES'].valueDate < todayVe) {
    return true;
  }
  const latestCreatedMs = await loadTimestampImpl();
  return latestCreatedMs !== null && nowMs - latestCreatedMs > BCV_DB_STALE_AFTER_MS;
}

async function runSingleFlightRefresh(params: {
  nowMs: number;
  fetchImpl: typeof fetchBcvRates;
  persistImpl: typeof persistBcvRates;
  loadLatestImpl: typeof getLatestExchangeRates;
}): Promise<BcvRefreshOutcome> {
  const bucket = getBcvCacheBucket();
  if (bucket.inFlightRefresh) {
    return bucket.inFlightRefresh;
  }

  bucket.lastUpstreamAttemptMs = params.nowMs;
  const promise = (async (): Promise<BcvRefreshOutcome> => {
    try {
      const quotes = await params.fetchImpl();
      await params.persistImpl(quotes);
      const latest = await params.loadLatestImpl();
      return { rates: latest, stale: false, refreshed: true };
    } catch {
      const fallback = bucket.entry?.rates ?? (await params.loadLatestImpl());
      return { rates: fallback, stale: true, refreshed: false };
    } finally {
      bucket.inFlightRefresh = null;
    }
  })();

  bucket.inFlightRefresh = promise;
  return promise;
}

/**
 * Returns cached BCV exchange rates (`USD/VES`, `EUR/VES`) with:
 * - 15-minute L1 memory cache,
 * - automatic upstream refresh when DB data is > 2h stale (in cloud mode), and
 * - single-flight, 60s cooldown-protected on-demand user refresh.
 */
export async function getCachedBcvRates(
  options: GetCachedBcvRatesOptions = {},
): Promise<CachedBcvRatesResponse> {
  const nowMs = options.nowMs ?? Date.now();
  const forceRefresh = Boolean(options.forceRefresh);
  const isCloud = options.isCloud ?? isCloudModeEnabled();
  const fetchImpl = options.fetchImpl ?? fetchBcvRates;
  const persistImpl = options.persistImpl ?? persistBcvRates;
  const loadLatestImpl = options.loadLatestImpl ?? getLatestExchangeRates;
  const loadTimestampImpl = options.loadTimestampImpl ?? getLatestExchangeRateTimestamp;
  const bucket = getBcvCacheBucket();

  if (bucket.inFlightRefresh) {
    const outcome = await bucket.inFlightRefresh;
    return {
      rates: outcome.rates,
      fetchedAt: bucket.entry?.fetchedAt ?? new Date(nowMs).toISOString(),
      cached: false,
      stale: outcome.stale,
      refreshed: outcome.refreshed,
    };
  }

  const cooldownElapsed =
    bucket.lastUpstreamAttemptMs === 0 ||
    nowMs - bucket.lastUpstreamAttemptMs >= BCV_REFRESH_COOLDOWN_MS;

  if (!forceRefresh && bucket.entry && nowMs - bucket.entry.cachedAtMs < BCV_MEMORY_CACHE_TTL_MS) {
    return {
      rates: bucket.entry.rates,
      fetchedAt: bucket.entry.fetchedAt,
      cached: true,
      stale: bucket.entry.stale,
      refreshed: false,
    };
  }

  if (forceRefresh && !cooldownElapsed && bucket.entry) {
    return {
      rates: bucket.entry.rates,
      fetchedAt: bucket.entry.fetchedAt,
      cached: true,
      stale: bucket.entry.stale,
      refreshed: false,
    };
  }

  if (forceRefresh && cooldownElapsed) {
    const outcome = await runSingleFlightRefresh({
      nowMs,
      fetchImpl,
      persistImpl,
      loadLatestImpl,
    });
    const fetchedAt = new Date(nowMs).toISOString();
    bucket.entry = { rates: outcome.rates, fetchedAt, cachedAtMs: nowMs, stale: outcome.stale };
    return {
      rates: outcome.rates,
      fetchedAt,
      cached: false,
      stale: outcome.stale,
      refreshed: outcome.refreshed,
    };
  }

  const dbRates = await loadLatestImpl();
  if (isCloud && cooldownElapsed && (await isDbSnapshotStale(dbRates, nowMs, loadTimestampImpl))) {
    const outcome = await runSingleFlightRefresh({
      nowMs,
      fetchImpl,
      persistImpl,
      loadLatestImpl,
    });
    const fetchedAt = new Date(nowMs).toISOString();
    bucket.entry = { rates: outcome.rates, fetchedAt, cachedAtMs: nowMs, stale: outcome.stale };
    return {
      rates: outcome.rates,
      fetchedAt,
      cached: false,
      stale: outcome.stale,
      refreshed: outcome.refreshed,
    };
  }

  const fetchedAt = new Date(nowMs).toISOString();
  bucket.entry = { rates: dbRates, fetchedAt, cachedAtMs: nowMs, stale: false };
  return {
    rates: dbRates,
    fetchedAt,
    cached: false,
    stale: false,
    refreshed: false,
  };
}
