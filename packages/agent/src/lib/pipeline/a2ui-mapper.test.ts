import { describe, expect, it } from 'vitest';
import { A2UIEnvelopeSchema, type ClassificationLinePayload } from '@tariffos/shared-types';
import { createAgentReviewTrigger } from './dossier-approval-policy.js';
import { mapPayloadToA2UIEnvelope } from './a2ui-mapper.js';

function makeClassifiedPayload(
  overrides?: Partial<ClassificationLinePayload>,
): ClassificationLinePayload {
  return {
    lineId: 'L1',
    product: 'MacBook Pro 14 M5 Max',
    hsCode: '8471.30.90.90',
    officialDescription: 'Máquinas automáticas tratamiento de datos portátiles <=10kg',
    originCountry: 'CN',
    confidenceLevel: 'Alto',
    confidencePct: 95,
    confidenceReason: 'Cap. 84 Nota 5(B) explícita; peso 1.84kg <= 10kg.',
    rgiSteps: [
      {
        rule: 'RGI 1',
        note: 'Cap. 84 Nota 5(B)',
        items: ['CPU + teclado + visualizador <= 10kg'],
        conclusion: '84.71',
      },
      {
        rule: 'RGI 6',
        note: 'Subpartida nacional',
        items: ['Sin sintonizador de TV'],
        conclusion: '8471.30.90.90',
      },
    ],
    alternatives: [],
    rejected: [{ code: '8517.12.00.00', reason: 'No es teléfono', rule: 'Cap. 84 Nota 5(B)' }],
    flags: [],
    unresolved: [],
    duties: {
      cif: 0,
      adValoremRate: 16,
      arancelAmount: 0,
      ivaRate: 16,
      ivaAmount: 0,
      unit: 'u',
    },
    tierUsed: 'tier2_rgi',
    verifiedAgainstDb: true,
    modelUsed: 'reasoning-model',
    ...overrides,
  };
}

