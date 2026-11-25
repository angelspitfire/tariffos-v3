/**
 * Re-contrata `sheet-extract` (apps/filings) como extractor de Claim[].
 *
 * No reescribe sheet-extract: solo adapta su salida (MerceologicalSheet[])
 * a Claim[] con method: 'model'. Cada campo de ficha extraído se convierte
 * en un Claim con su target mapeado. La función de extracción real se inyecta
 * para evitar la dependencia circular apps/agent → apps/filings.
 *
 * source: el origen del documento del que partió sheet-extract.
 */

import type { Claim } from '../../domain/intake.js';
import type { MerceologicalSheet } from '@tariffos/shared-types';
import type { Source } from '../../domain/sheet.js';

type ExtractSheets = (
  descriptions: string[],
) => Promise<(MerceologicalSheet | null)[]>;

/** Mapeo de cada campo de MerceologicalSheet a su target de ficha. */
const FIELD_TARGET: Record<string, 'what' | 'madeOf' | 'howMade' | 'purpose' | 'presentation'> = {
  nombreComercial: 'what',
  materiaPrimaria: 'madeOf',
  materiaSecundaria: 'madeOf',
  componentesCriticos: 'howMade',
  funcionPrincipal: 'purpose',
  presentacionComercial: 'presentation',
};

const CONFIDENCE_MODEL = 'high' as const;

/**
 * Convierte una hoja merceológica en Claims, un campo por Claim.
 * Los campos vacíos o ausentes no generan Claim.
 */
function sheetToClaims(
  sheet: MerceologicalSheet,
  source: Source,
): Claim[] {
  const claims: Claim[] = [];

  const add = (value: string | undefined, target: Claim['target']): void => {
    if (!value) return;
    claims.push({
      value,
      unit: null,
      target,
      source,
      method: 'model',
      confidence: CONFIDENCE_MODEL,
    });
  };

  add(sheet.nombreComercial, 'what');
  add(sheet.morfologia.materiaPrimaria, 'madeOf');
  add(sheet.morfologia.materiaSecundaria, 'madeOf');
  sheet.morfologia.componentesCriticos.forEach((c) => add(c, 'howMade'));
  add(sheet.funcionPrincipal, 'purpose');
  add(sheet.presentacionComercial, 'presentation');

  return claims;
}

/**
 * Extrae Claims de una lista de descripciones usando sheet-extract.
 * Cada campo extraído se convierte en un Claim con method: 'model'.
 * source se asigna a todos los Claims de todas las hojas.
 */
export async function extractSheetClaims(
  descriptions: string[],
  source: Source,
  extract: ExtractSheets,
): Promise<Claim[]> {
  const sheets = await extract(descriptions);
  const claims: Claim[] = [];
  sheets.forEach((sheet) => {
    if (!sheet) return;
    claims.push(...sheetToClaims(sheet, source));
  });
  return claims;
}

export { FIELD_TARGET };
export type { ExtractSheets };
