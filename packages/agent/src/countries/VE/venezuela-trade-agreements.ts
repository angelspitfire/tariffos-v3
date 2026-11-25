/**
 * VenezuelaTradeAgreements - ITradeAgreements implementation for Venezuela.
 * Venezuela: Suspended from Mercosur (2016/2017), retains NCM nomenclature.
 * Preferential agreements: Partial-scope with CAN legacy partners, Presidential Decrees.
 * 
 * @package apps/agent/src/countries/VE
 * @layer Country Module - Domain Port Implementation
 */

import { ITradeAgreements, TradeAgreement, RateSimulation, OriginData, PreferentialRule } from '../../domain/ports/trade-agreements.port';

export class VenezuelaTradeAgreements implements ITradeAgreements {
  agreements: TradeAgreement[] = [
    {
      id: 'MERCOSUR_NOMENCLATURE',
      name: 'Nomenclatura Común del Mercosur (NCM) - Retained post-suspension',
      type: 'customs_union',
      partnerCountries: ['AR', 'BR', 'PY', 'UY'],
      status: 'suspended',
      effectiveDate: '2011-07-01',
      preferentialRules: [
        { hsCodePrefix: '', originRule: 'value_added', valueAddedThreshold: 60, preferentialRate: 0, conditions: 'Mercosur suspended since 2016; NCM retained for classification only' }
      ]
    },
    {
      id: 'CAN_LEGACY_PARTIAL',
      name: 'Acuerdos de alcance parcial (Legado Comunidad Andina)',
      type: 'partial_scope',
      partnerCountries: ['CO', 'EC', 'PE', 'BO'],
      status: 'active',
      effectiveDate: '2011-04-01',
      preferentialRules: [
        { hsCodePrefix: '8471', originRule: 'value_added', valueAddedThreshold: 50, preferentialRate: 5, conditions: 'Acuerdo parcial Colombia-Venezuela equipos informáticos' },
        { hsCodePrefix: '8517', originRule: 'value_added', valueAddedThreshold: 50, preferentialRate: 5, conditions: 'Acuerdo parcial Colombia-Venezuela telecomunicaciones' },
        { hsCodePrefix: '3004', originRule: 'wholly_obtained', preferentialRate: 0, conditions: 'Medicamentos origen CAN' }
      ]
    },
    {
      id: 'DECRETO_PRESIDENCIAL_EXONERACIONES',
      name: 'Decretos Presidenciales de Exoneración',
      type: 'unilateral',
      partnerCountries: ['VE'],
      status: 'active',
      effectiveDate: '2024-01-01',
      preferentialRules: [
        { hsCodePrefix: '8471', originRule: 'specific_process', specificProcess: 'Ensamblaje nacional certificado', preferentialRate: 0, conditions: 'Decreto de fomento industrial' },
        { hsCodePrefix: '8517', originRule: 'specific_process', specificProcess: 'Homologación CONATEL + ensamblaje', preferentialRate: 5, conditions: 'Decreto de fomento telecomunicaciones' },
        { hsCodePrefix: '3004', originRule: 'wholly_obtained', preferentialRate: 0, conditions: 'Medicamentos esenciales - Decreto de emergencia sanitaria' },
        { hsCodePrefix: '8419', originRule: 'specific_process', specificProcess: 'Equipos médicos ensamblados localmente', preferentialRate: 0, conditions: 'Decreto de equipamiento hospitalario' }
      ]
    }
  ];

  simulatePreferentialRate(hsCode: string, originCountry: string): RateSimulation {
    // Find best applicable agreement
    let bestRate = this.getMfnRate(hsCode);
    let bestAgreement = 'MFN';
    let rulesMet = false;
    let savings = 0;
    const requirements: string[] = ['Certificado de origen', 'Factura comercial'];

    for (const agreement of this.agreements) {
      if (agreement.status !== 'active') continue;
      
      for (const rule of agreement.preferentialRules) {
        if (this.hsCodeMatches(hsCode, rule.hsCodePrefix)) {
          // Check if origin country is partner
          if (!agreement.partnerCountries.includes(originCountry) && agreement.partnerCountries.length > 0) {
            continue;
          }
          
          const originMet = this.checkRulesOfOrigin(hsCode, agreement.id, { countryOfOrigin: originCountry, supportingDocuments: [] });
          if (originMet && rule.preferentialRate < bestRate) {
            bestRate = rule.preferentialRate;
            bestAgreement = agreement.id;
            rulesMet = true;
            requirements.push(...this.getRequirementsForRule(rule));
          }
        }
      }
    }

    savings = ((this.getMfnRate(hsCode) - bestRate) / this.getMfnRate(hsCode)) * 100;

    return {
      baseRate: this.getMfnRate(hsCode),
      preferentialRate: bestRate,
      agreementId: bestAgreement,
      originCountry,
      rulesOfOriginMet: rulesMet,
      savingsPercent: Math.round(savings * 100) / 100,
      requirements
    };
  }

