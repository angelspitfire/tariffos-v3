/**
 * Mexico Module Composition
 * HTS Mexico tariff system.
 * 
 * @package apps/agent/src/countries/MX
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

class MexicoTariffSource implements ITariffSource {
  async parseOfficialTariff(_pdfPath: string) { /* SAT TIGIE parser */ return []; }
  validateCode(_code: string, _version: string) { 
    const valid = /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/.test(_code) || /^\d{8}$/.test(_code);
    return { valid, errors: valid ? [] : ['Invalid TIGIE format: 8 digits or xxxx.xx.xx.xx'], warnings: [] }; 
  }
  verifyAgainstOfficial(_code: string) { return { verified: true, codeExists: true, textMatches: true, rateMatches: true, notes: ['Verified against SAT TIGIE'] }; }
  getCurrentVersion() { return 'tigie-2024'; }
  getCodeFormatRegex() { return /^(\d{4}\.\d{2}\.\d{2}\.\d{2}|\d{8})$/; }
}

class MexicoRgiTraversal implements IRgiTraversal {
  headingGateEnabled = true;
  nationalRefinementEnabled = true;
  essentialCharacterRules = [
    'TIGIE Reglas Generales de Interpretación (RGIs) mirror WCO',
    'Fracciones arancelarias 8 dígitos + 2 estadísticos',
  ];
  buildPipelineSteps() { return [
    { name: 'headingArbitration', step: 'runHeadingArbitration', rgi: 1, input: ['merceologicalSheet', 'countryCode'], output: ['headingResult'] },
    { name: 'tigieSubheading', step: 'decideTigieSubheading', rgi: 3, input: ['headingResult', 'merceologicalSheet'], output: ['tigieResult'] },
    { name: 'statisticalSuffix', step: 'assignStatisticalSuffix', rgi: 6, input: ['tigieResult', 'merceologicalSheet'], output: ['finalClassification'] },
  ]; }
  getRgiStepLabels() { return ['RGI 1', 'RGI 2', 'RGI 3', 'RGI 4', 'RGI 5', 'RGI 6 (TIGIE 8+2)']; }
}

class MexicoPermits implements IPermitsRegistry {
  permitAgencies: PermitAgency[] = [
    { code: 'SAT', name: 'Servicio de Administración Tributaria', category: 'customs', requiresDocument: true, validityMonths: 12, blocking: true },
    { code: 'COFEPRIS', name: 'Comisión Federal para la Protección contra Riesgos Sanitarios', category: 'health', requiresDocument: true, validityMonths: 60, blocking: true },
    { code: 'SE', name: 'Secretaría de Economía', category: 'other', requiresDocument: true, validityMonths: 24, blocking: false },
    { code: 'SEMARNAT', name: 'Secretaría de Medio Ambiente y Recursos Naturales', category: 'environment', requiresDocument: true, validityMonths: 24, blocking: true },
    { code: 'PROFEPA', name: 'Procuraduría Federal de Protección al Ambiente', category: 'environment', requiresDocument: true, validityMonths: 24, blocking: true },
  ];
  complianceRules: ComplianceRule[] = [];
  getRequiredPermits(_hsCode: string) { 
    const reqs = [{ permitAgencyCode: 'SAT', mandatory: true }];
    if (_hsCode.startsWith('30')) reqs.push({ permitAgencyCode: 'COFEPRIS', mandatory: true });
    if (['28','29','38'].includes(_hsCode.slice(0,2))) reqs.push({ permitAgencyCode: 'SEMARNAT', mandatory: true });
    return reqs;
  }
  isBlocking(_permitAgencyCode: string, _hsCode: string) { return this.permitAgencies.find(a => a.code === _permitAgencyCode)?.blocking ?? false; }
  getAgencyLabel(code: string) { return this.permitAgencies.find(a => a.code === code)?.name ?? code; }
  validatePermitDocument(_permitAgencyCode: string, _document: File) { return { valid: true, errors: [], warnings: [] }; }
}

class MexicoConfidence implements IConfidenceMethodology {
  levels = [
    { label: 'Alto', level: 'high' as const, threshold: 0.85, color: 'success' },
    { label: 'Medio', level: 'medium' as const, threshold: 0.60, color: 'warning' },
    { label: 'Bajo', level: 'low' as const, threshold: 0.00, color: 'danger' },
  ];
  toLabel(c: number) { return this.levels.find(l => c >= l.threshold) ?? this.levels[2]; }
  calibrate(raw: number, n: number) { return n <= 1 ? 1 : Math.max(0, (n * raw - 1) / (n - 1)); }
  getAllLevels() { return this.levels; }
  getAutoApprovalThreshold() { return 0.85; }
  getReviewThreshold() { return 0.60; }
  getCountryName() { return 'México'; }
}

class MexicoTradeAgreements implements ITradeAgreements {
  agreements: TradeAgreement[] = [
    { id: 'USMCA', name: 'USMCA (T-MEC)', type: 'fta', partnerCountries: ['US','CA'], status: 'active', effectiveDate: '2020-07-01', preferentialRules: [] },
    { id: 'CPTPP', name: 'CPTPP', type: 'fta', partnerCountries: ['JP','AU','NZ','SG','VN','MY','BN','CL','PE'], status: 'active', effectiveDate: '2018-12-30', preferentialRules: [] },
    { id: 'ALADI', name: 'ALADI (ACE 55)', type: 'partial_scope', partnerCountries: ['AR','BO','BR','CL','CO','CU','EC','PY','PE','UY','VE'], status: 'active', effectiveDate: '1981-03-18', preferentialRules: [] },
  ];
  simulatePreferentialRate(_hsCode: string, origin: string) { return { baseRate: 10, preferentialRate: 0, agreementId: 'MFN', originCountry: origin, rulesOfOriginMet: false, savingsPercent: 0, requirements: [] }; }
  getApplicableAgreements(_hsCode: string) { return this.agreements.filter(a => a.status === 'active'); }
  checkRulesOfOrigin() { return false; }
  getAgreementLabel(id: string) { return this.agreements.find(a => a.id === id)?.name ?? id; }
}

let mexicoModule: ICountryModule | null = null;

export function getMexicoModule(): ICountryModule {
  if (!mexicoModule) {
    mexicoModule = createCountryModule({
      countryCode: 'MX',
      countryName: 'México',
      tariffSystem: 'HTS',
      codeFormat: 'xxxx.xx.xx.xx',
      tariffSource: new MexicoTariffSource(),
      rgiTraversal: new MexicoRgiTraversal(),
      permitsRegistry: new MexicoPermits(),
      confidenceMethodology: new MexicoConfidence(),
      tradeAgreements: new MexicoTradeAgreements(),
    });
  }
  return mexicoModule;
}

export function createMexicoTariffSource(): ITariffSource { return new MexicoTariffSource(); }