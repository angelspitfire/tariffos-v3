import { describe, expect, it } from 'vitest';

import { extractDatasheetClaims } from './datasheet.js';
import type { Source } from '../../domain/sheet.js';

const source: Source = { kind: 'datasheet', ref: 'DS-001' };

describe('extractDatasheetClaims (F2-19)', () => {
  it('extrae composición % como madeOf', () => {
    const claims = extractDatasheetClaims('composición: 70% algodón', source);
    const comp = claims.find((c) => c.target === 'madeOf' && c.value === '70%');
    expect(comp).toBeDefined();
    expect(comp?.method).toBe('rule');
    expect(comp?.source).toBe(source);
  });

  it('extrae CAS', () => {
    const claims = extractDatasheetClaims('CAS: 123-45-6', source);
    const cas = claims.find((c) => c.value === '123-45-6');
    expect(cas).toBeDefined();
  });

  it('extrae proceso como howMade', () => {
    const claims = extractDatasheetClaims('proceso: hilado', source);
    const proc = claims.find((c) => c.target === 'howMade');
    expect(proc?.value).toBe('hilado');
  });

  it('extrae uso como purpose', () => {
    const claims = extractDatasheetClaims('uso: vestir', source);
    const use = claims.find((c) => c.target === 'purpose');
    expect(use?.value).toBe('vestir');
  });

  it('todos los Claims llevan source y method rule', () => {
    const claims = extractDatasheetClaims('composición: 50% poliéster CAS: 111-22-3 proceso: tejido uso: tapizar', source);
    for (const c of claims) {
      expect(c.source).toBe(source);
      expect(c.method).toBe('rule');
    }
  });
});
