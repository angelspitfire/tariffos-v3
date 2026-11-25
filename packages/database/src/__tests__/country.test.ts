import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CountryNotConfiguredError,
  clearPrimedCountries,
  formatNationalCode,
  getCachedCountry,
  nationalDigits,
  primeCountry,
  resolveCountryByInput,
  type CountryRecord,
} from '../country';

const VE: CountryRecord = {
  code: 'VE',
  name: 'Venezuela',
  legislation: 'Decreto 4.944 (Gaceta Oficial Extraordinaria N° 6.804)',
  nomenclatureDigits: 10,
  codeGrouping: '4.2.2.2',
  datasetVersion: null,
  isActive: true,
};

afterEach(() => {
  clearPrimedCountries();
});

describe('formatNationalCode', () => {
  it('groups a dotless national code with the country grouping', () => {
    expect(formatNationalCode('8517624100', '4.2.2.2')).toBe('8517.62.41.00');
  });

  it('is idempotent for already-dotted codes', () => {
    expect(formatNationalCode('8517.62.41.00', '4.2.2.2')).toBe('8517.62.41.00');
  });

  it('returns the input unchanged when it does not fit the grouping', () => {
    expect(formatNationalCode('210690', '4.2.2.2')).toBe('210690');
    expect(formatNationalCode('8517624100', '')).toBe('8517624100');
    expect(formatNationalCode('8517624100', 'x.y')).toBe('8517624100');
  });
});

describe('nationalDigits', () => {
  it('strips every non-digit for comparisons', () => {
    expect(nationalDigits('8517.62.41.00')).toBe('8517624100');
    expect(nationalDigits('8517624100')).toBe('8517624100');
  });
});

describe('country cache', () => {
  it('resolves primed countries by ISO-2 code and by exact name', () => {
    primeCountry(VE);
    expect(getCachedCountry('ve')?.code).toBe('VE');
    expect(getCachedCountry('Venezuela')?.code).toBe('VE');
    expect(getCachedCountry('MX')).toBeNull();
    expect(getCachedCountry()).toBeNull();
  });

  it('resolveCountryByInput is cache-first and never touches the DB', async () => {
    primeCountry(VE);
    const db = { country: { findFirst: vi.fn() } } as never;
    await expect(resolveCountryByInput('VE', db)).resolves.toMatchObject({ code: 'VE' });
    await expect(resolveCountryByInput('Venezuela', db)).resolves.toMatchObject({ code: 'VE' });
    expect((db as unknown as { country: { findFirst: ReturnType<typeof vi.fn> } }).country.findFirst).not.toHaveBeenCalled();
  });

  it('falls back to the master row, primes the cache, and rejects unknown countries', async () => {
    const findFirst = vi.fn().mockResolvedValueOnce(VE).mockResolvedValueOnce(null);
    const db = {
      country: { findFirst, findUnique: vi.fn().mockResolvedValue(VE) },
      nationalTariff: { count: vi.fn().mockResolvedValue(3) },
    } as never;

    await expect(resolveCountryByInput('ve', db)).resolves.toMatchObject({ code: 'VE' });
    expect(findFirst).toHaveBeenCalledTimes(1);
    // Primed by the fallback: a second call is served from the cache.
    await expect(resolveCountryByInput('VE', db)).resolves.toMatchObject({ code: 'VE' });
    expect(findFirst).toHaveBeenCalledTimes(1);

    await expect(resolveCountryByInput('ZZ', db)).rejects.toBeInstanceOf(CountryNotConfiguredError);
  });

  it('throws CountryNotConfiguredError when the nomenclature is not loaded', async () => {
    const db = {
      country: { findFirst: vi.fn().mockResolvedValueOnce(VE), findUnique: vi.fn().mockResolvedValue(VE) },
      nationalTariff: { count: vi.fn().mockResolvedValue(0) },
    } as never;

    await expect(resolveCountryByInput('VE', db, { requireTariffRows: true })).rejects.toMatchObject({
      name: 'CountryNotConfiguredError',
      countryCode: 'VE',
    });
  });
});
