import { describe, expect, it } from 'vitest';

import {
  CASES_30,
  CASES_30_COUNT,
  FICHA_COVERAGE_TARGET,
  extractClaimsForCase,
  sheetForCase,
  coveragePercent,
  averageCoverage,
  checkCoverage,
  type CoverageCheck,
} from './fixtures-30.js';

describe('30 casos de texto libre (F2-35)', () => {
  it('tiene exactamente 30 casos', () => {
    expect(CASES_30).toHaveLength(CASES_30_COUNT);
  });

  it('cubre todos los tipos de documento', () => {
    const types = new Set(CASES_30.map((c) => c.docType));
    expect(types.has('invoice')).toBe(true);
    expect(types.has('packing')).toBe(true);
    expect(types.has('bol')).toBe(true);
    expect(types.has('datasheet')).toBe(true);
    expect(types.has('catalog')).toBe(true);
    expect(types.has('unknown')).toBe(true);
  });

  it('cada caso produce una GoodsSheet con los 5 campos', () => {
    for (const c of CASES_30) {
      const sheet = sheetForCase(c);
      expect(Object.keys(sheet).sort()).toEqual(['howMade', 'madeOf', 'presentation', 'purpose', 'what']);
    }
  });

  it('zero clasificaciones: ningún Claim contiene código arancelario', () => {
    const tariffPattern = /\b\d{4}(?:\.\d{2}){0,3}\b/;
    for (const c of CASES_30) {
      const claims = extractClaimsForCase(c);
      for (const claim of claims) {
        expect(tariffPattern.test(claim.value)).toBe(false);
      }
    }
  });

  it('cada caso tiene al menos un campo poblado', () => {
    for (const c of CASES_30) {
      const sheet = sheetForCase(c);
      const populated = Object.values(sheet).filter((f) => f.method !== 'absent');
      expect(populated.length).toBeGreaterThan(0);
    }
  });

  it('cobertura de ficha promedio ≥ 80%', () => {
    const avg = averageCoverage();
    expect(avg).toBeGreaterThanOrEqual(FICHA_COVERAGE_TARGET);
  });

  it('checkCoverage devuelve passed=true', () => {
    const result = checkCoverage();
    expect(result.passed).toBe(true);
    expect(result.average).toBeGreaterThanOrEqual(result.target);
  });

  it('coveragePercent devuelve 0-100 para cada caso', () => {
    for (const c of CASES_30) {
      const sheet = sheetForCase(c);
      const pct = coveragePercent(sheet);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });

  it('coverageCheck tiene forma válida', () => {
    const result: CoverageCheck = checkCoverage();
    expect(typeof result.average).toBe('number');
    expect(typeof result.target).toBe('number');
    expect(typeof result.passed).toBe('boolean');
    expect(result.perCase).toHaveLength(CASES_30_COUNT);
    for (const pc of result.perCase) {
      expect(typeof pc.id).toBe('string');
      expect(typeof pc.coverage).toBe('number');
      expect(pc.coverage).toBeGreaterThanOrEqual(0);
      expect(pc.coverage).toBeLessThanOrEqual(100);
    }
  });
});
