import { describe, expect, it } from 'vitest';

import { normalizeUnitForClaim } from './units.js';
import type { Claim } from '../../domain/intake.js';

function claim(overrides: Partial<Claim> = {}): Claim {
  return {
    value: '10 kg',
    unit: 'kg',
    target: 'madeOf',
    source: { kind: 'invoice', ref: 'INV-001' },
    method: 'rule',
    confidence: 'high',
    ...overrides,
  };
}

describe('normalizeUnitForClaim (F2-24)', () => {
  it('known unit → declared value matches arancel unit', () => {
    const result = normalizeUnitForClaim(claim({ unit: 'kg' }).unit);
    expect(result.declared).toBe('kg');
    expect(result.original).toBe('kg');
  });

  it('unknown unit → declared null, original preserved', () => {
    const result = normalizeUnitForClaim(claim({ unit: 'xyz' }).unit);
    expect(result.declared).toBeNull();
    expect(result.original).toBe('xyz');
  });

  it('null input unit → both declared and original null', () => {
    const result = normalizeUnitForClaim(claim({ unit: null }).unit);
    expect(result.declared).toBeNull();
    expect(result.original).toBeNull();
  });

  it('original unit is always preserved', () => {
    const result = normalizeUnitForClaim(claim({ unit: 'u' }).unit);
    expect(result.original).toBe('u');
  });

  it('unit "2u" is recognized as declared', () => {
    const result = normalizeUnitForClaim(claim({ unit: '2u' }).unit);
    expect(result.declared).toBe('2u');
  });

  it('unit "1000 u" is recognized as declared', () => {
    const result = normalizeUnitForClaim(claim({ unit: '1000 u' }).unit);
    expect(result.declared).toBe('1000 u');
  });

  it('unit "ℓ" is recognized as declared', () => {
    const result = normalizeUnitForClaim(claim({ unit: 'ℓ' }).unit);
    expect(result.declared).toBe('ℓ');
  });
});
