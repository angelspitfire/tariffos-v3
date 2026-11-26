import { describe, expect, it } from 'vitest';
import type { A2UIDossierComponent, A2UIEnvelope } from '@tariffos/shared-types';
import {
  LOW_CONFIDENCE_REVIEW_THRESHOLD,
  applyApprovalPolicyToEnvelope,
  createAgentReviewTrigger,
  resolveInitialDossierReview,
} from './dossier-approval-policy.js';

function makeDossier(overrides?: Partial<A2UIDossierComponent>): A2UIDossierComponent {
  return {
    type: 'dossier',
    id: 'dossier-1',
    title: 'Dictamen MacBook Pro 14',
    hsCode: '8471.30.90.90',
    officialDescription: 'Portable ADP <=10kg without TV tuner',
    jurisdictionName: 'Venezuela (SENIAT)',
    confidenceLevel: 'Alto',
    confidencePct: 95,
    rgiSteps: [],
    legalNotes: ['Cap. 84 Nota 5(B)'],
    technicalSpecs: [{ key: 'Peso', value: '1.84 kg' }],
    permits: [],
    flags: [],
    unresolved: [],
    verifiedAgainstOfficial: true,
    ...overrides,
  };
}

describe('dossier-approval-policy', () => {
  it('leaves clean high-confidence dossier in draft_ai under agent_decides', () => {
    const resolved = resolveInitialDossierReview(makeDossier(), 'agent_decides');
    expect(resolved.reviewStatus).toBe('draft_ai');
    expect(resolved.agentReviewTrigger).toBeUndefined();
  });

  it('routes to in_review under agent_decides when confidence < 75%, unresolved items, or warn flags exist', () => {
    const lowConf = resolveInitialDossierReview(
      makeDossier({ confidencePct: LOW_CONFIDENCE_REVIEW_THRESHOLD - 1 }),
      'agent_decides',
    );
    expect(lowConf.reviewStatus).toBe('in_review');
    expect(lowConf.agentReviewTrigger?.reason).toContain('74%');

    const withUnresolved = resolveInitialDossierReview(
      makeDossier({ unresolved: ['Confirmar homologación CONATEL'] }),
      'agent_decides',
    );
    expect(withUnresolved.reviewStatus).toBe('in_review');
    expect(withUnresolved.agentReviewTrigger?.missingFields).toEqual([
      'Confirmar homologación CONATEL',
    ]);

    const withWarn = resolveInitialDossierReview(
      makeDossier({
        flags: [{ type: 'warn', title: 'CONATEL', text: 'Requiere homologación de espectro' }],
      }),
      'agent_decides',
    );
    expect(withWarn.reviewStatus).toBe('in_review');
    expect(withWarn.agentReviewTrigger?.reason).toContain('homologación');
  });

  it('honors direct_seal, always_review, already-approved dossiers, and explicit AgentReviewTrigger', () => {
    const direct = resolveInitialDossierReview(
      makeDossier({ confidencePct: 50, unresolved: ['Falta ficha'] }),
      'direct_seal',
    );
    expect(direct.reviewStatus).toBe('draft_ai');

    const always = resolveInitialDossierReview(makeDossier(), 'always_review');
    expect(always.reviewStatus).toBe('in_review');
    expect(always.agentReviewTrigger?.invokedBySkill).toBe('Política de Compliance');

    const approved = resolveInitialDossierReview(
      makeDossier({ reviewStatus: 'approved' }),
      'always_review',
    );
    expect(approved.reviewStatus).toBe('approved');

    const trigger = createAgentReviewTrigger({
      invokedBySkill: 'venezuela-tariff-classification',
      reason: 'Verificar posible medida antidumping en Gaceta Oficial.',
      missingFields: ['Certificado de origen'],
    });
    const triggered = resolveInitialDossierReview(
      makeDossier({ agentReviewTrigger: trigger }),
      'agent_decides',
    );
    expect(triggered.reviewStatus).toBe('in_review');
    expect(triggered.agentReviewTrigger).toEqual(trigger);
  });

  it('applies approval policy immutably to every dossier inside an A2UIEnvelope', () => {
    const envelope: A2UIEnvelope = {
      assistantMessage: 'Clasificado.',
      classificationStatus: 'classified',
      inlineComponents: [],
      canvasComponents: [makeDossier({ confidencePct: 68 })],
    };

    const next = applyApprovalPolicyToEnvelope(envelope, 'agent_decides');
    expect(next).not.toBe(envelope);
    const dossier = next.canvasComponents[0];
    expect(dossier?.type === 'dossier' && dossier.reviewStatus).toBe('in_review');
  });
});
