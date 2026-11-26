import { describe, expect, it } from 'vitest';
import { parseVeLegalRegimeCodes } from '../scripts/ve-regimen-parser';

describe('parseVeLegalRegimeCodes', () => {
  it('returns empty array for null, undefined, or strings without legal regimes', () => {
    expect(parseVeLegalRegimeCodes(null)).toEqual([]);
    expect(parseVeLegalRegimeCodes(undefined)).toEqual([]);
    expect(parseVeLegalRegimeCodes('')).toEqual([]);
    expect(parseVeLegalRegimeCodes('Ex.AEC: 40E. Unidad: u')).toEqual([]);
  });

  it('extracts comma-separated regime codes and ignores unrelated numbers', () => {
    expect(
      parseVeLegalRegimeCodes('Ex.AEC: 40E. Régimen Legal Importación: 5,6. Unidad: u'),
    ).toEqual([5, 6]);

    expect(
      parseVeLegalRegimeCodes('Régimen Legal Importación: 3, 12, 20. Ex.AEC: 15%.'),
    ).toEqual([3, 12, 20]);
  });

  it('handles Régimen Legal without Importación, deduplicates, sorts, and clamps to 1..21', () => {
    expect(parseVeLegalRegimeCodes('Régimen Legal: 21, 1, 21, 99, 0, 2')).toEqual([1, 2, 21]);
  });
});
