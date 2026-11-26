import type { IncotermCode } from '@tariffos/shared-types';
import type { PreferentialAgreementResult } from './trade-preferences.js';
import type { TradeRemedyFlag } from './trade-remedies.js';

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
