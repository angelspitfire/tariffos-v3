import { describe, expect, it } from 'vitest';

import { detectDocType, type DocType } from './doc-type.js';

const cases: Array<[string, DocType]> = [
  ['FACTURA NÚMERO 123 - CLIENTE ACME', 'invoice'],
  ['Invoice #12345', 'invoice'],
  ['facturación de servicios', 'invoice'],
  ['PACKING LIST - bultos: 10', 'packing'],
  ['lista de empaque del envío', 'packing'],
  ['BILL OF LADING - embarque marítimo', 'bol'],
  ['conocimiento de embarque B/L', 'bol'],
  ['FICHA TÉCNICA - composición: algodón 70%', 'datasheet'],
  ['datasheet del producto', 'datasheet'],
  ['CATÁLOGO OTOÑO 2026', 'catalog'],
  ['catalog de productos', 'catalog'],
];

describe('detectDocType (F2-05)', () => {
  it.each(cases)('detecta %s como %s', (texto, esperado) => {
    const det = detectDocType(texto);
    expect(det.type).toBe(esperado);
    expect(det.confidence).toBe('high');
    expect(det.matched.length).toBeGreaterThan(0);
  });

  it('lo desconocido entra como texto con confianza low', () => {
    const det = detectDocType('texto sin clasificación clara de documento');
    expect(det.type).toBe('unknown');
    expect(det.confidence).toBe('low');
    expect(det.matched).toEqual([]);
  });

  it('es insensible a mayúsculas', () => {
    expect(detectDocType('factura').type).toBe('invoice');
    expect(detectDocType('FACTURA').type).toBe('invoice');
    expect(detectDocType('Factura').type).toBe('invoice');
  });

  it('cuando hay varios, gana el con más coincidencias', () => {
    const det = detectDocType('factura invoice facturación');
    expect(det.type).toBe('invoice');
    expect(det.matched).toHaveLength(3);
  });
});
