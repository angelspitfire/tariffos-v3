import { describe, expect, it } from 'vitest';
import {
  calculateDeterministicDuties,
  calculateFullDuties,
  inferTradeParamsFromContext,
  type DutyEngineInput,
} from './duties.js';

function baseDutyInput(overrides?: Partial<DutyEngineInput>): DutyEngineInput {
  return {
    jurisdictionId: 've-seniat',
    hsCode: '8471.30.90.90',
    originCode: 'CN',
    incoterm: 'FOB',
    invoiceAmount: 1000,
    originChargesAmount: 50,
    freightAmount: 150,
    insuranceAmount: 50,
    baseAdValoremPercent: 16,
    vatPercent: 16,
    customsFeePercent: 1,
    exchangeRate: 40,
    applyExemption: false,
    hasCertificateOfOrigin: false,
    applyAntidumping: false,
    antidumpingPercent: 0,
    ...overrides,
  };
}

describe('duties', () => {
  it('preserves calculateDeterministicDuties for orchestrator compatibility', () => {
    const res = calculateDeterministicDuties(1000, {
      adValoremRate: 16,
      ivaRate: 16,
      unit: 'u',
    });
    expect(res.cif).toBe(1000);
    expect(res.arancelAmount).toBe(160);
    expect(res.ivaAmount).toBe(185.6);
    expect(res.unit).toBe('u');
  });

  it('computes CIF customs value across EXW, FOB, CFR, CIF, and DDP', () => {
    const exw = calculateFullDuties(baseDutyInput({ incoterm: 'EXW' }));
    expect(exw.customsValue).toBe(1250);
    expect(exw.addedOriginCharges).toBe(50);

    const fob = calculateFullDuties(baseDutyInput({ incoterm: 'FOB' }));
    expect(fob.customsValue).toBe(1200);
    expect(fob.addedOriginCharges).toBe(0);

    const cfr = calculateFullDuties(baseDutyInput({ incoterm: 'CFR' }));
    expect(cfr.customsValue).toBe(1050);

    const cif = calculateFullDuties(baseDutyInput({ incoterm: 'CIF' }));
    expect(cif.customsValue).toBe(1000);

    const ddp = calculateFullDuties(baseDutyInput({ incoterm: 'DDP' }));
    expect(ddp.customsValue).toBe(1000);
  });

  it('uses FOB valuation for US CBP and waives MPF with USMCA certificate', () => {
    const res = calculateFullDuties(
      baseDutyInput({
        jurisdictionId: 'us-htsus',
        originCode: 'MX',
        incoterm: 'FOB',
        baseAdValoremPercent: 10,
        vatPercent: 0,
        customsFeePercent: 0.3464,
        hasCertificateOfOrigin: true,
      }),
    );
    expect(res.customsValue).toBe(1000);
    expect(res.addedFreight).toBe(0);
    expect(res.addedInsurance).toBe(0);
    expect(res.effectiveAdValoremPercent).toBe(0);
    expect(res.effectiveCustomsFeePercent).toBe(0);
    expect(res.preferentialSavingsAmount).toBe(100);
  });

  it('applies preferential discounts, antidumping, and full exemptions correctly', () => {
    const pref = calculateFullDuties(
      baseDutyInput({
        originCode: 'CO',
        incoterm: 'CIF',
        hasCertificateOfOrigin: true,
      }),
    );
    expect(pref.effectiveDiscountPercent).toBe(70);
    expect(pref.effectiveAdValoremPercent).toBe(4.8);
    expect(pref.adValoremAmount).toBeCloseTo(48, 2);

    const ad = calculateFullDuties(
      baseDutyInput({
        incoterm: 'CIF',
        hsCode: '7208.10.00.00',
        applyAntidumping: true,
        antidumpingPercent: 20,
      }),
    );
    expect(ad.antidumpingAmount).toBe(200);
    expect(ad.vatBase).toBe(1000 + 160 + 200 + 10);

    const exempt = calculateFullDuties(baseDutyInput({ incoterm: 'CIF', applyExemption: true }));
    expect(exempt.effectiveAdValoremPercent).toBe(0);
    expect(exempt.effectiveVatPercent).toBe(0);
    expect(exempt.vatAmount).toBe(0);
    expect(exempt.customsFeeAmount).toBe(10);
  });

  it('infers originCode and incoterm from dossier, calculator, and document summary', () => {
    const inferred = inferTradeParamsFromContext({
      docSummary: {
        type: 'document_summary',
        id: 'doc-1',
        docTypesDetected: ['invoice'],
        documentReference: 'INV-1',
        shipper: 'Shenzhen Tech Ltd, China',
        routeOrIncoterm: 'CFR La Guaira',
        itemsCount: 1,
        isBatch: false,
      },
      defaultIncoterm: 'FOB',
    });
    expect(inferred).toEqual({ originCode: 'CN', incoterm: 'CFR' });
  });
});
