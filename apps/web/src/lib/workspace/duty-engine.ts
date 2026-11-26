import type {
  A2UICalculatorComponent,
  A2UIDocumentSummaryComponent,
  A2UIDossierComponent,
  IncotermCode,
  JurisdictionConfig,
} from '@tariffos/shared-types';
import {
  INCOTERM_RULES,
  detectIncotermFromText,
  detectOriginCodeFromText,
  evaluateTradeRemedies,
  resolvePreferentialTreatment,
  type PreferentialAgreementResult,
  type TradeRemedyFlag,
} from './trade-preferences';

export interface DutyEngineInput {
  jurisdictionId: string;
  hsCode: string;
  originCode: string;
  incoterm: IncotermCode;
  invoiceAmount: number;
  originChargesAmount: number;
  freightAmount: number;
  insuranceAmount: number;
  baseAdValoremPercent: number;
  vatPercent: number;
  customsFeePercent: number;
  exchangeRate: number;
  applyExemption: boolean;
  hasCertificateOfOrigin: boolean;
  preferentialDiscountOverridePercent?: number | null;
  applyAntidumping: boolean;
  antidumpingPercent: number;
}

export interface DutyEngineResult {
  incoterm: IncotermCode;
  invoiceAmount: number;
  addedOriginCharges: number;
  addedFreight: number;
  addedInsurance: number;
  customsValue: number;
  valuationBasisLabel: string;
  agreement: PreferentialAgreementResult;
  effectiveDiscountPercent: number;
  baseAdValoremPercent: number;
  effectiveAdValoremPercent: number;
  adValoremNmfAmount: number;
  adValoremAmount: number;
  preferentialSavingsAmount: number;
  effectiveAntidumpingPercent: number;
  antidumpingAmount: number;
  effectiveCustomsFeePercent: number;
  customsFeeAmount: number;
  vatBase: number;
  effectiveVatPercent: number;
  vatAmount: number;
  totalTaxes: number;
  landedCost: number;
  effectiveTaxBurdenPercent: number;
  localCustomsValue: number;
  localTotalTaxes: number;
  localLandedCost: number;
  remedies: TradeRemedyFlag[];
}

export function calculateDeterministicDuties(input: DutyEngineInput): DutyEngineResult {
  const rule = INCOTERM_RULES[input.incoterm] ?? INCOTERM_RULES.FOB;
  const invoiceAmount = Math.max(0, Number(input.invoiceAmount) || 0);
  const rawOrigin = Math.max(0, Number(input.originChargesAmount) || 0);
  const rawFreight = Math.max(0, Number(input.freightAmount) || 0);
  const rawInsurance = Math.max(0, Number(input.insuranceAmount) || 0);
  const isUsCbp = input.jurisdictionId === 'us-htsus';

  const addedOriginCharges = rule.includesOriginCharges ? 0 : rawOrigin;
  const addedFreight = isUsCbp || rule.includesFreight ? 0 : rawFreight;
  const addedInsurance = isUsCbp || rule.includesInsurance ? 0 : rawInsurance;
  const customsValue = invoiceAmount + addedOriginCharges + addedFreight + addedInsurance;

  const valuationBasisLabel = isUsCbp
    ? 'Base CBP (FOB)'
    : `Base CIF (desde ${input.incoterm})`;

  const agreement = resolvePreferentialTreatment({
    jurisdictionId: input.jurisdictionId,
    originCode: input.originCode,
    hsCode: input.hsCode,
  });

  const baseAdValoremPercent = Math.max(0, Number(input.baseAdValoremPercent) || 0);
  const effectiveDiscountPercent = input.applyExemption
    ? 100
    : input.hasCertificateOfOrigin && agreement.hasAgreement
      ? Math.min(
          100,
          Math.max(0, input.preferentialDiscountOverridePercent ?? agreement.discountPercent)
        )
      : 0;

  const effectiveAdValoremPercent = input.applyExemption
    ? 0
    : Number((baseAdValoremPercent * (1 - effectiveDiscountPercent / 100)).toFixed(4));

  const adValoremNmfAmount = customsValue * (baseAdValoremPercent / 100);
  const adValoremAmount = customsValue * (effectiveAdValoremPercent / 100);
  const preferentialSavingsAmount = Math.max(0, adValoremNmfAmount - adValoremAmount);

  const remedies = evaluateTradeRemedies({
    jurisdictionId: input.jurisdictionId,
    originCode: input.originCode,
    hsCode: input.hsCode,
  });

  const effectiveAntidumpingPercent = input.applyAntidumping
    ? Math.max(0, Number(input.antidumpingPercent) || 0)
    : 0;
  const antidumpingAmount = customsValue * (effectiveAntidumpingPercent / 100);

  const mpfWaived = Boolean(isUsCbp && input.hasCertificateOfOrigin && agreement.waivesCustomsFee);
  const effectiveCustomsFeePercent = mpfWaived
    ? 0
    : Math.max(0, Number(input.customsFeePercent) || 0);
  const customsFeeAmount = customsValue * (effectiveCustomsFeePercent / 100);

  const effectiveVatPercent = input.applyExemption ? 0 : Math.max(0, Number(input.vatPercent) || 0);
  const vatBase = customsValue + adValoremAmount + antidumpingAmount + customsFeeAmount;
  const vatAmount = vatBase * (effectiveVatPercent / 100);

  const totalTaxes = adValoremAmount + antidumpingAmount + customsFeeAmount + vatAmount;
  const landedCost = customsValue + totalTaxes;
  const effectiveTaxBurdenPercent = customsValue > 0 ? (totalTaxes / customsValue) * 100 : 0;
  const fx = Math.max(0.0001, Number(input.exchangeRate) || 1);

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

export function inferTradeParamsFromContext(params: {
  calculator?: A2UICalculatorComponent;
  dossier?: A2UIDossierComponent;
  docSummary?: A2UIDocumentSummaryComponent;
  defaultIncoterm?: IncotermCode;
  jurisdiction: JurisdictionConfig;
}): { originCode: string; incoterm: IncotermCode } {
  const { calculator, dossier, docSummary, defaultIncoterm } = params;
  const specText = (dossier?.technicalSpecs ?? [])
    .filter((s) => /origen|origin|pa[ií]s|proceden|fabric/i.test(s.key))
    .map((s) => s.value)
    .join(' ');

  const combinedOriginText = [
    calculator?.originCountry ?? '',
    specText,
    docSummary?.routeOrIncoterm ?? '',
    docSummary?.shipper ?? '',
    dossier?.officialDescription ?? '',
  ].join(' ');

  const originCode = detectOriginCodeFromText(combinedOriginText) ?? 'OTHER';
  const incoterm =
    calculator?.incoterm ??
    detectIncotermFromText(docSummary?.routeOrIncoterm ?? '') ??
    defaultIncoterm ??
    'FOB';

  return { originCode, incoterm };
}
