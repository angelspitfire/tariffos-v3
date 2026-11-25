import type { PrismaClient } from './generated/client';
import { getUnscopedSystemPrisma } from './client';

/**
 * Country master access (refinement-plan §5): every country-specific fact —
 * legislation, nomenclature depth, dataset provenance — is read from the DB
 * keyed by ISO-2 code. Nothing country-shaped is hardcoded in app code.
 */

export interface CountryRecord {
  code: string;
  name: string;
  legislation: string;
  nomenclatureDigits: number;
  codeGrouping: string;
  datasetVersion: string | null;
  isActive: boolean;
}

/** Thrown when a tenant's country has no master row or no loaded nomenclature. */
export class CountryNotConfiguredError extends Error {
  readonly countryCode: string;
  constructor(countryCode: string, detail: 'missing-country' | 'no-tariff-rows') {
    super(
      detail === 'missing-country'
        ? `País no configurado: no existe la ficha de país "${countryCode}".`
        : `Nomenclatura no cargada para "${countryCode}": sin filas arancelarias activas.`,
    );
    this.name = 'CountryNotConfiguredError';
    this.countryCode = countryCode;
  }
}

/**
 * Resolve the country for a tenant. Throws CountryNotConfiguredError when the
 * master row is missing/inactive, or (requireTariffRows) when no live tariff
 * rows are loaded for it — callers must surface that explicitly, never fall
 * back to another country.
 */
export async function getCountryForTenant(
  tenantId: string,
  db: PrismaClient = getUnscopedSystemPrisma(),
  opts: { requireTariffRows?: boolean } = {},
): Promise<CountryRecord> {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { countryCode: true },
  });
  if (!tenant) throw new CountryNotConfiguredError('?', 'missing-country');
  return getCountryByCode(tenant.countryCode, db, opts);
}

/** Resolve a country master row by ISO-2 code. */
export async function getCountryByCode(
  code: string,
  db: PrismaClient = getUnscopedSystemPrisma(),
  opts: { requireTariffRows?: boolean } = {},
): Promise<CountryRecord> {
  const country = await db.country.findUnique({ where: { code } });
  if (!country || !country.isActive) throw new CountryNotConfiguredError(code, 'missing-country');
  if (opts.requireTariffRows) {
    const rows = await db.nationalTariff.count({
      where: { countryCode: code, isActive: true },
    });
    if (rows === 0) throw new CountryNotConfiguredError(code, 'no-tariff-rows');
  }
  primeCountry(country);
  return country;
}

/**
 * Process-local country cache. Prompt builders and sync call sites read
 * countries through getCachedCountry; pipeline entry points (classifyLineItem,
 * intake override) prime it from the DB via getCountryByCode/resolveCountryByInput.
 */
const primedCountries = new Map<string, CountryRecord>();
const primedCountryNames = new Map<string, string>();

export function primeCountry(record: CountryRecord): void {
  primedCountries.set(record.code.toUpperCase(), record);
  primedCountryNames.set(record.name.trim().toLowerCase(), record.code.toUpperCase());
}

export function clearPrimedCountries(): void {
  primedCountries.clear();
  primedCountryNames.clear();
}

/** Sync lookup of a primed country by ISO-2 code or exact country name. */
export function getCachedCountry(input?: string): CountryRecord | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  const byCode = primedCountries.get(raw.toUpperCase());
  if (byCode) return byCode;
  const mapped = primedCountryNames.get(raw.toLowerCase());
  return (mapped && primedCountries.get(mapped)) || null;
}

/**
 * Resolve a country from free input (ISO-2 code or country name) against the
 * master row, validating it and (optionally) that its nomenclature is loaded.
 * Cache-first (hot paths and tests without a DB); falls back to a DB lookup
 * that also primes the cache. Never falls back to another country.
 */
export async function resolveCountryByInput(
  input: string,
  db: PrismaClient = getUnscopedSystemPrisma(),
  opts: { requireTariffRows?: boolean } = {},
): Promise<CountryRecord> {
  const raw = (input ?? '').trim();
  if (!raw) throw new CountryNotConfiguredError('?', 'missing-country');
  const cached = getCachedCountry(raw);
  if (cached) return cached;
  const country = await db.country.findFirst({
    where: {
      OR: [{ code: raw.toUpperCase() }, { name: { equals: raw, mode: 'insensitive' } }],
    },
  });
  if (!country) throw new CountryNotConfiguredError(raw, 'missing-country');
  return getCountryByCode(country.code, db, opts);
}

/**
 * Format a canonical (dotless) national code with the country's grouping,
 * e.g. formatNationalCode('8517629100', '4.2.2.2') → '8517.62.91.00'.
 * Returns the input unchanged when the digit count doesn't fit the grouping.
 */
export function formatNationalCode(raw: string, codeGrouping: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  const groups = codeGrouping.split('.').map((g) => Number.parseInt(g, 10));
  if (groups.length === 0 || groups.some((g) => !Number.isInteger(g) || g <= 0)) return raw;
  const total = groups.reduce((a, b) => a + b, 0);
  if (digits.length !== total) return raw;
  const parts: string[] = [];
  let cursor = 0;
  for (const size of groups) {
    parts.push(digits.slice(cursor, cursor + size));
    cursor += size;
  }
  return parts.join('.');
}

/** Digit-only form used for comparisons and lookups. */
export function nationalDigits(code: string): string {
  return code.replace(/[^0-9]/g, '');
}
