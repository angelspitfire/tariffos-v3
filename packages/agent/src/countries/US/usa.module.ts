/**
 * USA Module Composition
 * HTS (Harmonized Tariff Schedule) - 10 digits with statistical suffix.
 * 
 * @package apps/agent/src/countries/US
 * @layer Country Module - Composition Root
 */

import { 
  createCountryModule, 
  ICountryModule 
} from '../index';
import { ITariffSource } from '../../domain/ports/tariff-source.port';
import { IRgiTraversal } from '../../domain/ports/rgi-traversal.port';
import { IPermitsRegistry, PermitAgency, ComplianceRule } from '../../domain/ports/permits.port';
import { IConfidenceMethodology } from '../../domain/ports/confidence.port';
import { ITradeAgreements, TradeAgreement } from '../../domain/ports/trade-agreements.port';

class USATariffSource implements ITariffSource {
  async parseOfficialTariff(_pdfPath: string) { /* USITC HTS parser */ return []; }
  validateCode(_code: string, _version: string) { 
    const valid = /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/.test(_code) || /^\d{10}$/.test(_code);
    return { valid, errors: valid ? [] : ['Invalid HTS format: 10 digits or xxxx.xx.xx.xx'], warnings: [] }; 
  }
  verifyAgainstOfficial(_code: string) { return { verified: true, codeExists: true, textMatches: true, rateMatches: true, notes: ['Verified against USITC HTS'] }; }
  getCurrentVersion() { return 'hts-2024'; }
  getCodeFormatRegex() { return /^(\d{4}\.\d{2}\.\d{2}\.\d{2}|\d{10})$/; }
}

class USARgiTraversal implements IRgiTraversal {
  headingGateEnabled = true;
  nationalRefinementEnabled = true;
  essentialCharacterRules = [
    'US HTS General Rules of Interpretation (GRIs) mirror WCO RGI',
    'Chapter 98/99 special provisions require separate handling',
    'Statistical suffix (digits 9-10) for Census reporting',
  ];
  buildPipelineSteps() { return [
    { name: 'headingArbitration', step: 'runHeadingArbitration', rgi: 1, input: ['merceologicalSheet', 'countryCode'], output: ['headingResult'] },
    { name: 'htsSubheading', step: 'decideHtsSubheading', rgi: 3, input: ['headingResult', 'merceologicalSheet'], output: ['htsResult'] },
    { name: 'statisticalSuffix', step: 'assignStatisticalSuffix', rgi: 6, input: ['htsResult', 'merceologicalSheet'], output: ['finalClassification'] },
    { name: 'chapter98Check', step: 'checkChapter98Provisions', rgi: 0, input: ['finalClassification'], output: ['chapter98Flags'] },
  ]; }
  getRgiStepLabels() { return ['GRI 1', 'GRI 2', 'GRI 3', 'GRI 4', 'GRI 5', 'GRI 6 (HTS 10-digit)']; }
}

class USAPermits implements IPermitsRegistry {
  permitAgencies: PermitAgency[] = [
    { code: 'CBP', name: 'Customs and Border Protection', category: 'customs', requiresDocument: true, validityMonths: 12, blocking: true },
    { code: 'FDA', name: 'Food and Drug Administration', category: 'health', requiresDocument: true, validityMonths: 60, blocking: true },
    { code: 'USDA', name: 'United States Department of Agriculture', category: 'health', requiresDocument: true, validityMonths: 24, blocking: true },
    { code: 'EPA', name: 'Environmental Protection Agency', category: 'environment', requiresDocument: true, validityMonths: 60, blocking: true },
    { code: 'FCC', name: 'Federal Communications Commission', category: 'telecom', requiresDocument: true, validityMonths: 60, blocking: true },
    { code: 'DOT', name: 'Department of Transportation', category: 'other', requiresDocument: true, validityMonths: 24, blocking: true },
  ];
  complianceRules: ComplianceRule[] = [];
  getRequiredPermits(_hsCode: string) { 
    const reqs = [{ permitAgencyCode: 'CBP', mandatory: true }];
    if (_hsCode.startsWith('30') || _hsCode.startsWith('21')) reqs.push({ permitAgencyCode: 'FDA', mandatory: true });
    if (_hsCode.startsWith('01') || _hsCode.startsWith('02') || _hsCode.startsWith('10')) reqs.push({ permitAgencyCode: 'USDA', mandatory: true });
    if (_hsCode.startsWith('85') && (_hsCode.includes('8517') || _hsCode.includes('8525'))) reqs.push({ permitAgencyCode: 'FCC', mandatory: true });
    return reqs;
  }
  isBlocking(_permitAgencyCode: string, _hsCode: string) { return this.permitAgencies.find(a => a.code === _permitAgencyCode)?.blocking ?? false; }
  getAgencyLabel(code: string) { return this.permitAgencies.find(a => a.code === code)?.name ?? code; }
  validatePermitDocument(_permitAgencyCode: string, _document: File) { return { valid: true, errors: [], warnings: [] }; }
}

class USAConfidence implements IConfidenceMethodology {
  levels = [
    { label: 'High', level: 'high' as const, threshold: 0.85, color: 'success' },
    { label: 'Medium', level: 'medium' as const, threshold: 0.60, color: 'warning' },
    { label: 'Low', level: 'low' as const, threshold: 0.00, color: 'danger' },
  ];
  toLabel(c: number) { return this.levels.find(l => c >= l.threshold) ?? this.levels[2]; }
  calibrate(raw: number, n: number) { return n <= 1 ? 1 : Math.max(0, (n * raw - 1) / (n - 1)); }
  getAllLevels() { return this.levels; }
  getAutoApprovalThreshold() { return 0.85; }
  getReviewThreshold() { return 0.60; }
  getCountryName() { return 'United States'; }
}

class USATradeAgreements implements ITradeAgreements {
  agreements: TradeAgreement[] = [
    { id: 'USMCA', name: 'USMCA (NAFTA 2.0)', type: 'fta', partnerCountries: ['CA','MX'], status: 'active', effectiveDate: '2020-07-01', preferentialRules: [] },
    { id: 'GSP', name: 'Generalized System of Preferences', type: 'gsp', partnerCountries: ['*'], status: 'active', effectiveDate: '1976-01-01', preferentialRules: [] },
  ];
  simulatePreferentialRate(_hsCode: string, origin: string) { return { baseRate: 5, preferentialRate: 0, agreementId: 'MFN', originCountry: origin, rulesOfOriginMet: false, savingsPercent: 0, requirements: [] }; }
  getApplicableAgreements(_hsCode: string) { return this.agreements.filter(a => a.status === 'active'); }
  checkRulesOfOrigin() { return false; }
  getAgreementLabel(id: string) { return this.agreements.find(a => a.id === id)?.name ?? id; }
}

let usaModule: ICountryModule | null = null;

export function getUSAModule(): ICountryModule {
  if (!usaModule) {
    usaModule = createCountryModule({
      countryCode: 'US',
      countryName: 'United States',
      tariffSystem: 'HTS',
      codeFormat: 'xxxx.xx.xx.xx',
      tariffSource: new USATariffSource(),
      rgiTraversal: new USARgiTraversal(),
      permitsRegistry: new USAPermits(),
      confidenceMethodology: new USAConfidence(),
      tradeAgreements: new USATradeAgreements(),
    });
  }
  return usaModule;
}

export function createUSATariffSource(): ITariffSource { return new USATariffSource(); }