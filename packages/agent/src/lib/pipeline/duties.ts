import type { DeterministicDuties } from '@tariffos/shared-types';
import type { DutyEngineInput, DutyEngineResult } from './duty-types.js';
import { INCOTERM_RULES, resolvePreferentialTreatment } from './trade-preferences.js';
import { evaluateTradeRemedies } from './trade-remedies.js';
import type { TariffCandidateRecord } from './types.js';

export type { DutyEngineInput, DutyEngineResult } from './duty-types.js';
export { inferTradeParamsFromContext } from './trade-context.js';

const PERCENT_DIVISOR = 100;
const CURRENCY_DECIMALS = 2;
const RATE_DECIMALS = 4;
const MIN_EXCHANGE_RATE = 0.0001;
const MAX_DISCOUNT_PERCENT = 100;

function roundNumber(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clampNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

/**
 * Pure deterministic customs duty calculator for single-line pipeline payloads
 * (never delegated to an LLM).
 */
export function calculateDeterministicDuties(
  cifValue: number,
  tariff: Pick<
    TariffCandidateRecord,
    | 'adValoremRate'
    | 'baseAdValoremRate'
    | 'tariffExceptionCode'
    | 'ivaRate'
    | 'unit'
    | 'customsFeeRate'
    | 'isBK'
    | 'isBIT'
    | 'activeExemption'
  >,
): DeterministicDuties {
  const safeCif = clampNonNegative(cifValue);
  const arancelAmount = roundNumber(safeCif * (tariff.adValoremRate / PERCENT_DIVISOR), CURRENCY_DECIMALS);
  const hasCustomsFee = typeof tariff.customsFeeRate === 'number';
  const customsFeeRate = hasCustomsFee ? clampNonNegative(tariff.customsFeeRate!) : undefined;
  const customsFeeAmount =
    customsFeeRate !== undefined
      ? roundNumber(safeCif * (customsFeeRate / PERCENT_DIVISOR), CURRENCY_DECIMALS)
      : 0;
  const ivaBase = safeCif + arancelAmount + customsFeeAmount;
  const ivaAmount = roundNumber(ivaBase * (tariff.ivaRate / PERCENT_DIVISOR), CURRENCY_DECIMALS);
  const totalTaxes = roundNumber(arancelAmount + customsFeeAmount + ivaAmount, CURRENCY_DECIMALS);
  const landedCost = roundNumber(safeCif + totalTaxes, CURRENCY_DECIMALS);

  return {
    cif: roundNumber(safeCif, CURRENCY_DECIMALS),
    adValoremRate: tariff.adValoremRate,
    arancelAmount,
    ivaRate: tariff.ivaRate,
    ivaAmount,
    unit: tariff.unit,
    ...(customsFeeRate !== undefined
      ? {
          customsFeeRate,
          customsFeeAmount,
          totalTaxes,
          landedCost,
        }
      : {}),
    ...(typeof tariff.baseAdValoremRate === 'number'
      ? { baseAdValoremRate: tariff.baseAdValoremRate }
      : {}),
    ...(tariff.tariffExceptionCode ? { tariffExceptionCode: tariff.tariffExceptionCode } : {}),
    ...(typeof tariff.isBK === 'boolean' ? { isBK: tariff.isBK } : {}),
    ...(typeof tariff.isBIT === 'boolean' ? { isBK: tariff.isBK, isBIT: tariff.isBIT } : {}),
    ...(tariff.activeExemption ? { activeExemption: tariff.activeExemption } : {}),
  };
}

/**
 * Full deterministic customs valuation and duty calculator supporting
 * Incoterms (EXW/FOB/CFR/CIF/DDP), US CBP FOB valuation, preferential trade
 * agreements, antidumping remedies, customs service fee waivers, and exemptions.
 */
export function calculateFullDuties(input: DutyEngineInput): DutyEngineResult {
  const rule = INCOTERM_RULES[input.incoterm];
  const invoiceAmount = clampNonNegative(input.invoiceAmount);
  const isUsCbp = input.jurisdictionId === 'us-htsus';

  const addedOriginCharges = rule.includesOriginCharges ? 0 : clampNonNegative(input.originChargesAmount);
  const addedFreight = isUsCbp || rule.includesFreight ? 0 : clampNonNegative(input.freightAmount);
  const addedInsurance = isUsCbp || rule.includesInsurance ? 0 : clampNonNegative(input.insuranceAmount);
  const customsValue = invoiceAmount + addedOriginCharges + addedFreight + addedInsurance;

  const valuationBasisLabel = isUsCbp
    ? 'Customs Value (FOB / Transaction Value CBP)'
    : `Valor en Aduana CIF (desde ${input.incoterm})`;

  const agreement = resolvePreferentialTreatment({
    jurisdictionId: input.jurisdictionId,
    originCode: input.originCode,
    hsCode: input.hsCode,
  });

  const baseAdValoremPercent = clampNonNegative(input.baseAdValoremPercent);
  const effectiveDiscountPercent = input.applyExemption
    ? MAX_DISCOUNT_PERCENT
    : input.hasCertificateOfOrigin && agreement.hasAgreement
      ? Math.min(
          MAX_DISCOUNT_PERCENT,
          clampNonNegative(input.preferentialDiscountOverridePercent ?? agreement.discountPercent),
        )
      : 0;

  const effectiveAdValoremPercent = input.applyExemption
    ? 0
    : roundNumber(baseAdValoremPercent * (1 - effectiveDiscountPercent / PERCENT_DIVISOR), RATE_DECIMALS);

  const adValoremNmfAmount = customsValue * (baseAdValoremPercent / PERCENT_DIVISOR);
  const adValoremAmount = customsValue * (effectiveAdValoremPercent / PERCENT_DIVISOR);
  const preferentialSavingsAmount = Math.max(0, adValoremNmfAmount - adValoremAmount);

  const remedies = evaluateTradeRemedies({
    jurisdictionId: input.jurisdictionId,
    originCode: input.originCode,
    hsCode: input.hsCode,
  });

  const effectiveAntidumpingPercent = input.applyAntidumping ? clampNonNegative(input.antidumpingPercent) : 0;
  const antidumpingAmount = customsValue * (effectiveAntidumpingPercent / PERCENT_DIVISOR);

  const mpfWaived = Boolean(isUsCbp && input.hasCertificateOfOrigin && agreement.waivesCustomsFee);
  const effectiveCustomsFeePercent = mpfWaived ? 0 : clampNonNegative(input.customsFeePercent);
  const customsFeeAmount = customsValue * (effectiveCustomsFeePercent / PERCENT_DIVISOR);

  const effectiveVatPercent = input.applyExemption ? 0 : clampNonNegative(input.vatPercent);
  const vatBase = customsValue + adValoremAmount + antidumpingAmount + customsFeeAmount;
  const vatAmount = vatBase * (effectiveVatPercent / PERCENT_DIVISOR);

  const totalTaxes = adValoremAmount + antidumpingAmount + customsFeeAmount + vatAmount;
  const landedCost = customsValue + totalTaxes;
  const effectiveTaxBurdenPercent = customsValue > 0 ? (totalTaxes / customsValue) * PERCENT_DIVISOR : 0;
  const fx = Math.max(MIN_EXCHANGE_RATE, Number(input.exchangeRate) || 1);

  return {
    incoterm: input.incoterm,
    invoiceAmount,
    addedOriginCharges,
    addedFreight,
    addedInsurance,
    customsValue,
    valuationBasisLabel,
    agreement,
    effectiveDiscountPercent,
    baseAdValoremPercent,
    effectiveAdValoremPercent,
    adValoremNmfAmount,
    adValoremAmount,
    preferentialSavingsAmount,
    effectiveAntidumpingPercent,
    antidumpingAmount,
    effectiveCustomsFeePercent,
    customsFeeAmount,
    vatBase,
    effectiveVatPercent,
    vatAmount,
    totalTaxes,
    landedCost,
    effectiveTaxBurdenPercent,
    localCustomsValue: customsValue * fx,
    localTotalTaxes: totalTaxes * fx,
    localLandedCost: landedCost * fx,
    remedies,
  };
}
