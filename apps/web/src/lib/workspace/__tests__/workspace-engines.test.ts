import { describe, expect, it } from 'vitest';
import { A2UIEnvelopeSchema } from '@tariffos/shared-types';
import { calculateDeterministicDuties } from '../duty-engine';
import { resolveInitialDossierReview } from '../dossier-approval-policy';
import { classifyOffline } from '../offline-classifier';
import { getJurisdictionById } from '../jurisdictions';

describe('workspace domain engines', () => {
  it('computes deterministic CIF duties, VAT, and landed cost for Venezuela', () => {
    const res = calculateDeterministicDuties({
      jurisdictionId: 've-seniat',
      hsCode: '8504.40.90.00',
      originCode: 'CN',
      incoterm: 'FOB',
      invoiceAmount: 5000,
      originChargesAmount: 0,
      freightAmount: 450,
      insuranceAmount: 50,
      baseAdValoremPercent: 10,
      vatPercent: 16,
      customsFeePercent: 1,
      exchangeRate: 46.5,
      applyExemption: false,
      hasCertificateOfOrigin: false,
      applyAntidumping: false,
      antidumpingPercent: 0,
    });

    expect(res.customsValue).toBe(5500);
    expect(res.adValoremAmount).toBeCloseTo(550, 2);
    expect(res.customsFeeAmount).toBeCloseTo(55, 2);
    expect(res.vatBase).toBeCloseTo(6105, 2);
    expect(res.vatAmount).toBeCloseTo(976.8, 2);
    expect(res.totalTaxes).toBeCloseTo(1581.8, 2);
    expect(res.landedCost).toBeCloseTo(7081.8, 2);
  });

  it('triggers in_review under agent_decides when dossier has unresolved fields or low confidence', () => {
    const resolved = resolveInitialDossierReview(
      {
        type: 'dossier',
        id: 'dos-1',
        title: 'Motor eléctrico',
        hsCode: '8501.52.10.00',
        officialDescription: 'Motores de corriente alterna polifásicos',
        jurisdictionName: 'Venezuela (SENIAT)',
        confidencePct: 68,
        rgiSteps: [],
        legalNotes: [],
        technicalSpecs: [],
        permits: [],
        unresolved: ['Potencia nominal en kW'],
      },
      'agent_decides'
    );

    expect(resolved.reviewStatus).toBe('in_review');
    expect(resolved.agentReviewTrigger?.missingFields).toEqual(['Potencia nominal en kW']);
  });

  it('produces valid A2UI envelopes in offline mode for individual, ambiguous HITL, and batch inputs', () => {
    const jur = getJurisdictionById('ve-seniat');

    const single = classifyOffline({
      query: 'Ecógrafo portátil Doppler a color con 2 transductores',
      jurisdiction: jur,
    });
    expect(A2UIEnvelopeSchema.safeParse(single).success).toBe(true);
    expect(single.classificationStatus).toBe('classified');

    const ambiguous = classifyOffline({
      query: 'Motor eléctrico trifásico para bomba industrial',
      jurisdiction: jur,
    });
    expect(A2UIEnvelopeSchema.safeParse(ambiguous).success).toBe(true);
    expect(ambiguous.workflowState).toBe('needs_input');
    expect(ambiguous.decision?.tentativeProposal?.hsCode).toBeTruthy();

    const batch = classifyOffline({
      query: 'Clasificar en lote factura comercial con 4 ítems de kit solar',
      jurisdiction: jur,
      isBatchHint: true,
    });
    expect(A2UIEnvelopeSchema.safeParse(batch).success).toBe(true);
    expect(batch.canvasComponents.some((c) => c.type === 'batch_manifest')).toBe(true);
  });
});
