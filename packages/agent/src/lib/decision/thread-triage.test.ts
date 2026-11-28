import { describe, expect, it, vi } from 'vitest';
import type { DecisionProvider } from './provider.js';
import {
  classifyThreadIntent,
  deriveDeterministicThreadTriage,
  type ThreadTriageInput,
} from './thread-triage.js';

function baseInput(overrides: Partial<ThreadTriageInput> = {}): ThreadTriageInput {
  return {
    firstMessage: 'Necesito ayuda con esta importación',
    hasAttachments: false,
    toolNames: [],
    hasVerdict: false,
    hasDossier: false,
    hasBatchManifest: false,
    hasCalculator: false,
    hasQuestionnaireOrDisambiguation: false,
    hasCriticalOgaOrPreGate: false,
    ...overrides,
  };
}

describe('thread-triage (System 1 hybrid process classifier)', () => {
  it('short-circuits deterministically for batch manifests without invoking DecisionProvider', async () => {
    const classifyChoice = vi.fn();
    const provider: DecisionProvider = { name: 'mock', classifyChoice };

    const result = await classifyThreadIntent(
      baseInput({
        toolNames: ['analyze_invoice_manifest'],
        hasBatchManifest: true,
        batchTotalItems: 10,
        batchCompletedItems: 6,
        batchNeedsInfoItems: 2,
      }),
      provider,
    );

    expect(classifyChoice).not.toHaveBeenCalled();
    expect(result).toEqual({
      processKind: 'invoice_batch',
      operationalStatus: 'needs_input',
      urgency: 'needs_client_info',
      retentionPolicy: 'track_until_approved',
      confidence: 1,
      source: 'deterministic',
    });

    const completedBatch = deriveDeterministicThreadTriage(
      baseInput({
        hasBatchManifest: true,
        batchTotalItems: 4,
        batchCompletedItems: 4,
        batchNeedsInfoItems: 0,
      }),
    );
    expect(completedBatch?.operationalStatus).toBe('approved');
  });

  it('short-circuits deterministically for OGA/in_review escalations, approved dossiers, and pure CIF calculations', async () => {
    const provider: DecisionProvider = { name: 'mock', classifyChoice: vi.fn() };

    const oga = await classifyThreadIntent(
      baseInput({ hasCriticalOgaOrPreGate: true, hasDossier: true, dossierReviewStatus: 'in_review' }),
      provider,
    );
    expect(oga.processKind).toBe('oga_escalation');
    expect(oga.operationalStatus).toBe('in_review');
    expect(oga.urgency).toBe('compliance_sensitive');
    expect(oga.source).toBe('deterministic');

    const approved = await classifyThreadIntent(
      baseInput({ hasVerdict: true, hasDossier: true, dossierReviewStatus: 'approved' }),
      provider,
    );
    expect(approved.processKind).toBe('single_ruling');
    expect(approved.operationalStatus).toBe('approved');
    expect(approved.retentionPolicy).toBe('track_until_approved');

    const needsInput = await classifyThreadIntent(
      baseInput({ hasQuestionnaireOrDisambiguation: true }),
      provider,
    );
    expect(needsInput.processKind).toBe('single_ruling');
    expect(needsInput.operationalStatus).toBe('needs_input');

    const cif = await classifyThreadIntent(
      baseInput({ toolNames: ['calculate_duties'], hasCalculator: true }),
      provider,
    );
    expect(cif.processKind).toBe('cif_simulation');
    expect(cif.source).toBe('deterministic');
    expect(provider.classifyChoice).not.toHaveBeenCalled();
  });

  it('delegates ambiguous free-text first turns to DecisionProvider and tracks system_one policy', async () => {
    const provider: DecisionProvider = {
      name: 'typesafe-jev',
      classifyChoice: vi.fn().mockResolvedValue({ choice: 'quick_lookup', confidence: 0.91 }),
    };

    const result = await classifyThreadIntent(
      baseInput({ firstMessage: '¿Qué porcentaje de IVA aplica en Venezuela en aduana?' }),
      provider,
    );

    expect(provider.classifyChoice).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      processKind: 'quick_lookup',
      operationalStatus: 'processing',
      urgency: 'routine',
      retentionPolicy: 'ephemeral_48h',
      confidence: 0.91,
      source: 'system_one',
    });
  });

  it('never demotes an active process back to quick_lookup, but promotes quick_lookup when tools run', async () => {
    const provider: DecisionProvider = {
      name: 'typesafe-jev',
      classifyChoice: vi.fn().mockResolvedValue({ choice: 'quick_lookup', confidence: 0.88 }),
    };

    const keptActive = await classifyThreadIntent(
      baseInput({
        firstMessage: 'ok gracias',
        previousProcessKind: 'single_ruling',
      }),
      provider,
    );
    expect(keptActive.processKind).toBe('single_ruling');
    expect(keptActive.retentionPolicy).toBe('track_until_approved');

    const promoted = await classifyThreadIntent(
      baseInput({
        firstMessage: 'Clasifica bomba centrífuga 5HP modelo X200',
        previousProcessKind: 'quick_lookup',
        hasVerdict: true,
      }),
      provider,
    );
    expect(promoted.processKind).toBe('single_ruling');
    expect(promoted.source).toBe('deterministic');
  });

  it('falls back safely without throwing when DecisionProvider errors or is absent', async () => {
    const brokenProvider: DecisionProvider = {
      name: 'broken',
      classifyChoice: vi.fn().mockRejectedValue(new Error('TYPESAFE_API_KEY is not set')),
    };

    const res = await classifyThreadIntent(
      baseInput({ firstMessage: 'Bomba sumergible acero inoxidable 2HP' }),
      brokenProvider,
    );
    expect(res.source).toBe('fallback');
    expect(res.processKind).toBe('single_ruling');
    expect(res.retentionPolicy).toBe('track_until_approved');

    const questionFallback = await classifyThreadIntent(
      baseInput({ firstMessage: '¿Qué exige el Régimen 12?' }),
    );
    expect(questionFallback.source).toBe('fallback');
    expect(questionFallback.processKind).toBe('quick_lookup');
    expect(questionFallback.retentionPolicy).toBe('ephemeral_48h');
  });
});
