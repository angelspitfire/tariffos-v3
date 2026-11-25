import { describe, expect, it } from 'vitest';

import { FIXTURES, FIXTURE_COUNT } from './fixtures.js';
import { extractInvoiceClaims } from './extractors/invoice.js';
import { extractPackingClaims } from './extractors/packing.js';
import { extractBolClaims } from './extractors/bol.js';
import { extractDatasheetClaims } from './extractors/datasheet.js';
import { extractFreeTextClaims } from './extractors/free-text.js';
import { guardNoTariffCodes } from './extractors/guard.js';
import { normalizeFields } from './normalize/fields.js';
import type { Claim } from '../domain/intake.js';
import type { Source } from '../domain/sheet.js';

const SOURCE: Source = { kind: 'text', ref: 'fixture-000' };

function extractByType(text: string, docType: string): Claim[] {
  let claims: Claim[] = [];
  switch (docType) {
    case 'invoice':
      claims = extractInvoiceClaims(text, SOURCE);
      break;
    case 'packing':
      claims = extractPackingClaims(text, SOURCE);
      break;
    case 'bol':
      claims = extractBolClaims(text, SOURCE);
      break;
    case 'datasheet':
      claims = extractDatasheetClaims(text, SOURCE);
      break;
    case 'catalog':
    case 'unknown':
    default:
      claims = extractFreeTextClaims(text, SOURCE);
      break;
  }
  return guardNoTariffCodes(claims);
}

describe('Fixtures de ingesta (F2-34)', () => {
  it('tiene 10+ fixtures', () => {
    expect(FIXTURE_COUNT).toBeGreaterThanOrEqual(10);
  });

  it.each(FIXTURES)('fixture %s produce claims sin códigos arancelarios', (fixture) => {
    const claims = extractByType(fixture.text, fixture.docType);
    for (const c of claims) {
      expect(/\b\d{4}(?:\.\d{2}){0,3}\b/.test(c.value)).toBe(false);
    }
  });

  it.each(FIXTURES)('fixture %s normaliza a GoodsSheet con 5 campos', (fixture) => {
    const claims = extractByType(fixture.text, fixture.docType);
    const sheet = normalizeFields(
      claims.map((c) => ({ value: c.value, unit: null, target: c.target, source: SOURCE, method: 'rule' as const, confidence: 'medium' as const })),
    );
    expect(Object.keys(sheet).sort()).toEqual(['howMade', 'madeOf', 'presentation', 'purpose', 'what']);
  });

  it('los tipos de documento cubren invoice, packing, bol, datasheet, catalog, unknown', () => {
    const types = new Set(FIXTURES.map((f) => f.docType));
    for (const t of ['invoice', 'packing', 'bol', 'datasheet', 'catalog', 'unknown'] as const) {
      expect(types.has(t)).toBe(true);
    }
  });

  it('todos los Claims extraídos pasan el guard de códigos arancelarios', () => {
    for (const fixture of FIXTURES) {
      const claims = extractByType(fixture.text, fixture.docType);
      for (const c of claims) {
        expect(/\b\d{4}(?:\.\d{2}){0,3}\b/.test(c.value)).toBe(false);
      }
    }
  });
});
