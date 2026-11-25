import { describe, expect, it } from 'vitest';

import { PRECEDENCE, rank, winner } from './precedence.js';
import type { SheetFieldName } from '../../domain/sheet.js';

describe('PRECEDENCE (F2-26)', () => {
  it('es la única fuente de verdad: cubre los campos con orden', () => {
    const fields: SheetFieldName[] = ['what', 'madeOf', 'howMade', 'purpose', 'presentation'];
    for (const f of fields) {
      expect(Array.isArray(PRECEDENCE[f])).toBe(true);
    }
  });

  it('identidad: gana factura, luego ficha técnica, nunca packing', () => {
    expect(rank('invoice', 'what')).toBe(0);
    expect(rank('datasheet', 'what')).toBe(1);
    expect(rank('packing', 'what')).toBe(2);
    expect(rank('bol', 'what')).toBe(3); // no listado → último
  });

  it('composición: gana ficha técnica, luego packing, nunca factura', () => {
    expect(rank('datasheet', 'madeOf')).toBe(0);
    expect(rank('packing', 'madeOf')).toBe(1);
    expect(rank('invoice', 'madeOf')).toBe(2);
  });

  it('función/uso: gana ficha técnica, luego catálogo, nunca factura', () => {
    expect(rank('datasheet', 'purpose')).toBe(0);
    expect(rank('catalog', 'purpose')).toBe(1);
    expect(rank('invoice', 'purpose')).toBe(2);
  });

  it('presentación: gana packing, luego factura, nunca catálogo', () => {
    expect(rank('packing', 'presentation')).toBe(0);
    expect(rank('invoice', 'presentation')).toBe(1);
    expect(rank('catalog', 'presentation')).toBe(2);
  });

  it('howMade sin orden: todas las fuentes empatan al final', () => {
    expect(rank('invoice', 'howMade')).toBe(0);
    expect(rank('bol', 'howMade')).toBe(0);
  });

  it('winner devuelve la fuente de mayor precedencia', () => {
    expect(winner('invoice', 'packing', 'what')).toBe('invoice');
    expect(winner('datasheet', 'invoice', 'what')).toBe('invoice');
    expect(winner('invoice', 'datasheet', 'madeOf')).toBe('datasheet');
  });

  it('winner devuelve null en empate', () => {
    expect(winner('invoice', 'invoice', 'what')).toBeNull();
    expect(winner('bol', 'catalog', 'howMade')).toBeNull();
  });
});
