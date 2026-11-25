import { describe, expect, it } from 'vitest';

import { extractPackingClaims } from './packing.js';
import type { Source } from '../../domain/sheet.js';

const source: Source = { kind: 'packing', ref: 'PL-001' };

describe('extractPackingClaims (F2-17)', () => {
  it('extrae peso neto', () => {
    const claims = extractPackingClaims('peso neto: 12.5 kg', source);
    const net = claims.find((c) => c.value === '12.5' && c.unit === 'kg');
    expect(net).toBeDefined();
    expect(net?.method).toBe('rule');
    expect(net?.source).toBe(source);
  });

  it('extrae peso bruto', () => {
    const claims = extractPackingClaims('peso bruto: 15 kg', source);
    const gross = claims.find((c) => c.value === '15' && c.unit === 'kg');
    expect(gross).toBeDefined();
  });

  it('extrae bultos', () => {
    const claims = extractPackingClaims('bultos: 10 u', source);
    const pkg = claims.find((c) => c.value === '10');
    expect(pkg?.unit).toBe('u');
  });

  it('extrae presentación como presentation', () => {
    const claims = extractPackingClaims('presentación: granel', source);
    const pres = claims.find((c) => c.target === 'presentation');
    expect(pres?.value).toBe('granel');
  });

  it('todos los Claims llevan source', () => {
    const claims = extractPackingClaims('peso neto: 5 kg bultos: 2 presentación: retail', source);
    for (const c of claims) {
      expect(c.source).toBe(source);
      expect(c.method).toBe('rule');
    }
  });
});
