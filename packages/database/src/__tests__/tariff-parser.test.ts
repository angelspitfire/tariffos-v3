import { describe, expect, it } from 'vitest';
import { parseTariffSchedule } from '../ingestion/tariff-parser';

const VE_COUNTRY = {
  code: 'VE',
  nomenclatureDigits: 10,
  codeGrouping: '4.2.2.2',
};

const MX_COUNTRY = {
  code: 'MX',
  nomenclatureDigits: 8,
  codeGrouping: '4.2.2',
};

describe('tariff-parser', () => {
  it('parses UTF-8 BOM CSV with quoted descriptions and validates VE 10-digit codes + BK/BIT', () => {
    const csv =
      '\uFEFFhsCode,description,adValorem,iva,aec,legalNotes\n' +
      '"8504","Transformadores eléctricos, convertidores estáticos",0,16,,\n' +
      '"8504.40.90.00","Convertidores estáticos ""Los demás""",14,16,14% BK,"RL 20"\n' +
      '"8471.30.90.90","Computadores portátiles",0,16,0% BIT,\n';

    const result = parseTariffSchedule(csv, 'tariff_csv', VE_COUNTRY);
    expect(result.errors).toEqual([]);
    expect(result.leafCount).toBe(2);
    expect(result.rows).toHaveLength(3);

    const converter = result.rows.find((r) => r.hsCode === '8504409000');
    expect(converter).toMatchObject({
      hsCode: '8504409000',
      formattedCode: '8504.40.90.00',
      adValorem: 14,
      iva: 16,
      isBK: true,
      isBIT: false,
      isLeaf: true,
      legalNotes: 'RL 20',
    });
    expect(converter?.composedDocument).toContain('Transformadores eléctricos');
    expect(converter?.composedDocument).toContain('Convertidores estáticos');

    const laptop = result.rows.find((r) => r.hsCode === '8471309090');
    expect(laptop?.isBIT).toBe(true);
    expect(laptop?.isBK).toBe(false);
  });

  it('supports ArancelArtifact JSON format and multi-country MX 8-digit validation', () => {
    const artifactJson = JSON.stringify({
      schemaVersion: '1.0',
      rows: [
        {
          code: '8517.62.91',
          digits: '85176291',
          description: 'Enrutadores inalámbricos',
          aec: '5',
          iva: '16',
          regimenImportacion: [],
        },
      ],
    });

    const mxResult = parseTariffSchedule(artifactJson, 'tariff_json', MX_COUNTRY);
    expect(mxResult.errors).toEqual([]);
    expect(mxResult.leafCount).toBe(1);
    expect(mxResult.rows[0]).toMatchObject({
      hsCode: '85176291',
      formattedCode: '8517.62.91',
      adValorem: 5,
      iva: 16,
      isLeaf: true,
    });

    const invalidCsv = 'hsCode,description,adValorem,iva\n"123456789012","Too long",-5,16\n';
    const invalidResult = parseTariffSchedule(invalidCsv, 'tariff_csv', VE_COUNTRY);
    expect(invalidResult.errors.length).toBeGreaterThanOrEqual(1);
    expect(invalidResult.rows).toHaveLength(0);
  });
});
