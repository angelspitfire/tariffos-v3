/**
 * Extractor de factura (F2-16).
 *
 * Reglas sobre el texto de la factura: monto, moneda, cantidad y descripción
 * declarada. Cada campo con su source y method: 'rule'.
 */

import type { Claim } from '../../domain/intake.js';
import type { Source } from '../../domain/sheet.js';

const CONFIDENCE_RULE = 'medium' as const;

const PATTERN_AMOUNT = /(\d+(?:[.,]\d+)?)\s*(USD|EUR|BRL)\b/i;
const PATTERN_QUANTITY = /cantidad\s*:?\s*(\d+(?:[.,]\d+)?)\s*(u|un|und|kg)?/i;
/** Captura la descripción hasta el siguiente " - " o fin de línea. */
const PATTERN_DESCRIPTION = /descripci[oó]n\s*:?\s*([^-]+?)(?:\s*-\s*|$)/i;

function claim(
  value: string,
  unit: string | null,
  target: Claim['target'],
  source: Source,
): Claim {
  return { value, unit, target, source, method: 'rule', confidence: CONFIDENCE_RULE };
}

export function extractInvoiceClaims(text: string, source: Source): Claim[] {
  const claims: Claim[] = [];

  const amount = text.match(PATTERN_AMOUNT);
  if (amount) {
    claims.push(claim(amount[1], amount[2], null, source));
  }

  const quantity = text.match(PATTERN_QUANTITY);
  if (quantity) {
    claims.push(claim(quantity[1], quantity[2] ?? null, null, source));
  }

  const description = text.match(PATTERN_DESCRIPTION);
  if (description) {
    claims.push(claim(description[1].trim(), null, 'what', source));
  }

  return claims;
}
