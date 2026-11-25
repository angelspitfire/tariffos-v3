import { describe, expect, it } from 'vitest';

import { GoodsSheetSchema, missingFields, requireComplete, SourceSchema } from './sheet.js';
import type { GoodsSheet, Source, SheetField } from './sheet.js';

function field(opts: {
  method: 'declared' | 'inferred' | 'absent';
  source?: Source | null;
  value?: string;
}): SheetField {
  return {
    value: opts.value ?? 'algodón',
    unit: null,
    source: opts.source ?? null,
    method: opts.method,
  };
}

const source: Source = { kind: 'invoice', ref: 'INV-001', page: 1, cell: 'A3' };

describe('GoodsSheet', () => {
  it('acepta una ficha completa con campos declarados que llevan fuente', () => {
    const sheet: GoodsSheet = {
      what: field({ method: 'declared', source, value: 'camisa de algodón' }),
      madeOf: field({ method: 'declared', source, value: '100 % algodón' }),
      howMade: field({ method: 'inferred', value: 'tejido' }),
      purpose: field({ method: 'absent' }),
      presentation: field({ method: 'absent' }),
    };
    const parsed = GoodsSheetSchema.parse(sheet);
    expect(parsed).toEqual(sheet);
  });

  it('rechaza un campo declared sin fuente', () => {
    const sheet: GoodsSheet = {
      what: field({ method: 'declared', source: null }),
      madeOf: field({ method: 'absent' }),
      howMade: field({ method: 'absent' }),
      purpose: field({ method: 'absent' }),
      presentation: field({ method: 'absent' }),
    };
    expect(() => GoodsSheetSchema.parse(sheet)).toThrow();
  });

  it('admite inferred y absent sin fuente', () => {
    const sheet: GoodsSheet = {
      what: field({ method: 'inferred', source: null }),
      madeOf: field({ method: 'absent', source: null }),
      howMade: field({ method: 'absent', source: null }),
      purpose: field({ method: 'absent', source: null }),
      presentation: field({ method: 'absent', source: null }),
    };
    expect(() => GoodsSheetSchema.parse(sheet)).not.toThrow();
  });

  it('SourceSchema exige kind válido y ref no vacío', () => {
    expect(() => SourceSchema.parse({ kind: 'invoice', ref: '' })).toThrow();
    expect(SourceSchema.parse({ kind: 'bol', ref: 'B/L 123' })).toMatchObject({
      kind: 'bol',
      ref: 'B/L 123',
    });
  });
});

describe('missingFields', () => {
  const sheet: GoodsSheet = {
    what: field({ method: 'declared', source }),
    madeOf: field({ method: 'absent' }),
    howMade: field({ method: 'absent' }),
    purpose: field({ method: 'inferred', value: 'vestir' }),
    presentation: field({ method: 'absent' }),
  };

  it('devuelve los campos con method absent', () => {
    expect(missingFields(sheet)).toEqual(['madeOf', 'howMade', 'presentation']);
  });
});

describe('requireComplete', () => {
  it('devuelve la ficha y no lanza cuando no faltan campos', () => {
    const sheet: GoodsSheet = {
      what: field({ method: 'declared', source }),
      madeOf: field({ method: 'declared', source }),
      howMade: field({ method: 'declared', source }),
      purpose: field({ method: 'declared', source }),
      presentation: field({ method: 'declared', source }),
    };
    const result = requireComplete(sheet);
    if ('sheet' in result) {
      expect(result.sheet).toBe(sheet);
    } else {
      throw new Error('no debe devolver missing');
    }
  });

  it('devuelve los nombres de los campos faltantes y no lanza', () => {
    const sheet: GoodsSheet = {
      what: field({ method: 'declared', source }),
      madeOf: field({ method: 'absent' }),
      howMade: field({ method: 'absent' }),
      purpose: field({ method: 'declared', source }),
      presentation: field({ method: 'declared', source }),
    };
    const result = requireComplete(sheet);
    if ('missing' in result) {
      expect(result.missing).toEqual(['madeOf', 'howMade']);
    } else {
      throw new Error('no debe devolver sheet');
    }
  });
});
