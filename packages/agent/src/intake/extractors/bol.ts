/**
 * Extractor de conocimiento de embarque (B/L) (F2-18).
 *
 * Reglas sobre el texto del B/L: origen, destino, modo y bultos. Cada campo
 * con su source y method: 'rule'.
 */

import type { Claim } from '../../domain/intake.js';
import type { Source } from '../../domain/sheet.js';

const CONFIDENCE_RULE = 'medium' as const;

const PATTERN_ORIGIN = /origen\s*:?\s*(.+)/i;
const PATTERN_DESTINATION = /destino\s*:?\s*(.+)/i;
const PATTERN_MODE = /modo\s*:?\s*(.+)/i;
const PATTERN_PACKAGES = /bultos\s*:?\s*(\d+)\s*(u|un|und)?/i;

function claim(
  value: string,
  unit: string | null,
  target: Claim['target'],
  source: Source,
): Claim {
  return { value, unit, target, source, method: 'rule', confidence: CONFIDENCE_RULE };
}

export function extractBolClaims(text: string, source: Source): Claim[] {
  const claims: Claim[] = [];

  const origin = text.match(PATTERN_ORIGIN);
  if (origin) {
    claims.push(claim(origin[1].trim(), null, null, source));
  }

  const destination = text.match(PATTERN_DESTINATION);
  if (destination) {
    claims.push(claim(destination[1].trim(), null, null, source));
  }

  const mode = text.match(PATTERN_MODE);
  if (mode) {
    claims.push(claim(mode[1].trim(), null, null, source));
  }

  const packages = text.match(PATTERN_PACKAGES);
  if (packages) {
    claims.push(claim(packages[1], packages[2] ?? null, null, source));
  }

  return claims;
}
