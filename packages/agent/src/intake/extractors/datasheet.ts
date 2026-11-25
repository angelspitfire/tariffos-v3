/**
 * Extractor de ficha técnica (datasheet) (F2-19).
 *
 * Reglas sobre el texto de la ficha técnica: composición en %, CAS, proceso
 * y uso. Cada campo con su source y method: 'rule'.
 */

import type { Claim } from '../../domain/intake.js';
import type { Source } from '../../domain/sheet.js';

const CONFIDENCE_RULE = 'medium' as const;

const PATTERN_COMPOSITION = /(\d+(?:[.,]\d+)?)\s*%\s*(.+)/i;
const PATTERN_CAS = /CAS\s*:?\s*(\d{2,7}-\d{2}-\d)/i;
const PATTERN_PROCESS = /proceso\s*:?\s*(.+)/i;
const PATTERN_USE = /uso\s*:?\s*(.+)/i;

function claim(
  value: string,
  unit: string | null,
  target: Claim['target'],
  source: Source,
): Claim {
  return { value, unit, target, source, method: 'rule', confidence: CONFIDENCE_RULE };
}

export function extractDatasheetClaims(text: string, source: Source): Claim[] {
  const claims: Claim[] = [];

  const composition = text.match(PATTERN_COMPOSITION);
  if (composition) {
    claims.push(claim(`${composition[1]}%`, null, 'madeOf', source));
  }

  const cas = text.match(PATTERN_CAS);
  if (cas) {
    claims.push(claim(cas[1], null, null, source));
  }

  const process = text.match(PATTERN_PROCESS);
  if (process) {
    claims.push(claim(process[1].trim(), null, 'howMade', source));
  }

  const use = text.match(PATTERN_USE);
  if (use) {
    claims.push(claim(use[1].trim(), null, 'purpose', source));
  }

  return claims;
}
