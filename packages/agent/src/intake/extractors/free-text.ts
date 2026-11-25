/**
 * Extractor de texto libre basado en reglas (F2-15).
 *
 * Aplica patrones deterministas sobre el texto crudo ANTES de llamar al
 * modelo: «X de Y» (identidad/material) y unidades arancelarias. Cada
 * hallazgo se convierte en un Claim con method: 'rule'. No usa el modelo.
 */

import type { Claim } from '../../domain/intake.js';
import type { Source } from '../../domain/sheet.js';

const CONFIDENCE_RULE = 'medium' as const;

/** «X de Y»: identidad y material (p. ej. «camisa de algodón»). */
const PATTERN_DE = /(.+?)\s+de\s+(.+)/i;

/** Número seguido de unidad arancelaria (p. ej. «5 kg», «10 u», «2 m²»). */
const PATTERN_UNIT =
  /(\d+(?:[.,]\d+)?)\s*(kg|u|m²|m³|ℓ)/i;

/**
 * Extrae Claims por reglas de un texto libre.
 *
 * - «X de Y» → Claim what=X y Claim madeOf=Y.
 * - «N unidad» → Claim sin target (observación de cantidad) con la unidad.
 */
export function extractFreeTextClaims(
  text: string,
  source: Source,
): Claim[] {
  const claims: Claim[] = [];
  const trimmed = text.trim();

  const deMatch = trimmed.match(PATTERN_DE);
  if (deMatch) {
    const [, what, madeOf] = deMatch;
    claims.push(
      { value: what.trim(), unit: null, target: 'what', source, method: 'rule', confidence: CONFIDENCE_RULE },
      { value: madeOf.trim(), unit: null, target: 'madeOf', source, method: 'rule', confidence: CONFIDENCE_RULE },
    );
  }

  let unitMatch: RegExpExecArray | null;
  const unitRegex = new RegExp(PATTERN_UNIT.source, 'gi');
  while ((unitMatch = unitRegex.exec(trimmed)) !== null) {
    const [, value, unit] = unitMatch;
    claims.push({
      value: `${value} ${unit}`,
      unit,
      target: null,
      source,
      method: 'rule',
      confidence: CONFIDENCE_RULE,
    });
  }

  return claims;
}
