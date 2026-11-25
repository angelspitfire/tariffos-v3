/**
 * Guarda: sin códigos arancelarios en ningún extractor (F2-20).
 *
 * Descarta cualquier Claim cuyo valor coincida con un patrón arancelario
 * (4+ dígitos, opcionalmente con grupos .NN) y registra el descarte. Los
 * extractores deben pasar sus Claims por este filtro antes de devolverlos.
 */

import type { Claim } from '../../domain/intake.js';
import { Logger, logger } from '@tariffos/logger';

/** Códigos arancelarios: 4+ dígitos, opcionalmente con grupos .NN (ej. 8708.29.00.00). */
export const TARIFF_CODE_PATTERN = /\b\d{4}(?:\.\d{2}){0,3}\b/;

/**
 * Filtra Claims que contengan un código arancelario en su valor.
 *
 * Devuelve solo los Claims limpios. Cada descarte se registra con el valor
 * y el target al que iba asignado.
 */
export function guardNoTariffCodes(
  claims: Claim[],
  log: Logger = logger,
): Claim[] {
  const kept: Claim[] = [];
  for (const claim of claims) {
    if (TARIFF_CODE_PATTERN.test(claim.value)) {
      log.warn('claim.descartado_codigo_arancelario', {
        scope: 'extractors.guard',
        value: claim.value,
        target: claim.target,
        method: claim.method,
      });
      continue;
    }
    kept.push(claim);
  }
  return kept;
}