  getApplicableAgreements(hsCode: string): TradeAgreement[] {
    return this.agreements.filter(agreement => 
      agreement.status === 'active' &&
      agreement.preferentialRules.some(rule => this.hsCodeMatches(hsCode, rule.hsCodePrefix))
    );
  }

  checkRulesOfOrigin(hsCode: string, agreementId: string, originData: OriginData): boolean {
    const agreement = this.agreements.find(a => a.id === agreementId);
    if (!agreement) return false;

    for (const rule of agreement.preferentialRules) {
      if (!this.hsCodeMatches(hsCode, rule.hsCodePrefix)) continue;

      switch (rule.originRule) {
        case 'wholly_obtained':
          return originData.supportingDocuments.includes('certificado_origen_total');
        case 'value_added':
          return (originData.valueAddedPercent ?? 0) >= (rule.valueAddedThreshold ?? 50);
        case 'specific_process':
          return originData.processDescription?.includes(rule.specificProcess ?? '') ?? false;
        case 'substantial_transformation':
          return originData.supportingDocuments.includes('certificado_transformacion');
      }
    }
    return false;
  }

  getAgreementLabel(agreementId: string): string {
    const agreement = this.agreements.find(a => a.id === agreementId);
    return agreement?.name ?? agreementId;
  }

  // Private helpers

  private getMfnRate(hsCode: string): number {
    // In production: lookup from NationalTariff table
    // Default rates by chapter for Venezuela
    const chapter = hsCode.slice(0, 2);
    const rates: Record<string, number> = {
      '01': 10, '02': 10, '03': 10, '04': 15, '05': 10, '06': 10, '07': 15, '08': 15, '09': 15,
      '10': 10, '11': 15, '12': 10, '13': 10, '14': 10, '15': 15, '16': 20, '17': 20, '18': 20,
      '19': 20, '20': 20, '21': 20, '22': 20, '23': 15, '24': 20, '25': 10, '26': 10, '27': 10,
      '28': 10, '29': 10, '30': 5, '31': 10, '32': 10, '33': 15, '34': 15, '35': 10, '36': 15,
      '37': 15, '38': 10, '39': 15, '40': 15, '41': 15, '42': 20, '43': 20, '44': 15, '45': 10,
      '46': 15, '47': 10, '48': 15, '49': 10, '50': 15, '51': 15, '52': 15, '53': 15, '54': 15,
      '55': 15, '56': 15, '57': 15, '58': 15, '59': 15, '60': 15, '61': 20, '62': 20, '63': 20,
      '64': 20, '65': 20, '66': 15, '67': 15, '68': 15, '69': 15, '70': 15, '71': 20, '72': 10,
      '73': 15, '74': 10, '75': 10, '76': 10, '78': 10, '79': 10, '80': 10, '81': 10, '82': 15,
      '83': 15, '84': 15, '85': 15, '86': 10, '87': 20, '88': 10, '89': 10, '90': 10, '91': 20,
      '92': 15, '93': 20, '94': 20, '95': 20, '96': 15, '97': 20
    };
    return chapter in rates ? rates[chapter] : 15;
  }

  private hsCodeMatches(hsCode: string, prefix: string): boolean {
    if (!prefix) return true;
    return hsCode.startsWith(prefix.replace('.', ''));
  }

  private getRequirementsForRule(rule: PreferentialRule): string[] {
    const reqs: string[] = [];
    switch (rule.originRule) {
      case 'wholly_obtained':
        reqs.push('Certificado de origen (totalmente obtenido)');
        break;
      case 'value_added':
        reqs.push(`Certificado de valor agregado (mín ${rule.valueAddedThreshold}%)`);
        break;
      case 'specific_process':
        reqs.push(`Certificado de proceso: ${rule.specificProcess}`);
        break;
      case 'substantial_transformation':
        reqs.push('Certificado de transformación sustancial');
        break;
    }
    return reqs;
  }
}