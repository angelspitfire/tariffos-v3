/**
 * Single source of truth for classification confidence thresholds and
 * currently supported live customs jurisdictions across `@tariffos/agent`
 * and `apps/web`.
 */

/** Minimum confidence (%) for "Alto" level and automatic batch approval. */
export const HIGH_CONFIDENCE_THRESHOLD = 85;
export const AUTO_APPROVE_CONFIDENCE_THRESHOLD = HIGH_CONFIDENCE_THRESHOLD;

/** Minimum confidence (%) for direct 1-click seal without triggering HITL/review. */
export const REVIEW_CONFIDENCE_THRESHOLD = 75;

/** Minimum confidence (%) for "Medio" level (below this is "Bajo"). */
export const MEDIUM_CONFIDENCE_THRESHOLD = 60;

/** Country codes with an official national tariff schedule currently seeded in Supabase. */
export const SUPPORTED_LIVE_COUNTRIES = ['VE'] as const;
export type SupportedLiveCountry = (typeof SUPPORTED_LIVE_COUNTRIES)[number];

export function isSupportedLiveCountry(countryCode: string): boolean {
  const normalized = countryCode.trim().toUpperCase();
  return (SUPPORTED_LIVE_COUNTRIES as readonly string[]).includes(normalized);
}
