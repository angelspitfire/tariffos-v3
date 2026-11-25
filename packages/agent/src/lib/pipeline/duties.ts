import type { DeterministicDuties } from '@tariffos/shared-types';
import type { TariffCandidateRecord } from './types.js';

const PERCENT_DIVISOR = 100;
const CURRENCY_DECIMALS = 2;

function roundCurrency(value: number): number {
  const factor = 10 ** CURRENCY_DECIMALS;
  return Math.round(value * factor) / factor;
}

/**
 * Pure deterministic customs duty calculator (never delegated to an LLM).
 */
export function calculateDeterministicDuties(
  cifValue: number,
  tariff: Pick<TariffCandidateRecord, 'adValoremRate' | 'ivaRate' | 'unit'>,
): DeterministicDuties {
  const safeCif = Math.max(0, cifValue);
  const arancelAmount = roundCurrency(safeCif * (tariff.adValoremRate / PERCENT_DIVISOR));
  const ivaBase = safeCif + arancelAmount;
  const ivaAmount = roundCurrency(ivaBase * (tariff.ivaRate / PERCENT_DIVISOR));

  return {
    cif: roundCurrency(safeCif),
    adValoremRate: tariff.adValoremRate,
    arancelAmount,
    ivaRate: tariff.ivaRate,
    ivaAmount,
    unit: tariff.unit,
  };
}
