import { digits } from '../util/code.js';

const SECTION_RANGES: Array<{ min: number; max: number; path: string }> = [
  { min: 1, max: 5, path: 'SEC-I' },
  { min: 6, max: 14, path: 'SEC-II' },
  { min: 15, max: 15, path: 'SEC-III' },
  { min: 16, max: 24, path: 'SEC-IV' },
  { min: 25, max: 27, path: 'SEC-V' },
  { min: 28, max: 38, path: 'SEC-VI' },
  { min: 39, max: 40, path: 'SEC-VII' },
  { min: 41, max: 43, path: 'SEC-VIII' },
  { min: 44, max: 46, path: 'SEC-IX' },
  { min: 47, max: 49, path: 'SEC-X' },
  { min: 50, max: 63, path: 'SEC-XI' },
  { min: 64, max: 67, path: 'SEC-XII' },
  { min: 68, max: 70, path: 'SEC-XIII' },
  { min: 71, max: 71, path: 'SEC-XIV' },
  { min: 72, max: 83, path: 'SEC-XV' },
  { min: 84, max: 85, path: 'SEC-XVI' },
  { min: 86, max: 89, path: 'SEC-XVII' },
  { min: 90, max: 92, path: 'SEC-XVIII' },
  { min: 93, max: 93, path: 'SEC-XIX' },
  { min: 94, max: 96, path: 'SEC-XX' },
  { min: 97, max: 97, path: 'SEC-XXI' },
  { min: 98, max: 98, path: 'SEC-XXII' },
];

/**
 * Maps a 2-digit HS chapter or full tariff code (`8471.30.90.90` -> `SEC-XVI`)
 * to the canonical `LegalKnowledgeParent.hierarchyPath` section identifier.
 */
export function chapterToSectionPath(chapterOrHs: string): string | null {
  const cleanDigits = digits(chapterOrHs);
  if (cleanDigits.length < 2) {
    return null;
  }

  const chapterNum = Number.parseInt(cleanDigits.slice(0, 2), 10);
  if (!Number.isFinite(chapterNum)) {
    return null;
  }

  const found = SECTION_RANGES.find(
    (range) => chapterNum >= range.min && chapterNum <= range.max,
  );
  return found?.path ?? null;
}
