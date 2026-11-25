import { describe, expect, it } from 'vitest';

import { extractSheetClaims, type ExtractSheets } from './sheet-extract.js';
import type { MerceologicalSheet } from '@tariffos/shared-types';
import type { Source } from '../../domain/sheet.js';

const source: Source = { kind: 'text', ref: 'desc-1' };

const sheet: MerceologicalSheet = {
  nombreComercial: 'Camisa de algodón',
  morfologia: {
    materiaPrimaria: 'algodón',
    materiaSecundaria: 'poliéster',
    componentesCriticos: ['botones de nacar'],
  },
  funcionPrincipal: 'vestir',
  presentacionComercial: 'retail',
};

const extract: ExtractSheets = async () => [sheet];

describe('extractSheetClaims (F2-14)', () => {
  it('convierte cada campo de ficha en un Claim con method model', async () => {
    const claims = await extractSheetClaims(['camisa'], source, extract);
    expect(claims).toHaveLength(6);
    claims.forEach((c) => {
      expect(c.method).toBe('model');
      expect(c.source).toBe(source);
      expect(c.confidence).toBe('high');
    });
  });

  it('mapea nombreComercial a what', async () => {
    const claims = await extractSheetClaims(['camisa'], source, extract);
    const what = claims.find((c) => c.target === 'what');
    expect(what?.value).toBe('Camisa de algodón');
  });

  it('mapea materiaPrimaria y materiaSecundaria a madeOf', async () => {
    const claims = await extractSheetClaims(['camisa'], source, extract);
    const madeOf = claims.filter((c) => c.target === 'madeOf');
    expect(madeOf.map((c) => c.value).sort()).toEqual(['algodón', 'poliéster']);
  });

  it('mapea componentesCriticos a howMade', async () => {
    const claims = await extractSheetClaims(['camisa'], source, extract);
    const howMade = claims.find((c) => c.target === 'howMade');
    expect(howMade?.value).toBe('botones de nacar');
  });

  it('mapea funcionPrincipal a purpose', async () => {
    const claims = await extractSheetClaims(['camisa'], source, extract);
    const purpose = claims.find((c) => c.target === 'purpose');
    expect(purpose?.value).toBe('vestir');
  });

  it('mapea presentacionComercial a presentation', async () => {
    const claims = await extractSheetClaims(['camisa'], source, extract);
    const presentation = claims.find((c) => c.target === 'presentation');
    expect(presentation?.value).toBe('retail');
  });

  it('sheet nula no produce Claims', async () => {
    const extractNull: ExtractSheets = async () => [null];
    const claims = await extractSheetClaims(['x'], source, extractNull);
    expect(claims).toEqual([]);
  });

  it('campos vacíos no generan Claim', async () => {
    const empty: MerceologicalSheet = {
      nombreComercial: '',
      morfologia: { materiaPrimaria: '', componentesCriticos: [] },
      funcionPrincipal: '',
      presentacionComercial: '',
    };
    const extractEmpty: ExtractSheets = async () => [empty];
    const claims = await extractSheetClaims(['x'], source, extractEmpty);
    expect(claims).toEqual([]);
  });

  it('unit siempre null en Claims de sheet-extract', async () => {
    const claims = await extractSheetClaims(['camisa'], source, extract);
    claims.forEach((c) => expect(c.unit).toBeNull());
  });

  it('target nunca es un código arancelario', async () => {
    const claims = await extractSheetClaims(['camisa'], source, extract);
    for (const c of claims) {
      expect(['what', 'madeOf', 'howMade', 'purpose', 'presentation', null]).toContain(c.target);
    }
  });
});
