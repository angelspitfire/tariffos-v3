import { getUnscopedSystemPrisma } from '@tariffos/database';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { invalidateBcvRateCache } from './cache-state';
import { validateRateDelta, type BcvPair, type BcvRateQuote } from './parser';

export interface PersistBcvResult {
  saved: BcvRateQuote[];
  skipped: Array<{ quote: BcvRateQuote; reason: string }>;
}

const DEFAULT_OFFLINE_RATES: Record<BcvPair, BcvRateQuote> = {
  'USD/VES': { pair: 'USD/VES', rate: 52.43, valueDate: '2026-11-26', source: 'offline_seed' },
  'EUR/VES': { pair: 'EUR/VES', rate: 55.1, valueDate: '2026-11-26', source: 'offline_seed' },
};

const globalForBcv = globalThis as unknown as {
  __tariffosOfflineBcvRates?: Record<BcvPair, BcvRateQuote>;
  __tariffosOfflineBcvHistory?: BcvRateQuote[];
};

function getOfflineStore(): {
  latest: Record<BcvPair, BcvRateQuote>;
  history: BcvRateQuote[];
} {
  if (!globalForBcv.__tariffosOfflineBcvRates || !globalForBcv.__tariffosOfflineBcvHistory) {
    globalForBcv.__tariffosOfflineBcvRates = {
      'USD/VES': { ...DEFAULT_OFFLINE_RATES['USD/VES'] },
      'EUR/VES': { ...DEFAULT_OFFLINE_RATES['EUR/VES'] },
    };
    globalForBcv.__tariffosOfflineBcvHistory = [
      { ...DEFAULT_OFFLINE_RATES['USD/VES'] },
      { ...DEFAULT_OFFLINE_RATES['EUR/VES'] },
    ];
  }
  return {
    latest: globalForBcv.__tariffosOfflineBcvRates,
    history: globalForBcv.__tariffosOfflineBcvHistory,
  };
}

export function resetOfflineExchangeRates(): void {
  globalForBcv.__tariffosOfflineBcvRates = undefined;
  globalForBcv.__tariffosOfflineBcvHistory = undefined;
}

function toUtcDateOnly(isoDate: string): Date {
  return new Date(`${isoDate.slice(0, 10)}T00:00:00.000Z`);
}

export async function persistBcvRates(
  quotes: readonly BcvRateQuote[],
  options: { force?: boolean } = {},
): Promise<PersistBcvResult> {
  const force = Boolean(options.force);
  const saved: BcvRateQuote[] = [];
  const skipped: Array<{ quote: BcvRateQuote; reason: string }> = [];

  if (!isCloudModeEnabled()) {
    const store = getOfflineStore();
    for (const q of quotes) {
      const prev = store.latest[q.pair]?.rate ?? null;
      if (!force && !validateRateDelta(prev, q.rate)) {
        skipped.push({ quote: q, reason: 'Anomalous >25% rate delta' });
        continue;
      }
      store.latest[q.pair] = { ...q };
      store.history.unshift({ ...q });
      saved.push(q);
    }
    if (saved.length > 0) invalidateBcvRateCache();
    return { saved, skipped };
  }

  const prisma = getUnscopedSystemPrisma();
  for (const q of quotes) {
    const latestRow = await prisma.exchangeRate.findFirst({
      where: { pair: q.pair },
      orderBy: { valueDate: 'desc' },
      select: { rate: true },
    });

    if (!force && !validateRateDelta(latestRow?.rate ?? null, q.rate)) {
      skipped.push({ quote: q, reason: 'Anomalous >25% rate delta' });
      continue;
    }

    const valueDate = toUtcDateOnly(q.valueDate);
    const upserted = await prisma.exchangeRate.upsert({
      where: { pair_valueDate: { pair: q.pair, valueDate } },
      update: { rate: q.rate, source: q.source, updatedAt: new Date() },
      create: { pair: q.pair, rate: q.rate, valueDate, source: q.source },
    });
    saved.push({
      pair: q.pair,
      rate: upserted.rate,
      valueDate: upserted.valueDate.toISOString().slice(0, 10),
      source: upserted.source,
    });
  }

  if (saved.length > 0) invalidateBcvRateCache();
  return { saved, skipped };
}

/** Returns the epoch ms timestamp of the most recently synced ExchangeRate row, or null. */
export async function getLatestExchangeRateTimestamp(): Promise<number | null> {
  if (!isCloudModeEnabled()) return null;
  const prisma = getUnscopedSystemPrisma();
  const row = await prisma.exchangeRate.findFirst({
    orderBy: [{ updatedAt: 'desc' }, { valueDate: 'desc' }],
    select: { updatedAt: true },
  });
  return row ? row.updatedAt.getTime() : null;
}

export async function getLatestExchangeRates(): Promise<Record<BcvPair, BcvRateQuote>> {
  if (!isCloudModeEnabled()) {
    const store = getOfflineStore();
    return {
      'USD/VES': { ...store.latest['USD/VES'] },
      'EUR/VES': { ...store.latest['EUR/VES'] },
    };
  }

  const prisma = getUnscopedSystemPrisma();
  const [usd, eur] = await Promise.all([
    prisma.exchangeRate.findFirst({
      where: { pair: 'USD/VES' },
      orderBy: [{ valueDate: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.exchangeRate.findFirst({
      where: { pair: 'EUR/VES' },
      orderBy: [{ valueDate: 'desc' }, { createdAt: 'desc' }],
    }),
  ]);

  return {
    'USD/VES': usd
      ? {
          pair: 'USD/VES',
          rate: usd.rate,
          valueDate: usd.valueDate.toISOString().slice(0, 10),
          source: usd.source,
        }
      : { ...DEFAULT_OFFLINE_RATES['USD/VES'] },
    'EUR/VES': eur
      ? {
          pair: 'EUR/VES',
          rate: eur.rate,
          valueDate: eur.valueDate.toISOString().slice(0, 10),
          source: eur.source,
        }
      : { ...DEFAULT_OFFLINE_RATES['EUR/VES'] },
  };
}

export async function listRecentExchangeRates(limit = 10): Promise<BcvRateQuote[]> {
  if (!isCloudModeEnabled()) {
    return getOfflineStore().history.slice(0, limit);
  }
  const prisma = getUnscopedSystemPrisma();
  const rows = await prisma.exchangeRate.findMany({
    orderBy: [{ valueDate: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
  return rows.map((r) => ({
    pair: r.pair === 'EUR/VES' ? 'EUR/VES' : 'USD/VES',
    rate: r.rate,
    valueDate: r.valueDate.toISOString().slice(0, 10),
    source: r.source,
  }));
}
