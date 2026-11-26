import { z } from 'zod';
import {
  MAX_VALID_RATE,
  MIN_VALID_RATE,
  parseBcvHtml,
  type BcvPair,
  type BcvRateQuote,
} from './parser';

export const BCV_OFFICIAL_URL = 'https://www.bcv.org.ve/';
export const DEFAULT_FALLBACK_BASE_URL = 'https://ve.dolarapi.com/v1';
export const FETCH_TIMEOUT_MS = 10_000;

const FallbackApiSchema = z.object({
  promedio: z.number().min(MIN_VALID_RATE).max(MAX_VALID_RATE),
  fechaActualizacion: z.string().optional(),
});

export interface FetchBcvRatesOptions {
  fetchImpl?: typeof fetch;
  primaryUrl?: string;
  fallbackBaseUrl?: string;
}

async function fetchFromPrimaryBcv(
  fetchImpl: typeof fetch,
  primaryUrl: string,
): Promise<BcvRateQuote[]> {
  const res = await fetchImpl(primaryUrl, {
    method: 'GET',
    headers: { 'User-Agent': 'TariffOS/1.0 (+https://tariffos.app)' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`BCV primary HTTP ${res.status}`);
  }
  const html = await res.text();
  return parseBcvHtml(html);
}

async function fetchPairFromFallback(
  fetchImpl: typeof fetch,
  url: string,
  pair: BcvPair,
): Promise<BcvRateQuote> {
  const res = await fetchImpl(url, {
    method: 'GET',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`BCV fallback HTTP ${res.status} for ${pair}`);
  }
  const raw: unknown = await res.json();
  const parsed = FallbackApiSchema.parse(raw);
  const valueDate = (parsed.fechaActualizacion ?? new Date().toISOString()).slice(0, 10);
  return {
    pair,
    rate: Math.round(parsed.promedio * 10_000) / 10_000,
    valueDate,
    source: 'bcv-fallback',
  };
}

export async function fetchBcvRates(
  options: FetchBcvRatesOptions = {},
): Promise<BcvRateQuote[]> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const primaryUrl = options.primaryUrl ?? BCV_OFFICIAL_URL;
  const fallbackBaseUrl =
    options.fallbackBaseUrl ??
    process.env.BCV_FALLBACK_BASE_URL ??
    DEFAULT_FALLBACK_BASE_URL;

  try {
    return await fetchFromPrimaryBcv(fetchImpl, primaryUrl);
  } catch (primaryErr: unknown) {
    const primaryMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
    try {
      const [usd, eur] = await Promise.all([
        fetchPairFromFallback(fetchImpl, `${fallbackBaseUrl}/dolares/oficial`, 'USD/VES'),
        fetchPairFromFallback(fetchImpl, `${fallbackBaseUrl}/euros/oficial`, 'EUR/VES'),
      ]);
      return [usd, eur];
    } catch (fallbackErr: unknown) {
      const fallbackMsg =
        fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      throw new Error(
        `Failed to fetch BCV rates from primary (${primaryMsg}) and fallback (${fallbackMsg})`,
      );
    }
  }
}
