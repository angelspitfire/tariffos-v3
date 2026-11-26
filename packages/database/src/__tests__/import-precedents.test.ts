import { describe, expect, it } from 'vitest';
import { parseHistoricalPrecedents } from '../scripts/precedent-parser';

describe('parseHistoricalPrecedents', () => {
  it('normalizes 10-digit compact or dotted HS codes and deduplicates JSON rows', () => {
    const raw = JSON.stringify([
      {
        sku: 'MBP-14',
        description: 'MacBook Pro 14 M3',
        hsCode: '8471309090',
        originCountry: 'CN',
        notes: 'Validado SENIAT',
      },
      {
        sku: 'MBP-14-V2',
        description: 'macbook pro 14 m3',
        hsCode: '8471.30.90.90',
      },
      { description: 'Sin código', hsCode: 'abc' },
    ]);

    expect(parseHistoricalPrecedents(raw, 'json')).toEqual([
      {
        sku: 'MBP-14-V2',
        description: 'macbook pro 14 m3',
        hsCode: '8471.30.90.90',
        originCountry: undefined,
        notes: undefined,
        confidence: 0.99,
      },
    ]);
  });

  it('parses Spanish or English CSV headers with quoted descriptions', () => {
    const csv = [
      'sku,descripcion,codigo,origen,notas',
      'INV-5KW,"Inversor solar híbrido, 5kW",8504.40.90.00,CN,Factura #102',
      'RELOJ-9,Apple Watch Series 9,9102190000,CN,',
    ].join('\n');

    expect(parseHistoricalPrecedents(csv, 'csv')).toEqual([
      {
        sku: 'INV-5KW',
        description: 'Inversor solar híbrido, 5kW',
        hsCode: '8504.40.90.00',
        originCountry: 'CN',
        notes: 'Factura #102',
        confidence: 0.99,
      },
      {
        sku: 'RELOJ-9',
        description: 'Apple Watch Series 9',
        hsCode: '9102.19.00.00',
        originCountry: 'CN',
        notes: undefined,
        confidence: 0.99,
      },
    ]);
  });
});
