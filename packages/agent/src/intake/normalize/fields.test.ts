import { describe, expect, it } from 'vitest';

import { normalizeFields } from './fields.js';
import type { Claim } from '../../domain/intake.js';
import type { Source } from '../../domain/sheet.js';

const sourceInvoice: Source = { kind: 'invoice', ref: 'INV-001' };
const sourcePacking: Source = { kind: 'packing', ref: 'PL-001' };

function claim(value: string, target: 'what' | 'madeOf' | 'howMade' | 'purpose' | 'presentation', source: Source, method: Claim['method'] = 'rule'): Claim {
  return { value, unit: null, target, source, method, confidence: 'medium' };
}

describe('normalizeFields (F2-25)', () => {
  it('sin claims todos los campos son absent', () => {
    const sheet = normalizeFields([]);
    for (const field of ['what', 'madeOf', 'howMade', 'purpose', 'presentation'] as const) {
      expect(sheet[field].method).toBe('absent');
      expect(sheet[field].source).toBeNull();
    }
  });

  it('un claim llena su campo con source y method declared', () => {
    const sheet = normalizeFields([claim('camisa', 'what', sourceInvoice)]);
    expect(sheet.what).toEqual({ value: 'camisa', unit: null, source: sourceInvoice, method: 'declared' });
    expect(sheet.madeOf.method).toBe('absent');
  });

  it('method model → inferred', () => {
    const sheet = normalizeFields([claim('algodón', 'madeOf', sourceInvoice, 'model')]);
    expect(sheet.madeOf.method).toBe('inferred');
  });

  it('entre varias afirmaciones gana mayor precedencia (factura > packing para what)', () => {
    const sheet = normalizeFields([
      claim('ropa', 'what', sourcePacking),
      claim('camisa', 'what', sourceInvoice),
    ]);
    expect(sheet.what.value).toBe('camisa');
    expect(sheet.what.source).toBe(sourceInvoice);
  });

  it('unidad se preserva en el campo', () => {
    // what with unit null here; test via madeOf with unit
    const sheet2 = normalizeFields([{ value: '5', unit: 'kg', target: 'madeOf', source: sourceInvoice, method: 'rule', confidence: 'medium' }]);
    expect(sheet2.madeOf.unit).toBe('kg');
  });

  it('target null no llena ningún campo', () => {
    const sheet = normalizeFields([{ value: 'x', unit: null, target: null, source: sourceInvoice, method: 'rule', confidence: 'medium' }]);
    for (const field of ['what', 'madeOf', 'howMade', 'purpose', 'presentation'] as const) {
      expect(sheet[field].method).toBe('absent');
    }
  });

  it('devuelve un GoodsSheet válido con los cinco campos', () => {
    const sheet = normalizeFields([]);
    expect(Object.keys(sheet).sort()).toEqual(['howMade', 'madeOf', 'presentation', 'purpose', 'what']);
  });
});
