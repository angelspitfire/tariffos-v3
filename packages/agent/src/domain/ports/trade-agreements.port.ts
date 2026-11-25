/**
 * ITradeAgreements - Port for country-specific trade agreements and preferential rates.
 * 
 * @package apps/agent/src/domain/ports
 * @layer Domain Port
 */
export interface TradeAgreement {
  id: string;                    // e.g., 'CAN', 'MERCOSUR', 'USMCA', 'TLC_EC_EU'
  name: string;                  // Full agreement name
  type: 'fta' | 'customs_union' | 'partial_scope' | 'gsp' | 'unilateral';
  partnerCountries: string[];    // ISO country codes
  status: 'active' | 'suspended' | 'provisional';
  effectiveDate: string;         // ISO date
  preferentialRules: PreferentialRule[];
}

export interface PreferentialRule {
  hsCodePrefix: string;          // e.g., '8471', '8471.30'
  originRule: 'wholly_obtained' | 'substantial_transformation' | 'value_added' | 'specific_process';
  valueAddedThreshold?: number;  // % if value_added rule
  specificProcess?: string;      // Process description if specific_process
  preferentialRate: number;      // Ad valorem % (0 = duty-free)
  conditions?: string;           // Additional conditions
}

export interface RateSimulation {
  baseRate: number;              // MFN rate
  preferentialRate: number;      // Best available preferential rate
  agreementId: string;           // Which agreement applies
  originCountry: string;         // Claimed origin
  rulesOfOriginMet: boolean;     // Whether origin criteria satisfied
  savingsPercent: number;        // % duty reduction
  requirements: string[];        // Documentation needed
}

export interface ITradeAgreements {
  /** All trade agreements for this country */
  agreements: TradeAgreement[];

  /** 
   * Simulate preferential rate for a code + origin.
   * Used by FTA Simulator in workstation.
   */
  simulatePreferentialRate(hsCode: string, originCountry: string): RateSimulation;

  /** Get all agreements applicable to a specific HS code */
  getApplicableAgreements(hsCode: string): TradeAgreement[];

  /** Check if origin criteria are met for a code + agreement */
  checkRulesOfOrigin(hsCode: string, agreementId: string, originData: OriginData): boolean;

  /** Get agreement display name for UI */
  getAgreementLabel(agreementId: string): string;
}

export interface OriginData {
  countryOfOrigin: string;
  manufacturer?: string;
  valueAddedPercent?: number;
  processDescription?: string;
  supportingDocuments: string[];  // Document types available
}