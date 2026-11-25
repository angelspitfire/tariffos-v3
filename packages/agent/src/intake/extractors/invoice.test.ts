import { describe, expect, it } from 'vitest';

import { extractInvoiceClaims } from './invoice.js';
import type { Source } from '../../domain/sheet.js';

const source: Source = { kind: 'invoice', ref: 'INV-001' };

describe('extractInvoiceClaims (F2-16)', () => {
  it('extrae monto y moneda con source', () => {
    const claims = extractInvoiceClaims('total 100.50 USD', source);
    const amount = claims.find((c) => c.target === null && c.unit === 'USD');
    expect(amount?.value).toBe('100.50');
    expect(amount?.method).toBe('rule');
    expect(amount?.source).toBe(source);
  });

  it('extrae cantidad', () => {
    const claims = extractInvoiceClaims('cantidad: 50 u', source);
    const qty = claims.find((c) => c.target === null && c.value === '50');
    expect(qty).toBeDefined();
    expect(qty?.unit).toBe('u');
  });

  it('extrae descripción declarada como what', () => {
    const claims = extractInvoiceClaims('descripción: camisa de algodón', source);
    const desc = claims.find((c) => c.target === 'what');
    expect(desc?.value).toBe('camisa de algodón');
  });

  it('todos los Claims tienen source y method rule', () => {
    const claims = extractInvoiceClaims('total 10 USD cantidad: 2 descripción: ropa', source);
    for (const c of claims) {
      expect(c.method).toBe('rule');
      expect(c.source).toBe(source);
    }
  });

  it('texto vacío devuelve vacío', () => {
    expect(extractInvoiceClaims('', source)).toEqual([]);
  });
});
