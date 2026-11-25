/**
 * ITariffSource - Port for official tariff data access and validation.
 * Each country implements this to parse/validate its official tariff.
 * 
 * @package apps/agent/src/domain/ports
 * @layer Domain Port
 */
export interface NationalTariffRow {
  hsCode: string;              // Full 10-digit code (format per country)
  description: string;         // Official legal description
  countryCode: string;         // ISO 3166-1 alpha-2 (e.g., 'VE')
  adValorem: number;           // Ad valorem duty rate (%)
  specificDuty?: number;       // Specific duty (e.g., $/kg) if applicable
  ivaRate: number;             // VAT rate (%)
  dutyType: 'ad_valorem' | 'specific' | 'compound' | 'mixed';
  permits: string[];           // Permit agency codes (e.g., ['CONATEL', 'ARCSA'])
  agencies: string[];          // Regulatory agencies
  isActive: boolean;
  validFromDate: string;       // ISO date
  validToDate?: string;        // ISO date (null = indefinite)
  statisticalSuffix?: string;  // Country-specific statistical breakdown
  tariffRateQuotaId?: string;  // Reference to TRQ if applicable
  originConditions?: string;   // Origin-specific conditions
  ncmCode?: string;            // Digits 7-8 for NCM countries
  nationalCode?: string;       // Digits 9-10 for national subdivisions
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface VerificationResult {
  verified: boolean;
  codeExists: boolean;
  textMatches: boolean;
  rateMatches: boolean;
  notes: string[];
}

export interface ITariffSource {
  /** 
   * Parse official tariff PDF into structured rows for database insertion.
   * Called once per country during tariff load.
   */
  parseOfficialTariff(pdfPath: string): Promise<NationalTariffRow[]>;

  /** 
   * Validate a code exists in current tariff version.
   * Used by UI and pipeline for real-time validation.
   */
  validateCode(hsCode: string, version: string): ValidationResult;

  /** 
   * Verify code + text + rate against official source.
   * Called by quality gate in pipeline.
   */
  verifyAgainstOfficial(hsCode: string): VerificationResult;

  /** Get current tariff version identifier */
  getCurrentVersion(): string;

  /** Get supported code format regex for this country */
  getCodeFormatRegex(): RegExp;
}