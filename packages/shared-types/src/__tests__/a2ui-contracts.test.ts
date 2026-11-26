import { describe, expect, it } from 'vitest';
import {
  A2UIEnvelopeSchema,
  ApprovalWorkflowModeSchema,
  AgentReviewTriggerSchema,
  SAAS_PLANS,
  SubscriptionPlanConfigSchema,
} from '../index.js';

describe('A2UI & ApprovalWorkflowMode contracts', () => {
  it('validates all three ApprovalWorkflowMode values', () => {
    expect(ApprovalWorkflowModeSchema.parse('agent_decides')).toBe('agent_decides');
    expect(ApprovalWorkflowModeSchema.parse('direct_seal')).toBe('direct_seal');
    expect(ApprovalWorkflowModeSchema.parse('always_review')).toBe('always_review');
    expect(() => ApprovalWorkflowModeSchema.parse('invalid')).toThrow(/Invalid option/);
  });

  it('validates AgentReviewTrigger with skill provenance and missing fields', () => {
    const parsed = AgentReviewTriggerSchema.parse({
      invokedBySkill: 'venezuela-tariff-classification',
      reason: 'Falta potencia nominal en kW para subpartida 8501.5x',
      missingFields: ['Potencia nominal (kW)'],
    });
    expect(parsed.invokedBySkill).toBe('venezuela-tariff-classification');
    expect(parsed.missingFields).toHaveLength(1);
  });

  it('validates a complete A2UIEnvelope with mandatory verdict and dossier opening in Dictamen', () => {
    const envelope = A2UIEnvelopeSchema.parse({
      assistantMessage: 'Clasificación verificada en el arancel vigente.',
      classificationStatus: 'classified',
      workflowState: 'classified',
      inlineComponents: [
        {
          type: 'verdict',
          id: 'verdict-1',
          hsCode: '8504.40.90.00',
          description: 'Inversores solares híbridos 5kW',
          adValoremPercent: 10,
          vatPercent: 16,
          customsFeePercent: 1,
          legalRegimeCode: 'Sin régimen restrictivo',
          legalRegimeSummary: 'Libre importación.',
          confidenceLabel: 'Alto',
          rgiApplied: ['RGI 1', 'RGI 6'],
          preferredCanvasTab: 'dossier',
        },
      ],
      canvasComponents: [
        {
          type: 'dossier',
          id: 'dossier-1',
          title: 'Inversor solar híbrido 5 kW',
          hsCode: '8504.40.90.00',
          officialDescription: 'Convertidores estáticos.',
          jurisdictionName: 'Venezuela (SENIAT)',
          confidencePct: 92,
          rgiSteps: [{ rule: 'RGI 1', application: 'Partida 85.04' }],
          legalNotes: ['Nota 2 Sección XVI'],
          technicalSpecs: [{ key: 'Potencia', value: '5 kW' }],
          permits: [],
          reviewStatus: 'draft_ai',
        },
      ],
    });

    expect(envelope.inlineComponents).toHaveLength(1);
    expect(envelope.canvasComponents[0]?.type).toBe('dossier');
  });

  it('exposes the 3 commercial B2B SAAS_PLANS (pilot, agencia, enterprise)', () => {
    expect(SAAS_PLANS.map((p) => p.planId)).toEqual([
      'pilot',
      'agencia',
      'enterprise',
    ]);
    for (const plan of SAAS_PLANS) {
      expect(() => SubscriptionPlanConfigSchema.parse(plan)).not.toThrow();
    }
    const pilot = SAAS_PLANS.find((p) => p.planId === 'pilot');
    expect(pilot?.oneTimeOnly).toBe(true);
    expect(pilot?.monthlyPriceUsd).toBe(150);
    expect(pilot?.monthlyQuota).toBe(250);
    expect(pilot?.creditableDays).toBe(30);

    const agencia = SAAS_PLANS.find((p) => p.planId === 'agencia');
    expect(agencia?.monthlyPriceUsd).toBe(300);
    expect(agencia?.monthlyQuota).toBe(1000);

    const enterprise = SAAS_PLANS.find((p) => p.planId === 'enterprise');
    expect(enterprise?.customPricing).toBe(true);
    expect(enterprise?.monthlyPriceUsd).toBe(0);
  });
});
