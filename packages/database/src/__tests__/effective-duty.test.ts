import { describe, expect, it } from 'vitest';
import {
  resolveEffectiveTariffDuty,
  sanitizeStatisticalUnit,
} from '../ingestion/effective-duty';

describe('effective-duty (Mercosur / NCM multi-country)', () => {
  it('applies immediate national exception ("E") over community AEC rate (sugar 1701.99 & fertilizer 3824.99)', () => {
    const sugar = resolveEffectiveTariffDuty({ aec: '16', exAec: '98E' });
    expect(sugar).toEqual({
      effectiveRate: 98,
      baseRate: 16,
      exceptionCode: '98E',
      isBK: false,
      isBIT: false,
    });

    const micronutrientFertilizer = resolveEffectiveTariffDuty({ aec: '14', exAec: '0E' });
    expect(micronutrientFertilizer).toEqual({
      effectiveRate: 0,
      baseRate: 14,
      exceptionCode: '0E',
      isBK: false,
      isBIT: false,
    });
  });

  it('preserves base AEC rate when exception is conditional aeronautical ("A") rather than immediate ("E")', () => {
    const aero = resolveEffectiveTariffDuty({ aec: '14', exAec: '0A' });
    expect(aero).toEqual({
      effectiveRate: 14,
      baseRate: 14,
      exceptionCode: '0A',
      isBK: false,
      isBIT: false,
    });
  });

  it('detects BK and BIT flags while ignoring PDF page-header artifacts like "(3)" or "(4)"', () => {
    expect(resolveEffectiveTariffDuty({ aec: '14BK', exAec: null })).toEqual({
      effectiveRate: 14,
      baseRate: 14,
      exceptionCode: null,
      isBK: true,
      isBIT: false,
    });

    expect(resolveEffectiveTariffDuty({ aec: '0% BIT', exAec: '(3)' })).toEqual({
      effectiveRate: 0,
      baseRate: 0,
      exceptionCode: null,
      isBK: false,
      isBIT: true,
    });

    expect(resolveEffectiveTariffDuty({ aec: '(3)', exAec: '(4)' })).toEqual({
      effectiveRate: 0,
      baseRate: null,
      exceptionCode: null,
      isBK: false,
      isBIT: false,
    });
  });

  it('sanitizes official statistical/physical units and strips PDF column markers like "(7)"', () => {
    expect(sanitizeStatisticalUnit('kg')).toBe('kg');
    expect(sanitizeStatisticalUnit(' 2u ')).toBe('2u');
    expect(sanitizeStatisticalUnit('m2')).toBe('m2');
    expect(sanitizeStatisticalUnit('(7)')).toBeNull();
    expect(sanitizeStatisticalUnit('')).toBeNull();
    expect(sanitizeStatisticalUnit(null)).toBeNull();
  });
});
