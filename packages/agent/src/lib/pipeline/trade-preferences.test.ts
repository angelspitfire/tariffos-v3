import { describe, expect, it } from 'vitest';
import {
  INCOTERM_RULES,
  ORIGIN_COUNTRIES,
  detectIncotermFromText,
  detectOriginCodeFromText,
  resolvePreferentialTreatment,
} from './trade-preferences.js';
import { evaluateTradeRemedies } from './trade-remedies.js';

describe('trade-preferences', () => {
  it('exposes canonical origin countries and all 5 incoterm rules', () => {
    expect(ORIGIN_COUNTRIES.some((c) => c.code === 'CN')).toBe(true);
    expect(ORIGIN_COUNTRIES.some((c) => c.code === 'OTHER')).toBe(true);
    expect(Object.keys(INCOTERM_RULES)).toEqual(['EXW', 'FOB', 'CFR', 'CIF', 'DDP']);
    expect(INCOTERM_RULES.EXW.includesOriginCharges).toBe(false);
    expect(INCOTERM_RULES.CIF.includesInsurance).toBe(true);
  });

  it('detects origin country codes and incoterms from free text', () => {
    expect(detectOriginCodeFromText('Shipped from Shenzhen, China')).toBe('CN');
    expect(detectOriginCodeFromText('Origen: Bogotá, Colombia')).toBe('CO');
    expect(detectOriginCodeFromText('No matching place')).toBeNull();

    expect(detectIncotermFromText('Terms: CIF La Guaira')).toBe('CIF');
    expect(detectIncotermFromText('FCA Miami Airport')).toBe('FOB');
    expect(detectIncotermFromText('C&F Puerto Cabello')).toBe('CFR');
    expect(detectIncotermFromText('EXW Factory')).toBe('EXW');
    expect(detectIncotermFromText('No incoterm')).toBeNull();
  });

  it('resolves MERCOSUR 100% preference for VE capital goods from BR and 80% for non-capital', () => {
    const tech = resolvePreferentialTreatment({
      jurisdictionId: 've-seniat',
      originCode: 'BR',
      hsCode: '8471.30.90.90',
    });
    expect(tech.hasAgreement).toBe(true);
    expect(tech.discountPercent).toBe(100);
    expect(tech.agreementName).toContain('MERCOSUR');

    const textile = resolvePreferentialTreatment({
      jurisdictionId: 've-seniat',
      originCode: 'BR',
      hsCode: '6109.10.00.00',
    });
    expect(textile.hasAgreement).toBe(true);
    expect(textile.discountPercent).toBe(80);
  });

  it('resolves AAP.AC 28 for VE-CO and USMCA with MPF waiver for US-MX', () => {
    const veCo = resolvePreferentialTreatment({
      jurisdictionId: 've-seniat',
      originCode: 'CO',
      hsCode: '8471.30.90.90',
    });
    expect(veCo.hasAgreement).toBe(true);
    expect(veCo.discountPercent).toBe(70);

    const usMx = resolvePreferentialTreatment({
      jurisdictionId: 'us-htsus',
      originCode: 'MX',
      hsCode: '8471.30.01.00',
    });
    expect(usMx.hasAgreement).toBe(true);
    expect(usMx.discountPercent).toBe(100);
    expect(usMx.waivesCustomsFee).toBe(true);
  });

  it('returns NMF (no preference) for China into Venezuela', () => {
    const res = resolvePreferentialTreatment({
      jurisdictionId: 've-seniat',
      originCode: 'CN',
      hsCode: '8471.30.90.90',
    });
    expect(res.hasAgreement).toBe(false);
    expect(res.discountPercent).toBe(0);
  });
});

describe('trade-remedies', () => {
  it('flags US Section 301 (+25%) and Section 232 (+25%) for Chinese steel', () => {
    const flags = evaluateTradeRemedies({
      jurisdictionId: 'us-htsus',
      originCode: 'CN',
      hsCode: '7304.19.00.00',
    });
    expect(flags.map((f) => f.code)).toEqual(['SEC-301', 'SEC-232']);
    expect(flags[0]?.suggestedExtraDutyPercent).toBe(25);
    expect(flags[1]?.suggestedExtraDutyPercent).toBe(25);
  });

  it('flags VE metal antidumping for China/Turkey/India and tires 4011 from China', () => {
    const steelFlags = evaluateTradeRemedies({
      jurisdictionId: 've-seniat',
      originCode: 'CN',
      hsCode: '7208.10.00.00',
    });
    expect(steelFlags.some((f) => f.code === 'AD-METAL' && f.suggestedExtraDutyPercent === 20)).toBe(
      true,
    );

    const tireFlags = evaluateTradeRemedies({
      jurisdictionId: 've-seniat',
      originCode: 'CN',
      hsCode: '4011.10.00.00',
    });
    expect(tireFlags.some((f) => f.code === 'AD-4011')).toBe(true);
  });

  it('returns empty remedies for OTHER origin or non-sensitive chapters', () => {
    expect(
      evaluateTradeRemedies({
        jurisdictionId: 've-seniat',
        originCode: 'OTHER',
        hsCode: '7208.10.00.00',
      }),
    ).toEqual([]);
  });
});
