/**
 * Extractor de packing list (F2-17).
 *
 * Reglas sobre el texto del packing list: peso neto, peso bruto, bultos y
 * presentación. Cada campo con su source y method: 'rule'.
 */

import type { Claim } from '../../domain/intake.js';
import type { Source } from '../../domain/sheet.js';

const CONFIDENCE_RULE = 'medium' as const;

const PATTERN_NET_WEIGHT = /peso\s+neto\s*:?\s*(\d+(?:[.,]\d+)?)\s*(kg|g|lb)?/i;
const PATTERN_GROSS_WEIGHT = /peso\s+bruto\s*:?\s*(\d+(?:[.,]\d+)?)\s*(kg|g|lb)?/i;
const PATTERN_PACKAGES = /bultos\s*:?\s*(\d+)\s*(u|un|und)?/i;
const PATTERN_PRESENTATION = /presentaci[oó]n\s*:?\s*(.+)/i;

function claim(
  value: string,
  unit: string | null,
  target: Claim['target'],
  source: Source,
): Claim {
  return { value, unit, target, source, method: 'rule', confidence: CONFIDENCE_RULE };
}

export function extractPackingClaims(text: string, source: Source): Claim[] {
  const claims: Claim[] = [];

  const net = text.match(PATTERN_NET_WEIGHT);
  if (net) {
    claims.push(claim(net[1], net[2] ?? null, null, source));
  }

  const gross = text.match(PATTERN_GROSS_WEIGHT);
  if (gross) {
    claims.push(claim(gross[1], gross[2] ?? null, null, source));
  }

  const packages = text.match(PATTERN_PACKAGES);
  if (packages) {
    claims.push(claim(packages[1], packages[2] ?? null, null, source));
  }

  const presentation = text.match(PATTERN_PRESENTATION);
  if (presentation) {
    claims.push(claim(presentation[1].trim(), null, 'presentation', source));
  }

  return claims;
}
