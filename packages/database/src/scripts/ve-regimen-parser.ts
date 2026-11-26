import { REGIMEN_REQUIREMENTS } from './ve-regimen-requirements';

const REGIME_SEGMENT_PATTERN =
  /R[ée]gimen\s+Legal(?:\s+Importaci[oó]n)?\s*:\s*([0-9,\s]+)/i;

/**
 * Extracts deduplicated, sorted Venezuela Decree 4.944 legal regime codes (1..21)
 * from the `NationalTariff.legalNotes` summary string.
 */
export function parseVeLegalRegimeCodes(legalNotes: string | null | undefined): number[] {
  if (!legalNotes || !legalNotes.trim()) {
    return [];
  }

  const match = REGIME_SEGMENT_PATTERN.exec(legalNotes);
  if (!match?.[1]) {
    return [];
  }

  const codes = new Set<number>();
  for (const token of match[1].split(',')) {
    const parsed = Number.parseInt(token.trim(), 10);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 21 && parsed in REGIMEN_REQUIREMENTS) {
      codes.add(parsed);
    }
  }

  return Array.from(codes).sort((a, b) => a - b);
}
