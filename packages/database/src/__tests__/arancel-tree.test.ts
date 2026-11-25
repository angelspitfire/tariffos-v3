import { describe, expect, it } from 'vitest';

import { ancestryOf, clean, composeDocument } from '../arancel-tree.js';

/**
 * The 0101 subtree exactly as the decree prints it — grouping nodes at 5 and 8
 * digits, two leaves whose own text is identical ("Los demás").
 */
const O101: Array<[string, string]> = [
  ['0101', 'CABALLOS, ASNOS, MULOS Y BURDÉGANOS, VIVOS.'],
  ['01012', 'Caballos:'],
  ['01012100', 'Reproductores de raza pura:'],
  ['01012900', 'Los demás:'],
  ['0101210010', 'Para carreras'],
  ['0101210090', 'Los demás'],
  ['0101290010', 'Para carreras'],
  ['0101290090', 'Los demás'],
];

const byCode = new Map(O101);

describe('clean', () => {
  it('strips the dash markers and terminal punctuation of a decree fragment', () => {
    expect(clean('- - - Los demás:')).toBe('Los demás');
    expect(clean('CABALLOS, ASNOS, MULOS Y BURDÉGANOS, VIVOS.')).toBe(
      'CABALLOS, ASNOS, MULOS Y BURDÉGANOS, VIVOS',
    );
  });

  it('collapses whitespace and tolerates null/undefined', () => {
    expect(clean('  Reproductores   de raza pura  ')).toBe('Reproductores de raza pura');
    expect(clean(undefined as unknown as string)).toBe('');
  });
});

describe('ancestryOf', () => {
  it('returns only the prefixes the decree actually prints, shortest first', () => {
    // 01013 is not a row, so 0101300000's only ancestor is the 4-digit heading.
    expect(ancestryOf('0101300000', byCode)).toEqual([
      'CABALLOS, ASNOS, MULOS Y BURDÉGANOS, VIVOS.',
    ]);
    // Every level here is printed (4, 5, 8 digits).
    expect(ancestryOf('0101210010', byCode)).toEqual([
      'CABALLOS, ASNOS, MULOS Y BURDÉGANOS, VIVOS.',
      'Caballos:',
      'Reproductores de raza pura:',
    ]);
  });

  it('never includes the node itself', () => {
    expect(ancestryOf('0101', byCode)).toEqual([]);
  });
});

describe('composeDocument', () => {
  it('joins the chain with the ballot separator', () => {
    const doc = composeDocument(ancestryOf('0101210010', byCode), 'Para carreras');
    expect(doc).toBe(
      'CABALLOS, ASNOS, MULOS Y BURDÉGANOS, VIVOS › Caballos › Reproductores de raza pura › Para carreras',
    );
  });

  it('gives sibling leaves with identical own text different documents', () => {
    // This is the whole point: both leaves read "Los demás", but only the
    // ancestry tells them apart. The old flat ballot discarded it.
    const a = composeDocument(ancestryOf('0101210090', byCode), 'Los demás');
    const b = composeDocument(ancestryOf('0101290090', byCode), 'Los demás');
    expect(a).not.toBe(b);
    expect(a).toContain('Reproductores de raza pura');
    expect(b).not.toContain('Reproductores de raza pura');
  });

  it('collapses a wording that repeats its parent verbatim', () => {
    // 0101290090 ("Los demás") sits under 01012900 ("Los demás"): no repeat.
    const doc = composeDocument(ancestryOf('0101290090', byCode), 'Los demás');
    expect(doc).toBe('CABALLOS, ASNOS, MULOS Y BURDÉGANOS, VIVOS › Caballos › Los demás');
  });

  it('caps the document length', () => {
    const long = 'x'.repeat(5000);
    expect(composeDocument([long], 'y').length).toBeLessThanOrEqual(1000);
  });
});
