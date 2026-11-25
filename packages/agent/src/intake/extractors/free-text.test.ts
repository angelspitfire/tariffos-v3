import { describe, expect, it } from 'vitest';

import { extractFreeTextClaims } from './free-text.js';
import type { Source } from '../../domain/sheet.js';

const source: Source = { kind: 'text', ref: 'texto-libre-1' };

describe('extractFreeTextClaims (F2-15)', () => {
  it('«X de Y» produce what y madeOf con method rule', () => {
    const claims = extractFreeTextClaims('camisa de algodón', source);
    expect(claims).toHaveLength(2);
    claims.forEach((c) => {
      expect(c.method).toBe('rule');
      expect(c.source).toBe(source);
      expect(c.confidence).toBe('medium');
    });
    const what = claims.find((c) => c.target === 'what');
    const madeOf = claims.find((c) => c.target === 'madeOf');
    expect(what?.value).toBe('camisa');
    expect(madeOf?.value).toBe('algodón');
  });

  it('unidad arancelaria produce Claim sin target con unidad preservada', () => {
    const claims = extractFreeTextClaims('5 kg de acero', source);
    const qty = claims.find((c) => c.target === null && c.unit === 'kg');
    expect(qty).toBeDefined();
    expect(qty?.value).toBe('5 kg');
  });

  it('varias unidades se capturan todas', () => {
    const claims = extractFreeTextClaims('10 u y 2 m²', source);
    const units = claims.filter((c) => c.target === null);
    expect(units.map((c) => c.value).sort()).toEqual(['10 u', '2 m²']);
  });

  it('texto sin patrones devuelve vacío', () => {
    const claims = extractFreeTextClaims('producto sin estructura', source);
    expect(claims).toEqual([]);
  });

  it('todos los Claims llevan source y method rule', () => {
    const claims = extractFreeTextClaims('camisa de algodón 5 kg', source);
    for (const c of claims) {
      expect(c.method).toBe('rule');
      expect(c.source).toBe(source);
      expect(['what', 'madeOf', null]).toContain(c.target);
    }
  });
});
