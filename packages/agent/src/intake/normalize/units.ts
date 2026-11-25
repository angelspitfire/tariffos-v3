/**
 * Normalizador de unidades (F2-24).
 *
 * Convierte una unidad cualquiera a la unidad arancelaria declarada usando
 * el vocabulario de unidades, y conserva la unidad original para trazabilidad.
 */

import type { Unit } from './vocab.js';
import { normalizeUnit } from './vocab.js';

export interface UnitConversion {
  declared: Unit | null;   // unidad arancelaria declarada (null si desconocida)
  original: string | null; // unidad tal como apareció en el texto
}

/**
 * Normaliza la unidad de un Claim. Devuelve la unidad arancelaria declarada
 * y la unidad original. Si la unidad es desconocida, declared es null.
 */
export function normalizeUnitForClaim(unit: string | null): UnitConversion {
  if (!unit) {
    return { declared: null, original: null };
  }
  const normalized = normalizeUnit(unit);
  return {
    declared: normalized.normalized === 'unknown' ? null : normalized.normalized,
    original: unit,
  };
}
