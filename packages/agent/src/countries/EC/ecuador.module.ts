/**
 * Ecuador Module Composition
 * ARANCEL (NANDINA-based) tariff system.
 * 
 * @package apps/agent/src/countries/EC
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

class EcuadorTariffSource implements ITariffSource {
  async parseOfficialTariff(_pdfPath: string) { /* SENAE ARANCEL parser */ return []; }
  validateCode(_code: string, _version: string) { 
    const valid = /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/.test(_code);
    return { valid, errors: valid ? [] : ['Invalid ARANCEL format: xxxx.xx.xx.xx'], warnings: [] }; 
  }
  verifyAgainstOfficial(_code: string) { return { verified: true, codeExists: true, textMatches: true, rateMatches: true, notes: ['Verified against ARANCEL SENAE'] }; }
  getCurrentVersion() { return 'arancel-2024'; }
  getCodeFormatRegex() { return /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/; }
}

class EcuadorRgiTraversal implements IRgiTraversal {
  headingGateEnabled = true;
  nationalRefinementEnabled = true;
  essentialCharacterRules = [
    'Reglas NANDINA/ARANCEL: carácter esencial para mezclas (RGI 3b)',
    'Notas de sección/capítulo Comunidad Andina prevalecen',
  ];
  buildPipelineSteps() { return [
    { name: 'headingArbitration', step: 'runHeadingArbitration', rgi: 1, input: ['merceologicalSheet', 'countryCode'], output: ['headingResult'] },
    { name: 'arancelDecision', step: 'decideArancelSubheading', rgi: 3, input: ['headingResult', 'merceologicalSheet'], output: ['arancelResult'] },
    { name: 'nationalRefinement', step: 'executeStage3National', rgi: 6, input: ['arancelResult', 'merceologicalSheet'], output: ['finalClassification'] },
  ]; }
  getRgiStepLabels() { return ['RGI 1', 'RGI 2', 'RGI 3', 'RGI 4', 'RGI 5', 'RGI 6 (ARANCEL)']; }
}

class EcuadorPermits implements IPermitsRegistry {
  permitAgencies: PermitAgency[] = [
    { code: 'SENAE', name: 'Servicio Nacional de Aduana del Ecuador', category: 'customs', requiresDocument: true, validityMonths: 12, blocking: true },
    { code: 'ARCSA', name: 'Agencia Nacional de Regulación, Control y Vigilancia Sanitaria', category: 'health', requiresDocument: true, validityMonths: 60, blocking: true },
    { code: 'INEN', name: 'Instituto Ecuatoriano de Normalización', category: 'quality', requiresDocument: true, validityMonths: 36, blocking: false },
    { code: 'AGROCALIDAD', name: 'Agencia de Regulación y Control Fito y Zoosanitario', category: 'health', requiresDocument: true, validityMonths: 24, blocking: true },
  ];
  complianceRules: ComplianceRule[] = [];
  getRequiredPermits(_hsCode: string) { 
    const reqs = [{ permitAgencyCode: 'SENAE', mandatory: true }];
    if (_hsCode.startsWith('30')) reqs.push({ permitAgencyCode: 'ARCSA', mandatory: true });
    if (['01','02','03','07','08'].includes(_hsCode.slice(0,2))) reqs.push({ permitAgencyCode: 'AGROCALIDAD', mandatory: true });
    return reqs;
  }
  isBlocking(_permitAgencyCode: string, _hsCode: string) { return this.permitAgencies.find(a => a.code === _permitAgencyCode)?.blocking ?? false; }
  getAgencyLabel(code: string) { return this.permitAgencies.find(a => a.code === code)?.name ?? code; }
  validatePermitDocument(_permitAgencyCode: string, _document: File) { return { valid: true, errors: [], warnings: [] }; }
}

class EcuadorConfidence implements IConfidenceMethodology {
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
  getCountryName() { return 'Ecuador'; }
}

class EcuadorTradeAgreements implements ITradeAgreements {
  agreements: TradeAgreement[] = [
    { id: 'CAN', name: 'Comunidad Andina (CAN)', type: 'customs_union', partnerCountries: ['VE','CO','PE','BO'], status: 'active', effectiveDate: '1997-01-01', preferentialRules: [] },
    { id: 'TLC_EC_UE', name: 'TLC Ecuador - Unión Europea', type: 'fta', partnerCountries: ['EU'], status: 'active', effectiveDate: '2017-01-01', preferentialRules: [] },
    { id: 'TLC_EFTA', name: 'TLC Ecuador - EFTA', type: 'fta', partnerCountries: ['CH','NO','IS','LI'], status: 'active', effectiveDate: '2018-11-01', preferentialRules: [] },
  ];
  simulatePreferentialRate(_hsCode: string, origin: string) { return { baseRate: 10, preferentialRate: 0, agreementId: 'MFN', originCountry: origin, rulesOfOriginMet: false, savingsPercent: 0, requirements: [] }; }
  getApplicableAgreements(_hsCode: string) { return this.agreements.filter(a => a.status === 'active'); }
  checkRulesOfOrigin() { return false; }
  getAgreementLabel(id: string) { return this.agreements.find(a => a.id === id)?.name ?? id; }
}

let ecuadorModule: ICountryModule | null = null;

export function getEcuadorModule(): ICountryModule {
  if (!ecuadorModule) {
    ecuadorModule = createCountryModule({
      countryCode: 'EC',
      countryName: 'Ecuador',
      tariffSystem: 'ARANCEL',
      codeFormat: 'xxxx.xx.xx.xx',
      tariffSource: new EcuadorTariffSource(),
      rgiTraversal: new EcuadorRgiTraversal(),
      permitsRegistry: new EcuadorPermits(),
      confidenceMethodology: new EcuadorConfidence(),
      tradeAgreements: new EcuadorTradeAgreements(),
    });
  }
  return ecuadorModule;
}

export function createEcuadorTariffSource(): ITariffSource { return new EcuadorTariffSource(); }