describe('mapPayloadToA2UIEnvelope', () => {
  it('emits only mandatory verdict + dossier on clean classified payload with cif=0 and no alternatives/permits', () => {
    const envelope = mapPayloadToA2UIEnvelope(makeClassifiedPayload(), {
      approvalWorkflowMode: 'agent_decides',
    });

    expect(() => A2UIEnvelopeSchema.parse(envelope)).not.toThrow();
    expect(envelope.classificationStatus).toBe('classified');

    // Mandatory inline: verdict only (no legal_notice because no permits/warnings/regime)
    expect(envelope.inlineComponents.map((c) => c.type)).toEqual(['verdict']);
    const verdict = envelope.inlineComponents[0];
    expect(verdict?.type === 'verdict' && verdict.preferredCanvasTab).toBe('dossier');

    // Mandatory canvas: dossier only (no comparison because alternatives=[], no calculator because cif=0)
    expect(envelope.canvasComponents.map((c) => c.type)).toEqual(['dossier']);
    const dossier = envelope.canvasComponents[0];
    expect(dossier?.type === 'dossier' && dossier.reviewStatus).toBe('draft_ai');
  });

  it('emits contextual legal_notice, comparison, and calculator only when triggered by payload data', () => {
    const payload = makeClassifiedPayload({
      alternatives: [
        {
          code: '8471.30.19.90',
          desc: 'Las demás portátiles con batería',
          confLevel: 'medio',
          confPct: 20,
          whyApply: 'Tiene batería interna',
          whyNot: '8471.30.90.90 es más específica',
        },
      ],
      flags: [
        {
          type: 'warn',
          title: 'OGA Permit: CONATEL',
          text: 'Requiere homologación CONATEL por Wi-Fi 7 y Bluetooth.',
        },
      ],
      duties: {
        cif: 2400,
        adValoremRate: 16,
        arancelAmount: 384,
        ivaRate: 16,
        ivaAmount: 445.44,
        unit: 'u',
      },
    });

    const envelope = mapPayloadToA2UIEnvelope(payload, {
      approvalWorkflowMode: 'agent_decides',
      legalRegimeCode: 'RL 6 / CONATEL',
    });

    expect(() => A2UIEnvelopeSchema.parse(envelope)).not.toThrow();
    expect(envelope.inlineComponents.map((c) => c.type)).toEqual(['verdict', 'legal_notice']);
    expect(envelope.canvasComponents.map((c) => c.type)).toEqual([
      'dossier',
      'comparison',
      'calculator',
    ]);

    // Warn flag triggers in_review under agent_decides
    const dossier = envelope.canvasComponents.find((c) => c.type === 'dossier');
    expect(dossier?.type === 'dossier' && dossier.reviewStatus).toBe('in_review');
  });

  it('applies approvalWorkflowMode (direct_seal vs always_review) and preserves explicit AgentReviewTrigger', () => {
    const direct = mapPayloadToA2UIEnvelope(
      makeClassifiedPayload({ confidencePct: 60 }),
      { approvalWorkflowMode: 'direct_seal' },
    );
    const directDossier = direct.canvasComponents.find((c) => c.type === 'dossier');
    expect(directDossier?.type === 'dossier' && directDossier.reviewStatus).toBe('draft_ai');

    const trigger = createAgentReviewTrigger({
      invokedBySkill: 'request_dossier_review',
      reason: 'Verificar posible medida antidumping',
    });
    const triggered = mapPayloadToA2UIEnvelope(makeClassifiedPayload(), {
      approvalWorkflowMode: 'agent_decides',
      agentReviewTrigger: trigger,
    });
    const trigDossier = triggered.canvasComponents.find((c) => c.type === 'dossier');
    expect(trigDossier?.type === 'dossier' && trigDossier.reviewStatus).toBe('in_review');
    expect(trigDossier?.type === 'dossier' && trigDossier.agentReviewTrigger).toEqual(trigger);
  });

  it('handles pre_gate_blocked payload with restricted legal_notice and in_review dossier', () => {
    const blocked = mapPayloadToA2UIEnvelope(
      makeClassifiedPayload({
        hsCode: '0000.00.00.00',
        tierUsed: 'pre_gate_blocked',
        confidenceLevel: 'Bajo',
        confidencePct: 92,
        verifiedAgainstDb: false,
        flags: [
          {
            type: 'blocking',
            title: 'Pre-Gate Compliance (prohibited_tariff)',
            text: 'Mercancía potencialmente prohibida.',
          },
        ],
      }),
    );

    expect(() => A2UIEnvelopeSchema.parse(blocked)).not.toThrow();
    expect(blocked.classificationStatus).toBe('needs_details');
    expect(blocked.workflowState).toBe('proposed_review');
    const notice = blocked.inlineComponents.find((c) => c.type === 'legal_notice');
    expect(notice?.type === 'legal_notice' && notice.severity).toBe('restricted');
  });

  it('always formats unformatted tariff codes with dots in A2UI outputs', () => {
    const envelope = mapPayloadToA2UIEnvelope(
      makeClassifiedPayload({
        hsCode: '8471309090',
        alternatives: [
          {
            code: '8471301990',
            desc: 'Alt',
            confLevel: 'medio',
            confPct: 20,
            whyApply: 'Alt',
            whyNot: 'Less specific',
          },
        ],
      }),
      { includeCalculator: true },
    );

    expect(envelope.assistantMessage).toContain('8471.30.90.90');
    const verdict = envelope.inlineComponents.find((c) => c.type === 'verdict');
    expect(verdict?.type === 'verdict' && verdict.hsCode).toBe('8471.30.90.90');
    const dossier = envelope.canvasComponents.find((c) => c.type === 'dossier');
    expect(dossier?.type === 'dossier' && dossier.hsCode).toBe('8471.30.90.90');
    const comp = envelope.canvasComponents.find((c) => c.type === 'comparison');
    expect(comp?.type === 'comparison' && comp.candidates.map((c) => c.hsCode)).toEqual([
      '8471.30.90.90',
      '8471.30.19.90',
    ]);
    const calc = envelope.canvasComponents.find((c) => c.type === 'calculator');
    expect(calc?.type === 'calculator' && calc.hsCode).toBe('8471.30.90.90');
  });

  it('produces a broker-grade Spanish assistantMessage with draft header, rationale, and unresolved next steps', () => {
    const envelope = mapPayloadToA2UIEnvelope(
      makeClassifiedPayload({
        product: 'Compresor de aire de tornillo RTF-100',
        hsCode: '8414.80.12.00',
        confidenceLevel: 'Alto',
        confidencePct: 90,
        confidenceReason: 'Compresor de tornillo estacionario de 75 kW cubierto en RGI 1 y RGI 6.',
        unresolved: [
          { item: 'Confirmar ausencia de chasis remolcable con ruedas', source: 'Ficha técnica', resolved: false },
        ],
      }),
    );

    expect(envelope.assistantMessage).toContain('BORRADOR — REVISIÓN DE AGENTE ADUANAL');
    expect(envelope.assistantMessage).toContain('8414.80.12.00');
    expect(envelope.assistantMessage).toContain('Compresor de tornillo estacionario');
    expect(envelope.assistantMessage).toContain('Pendiente por confirmar');
    expect(envelope.assistantMessage).toContain('Confirmar ausencia de chasis remolcable');
  });
});
