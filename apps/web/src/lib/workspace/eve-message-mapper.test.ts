import { describe, expect, it } from 'vitest';
import type { A2UIEnvelope } from '@tariffos/shared-types';
import {
  extractEnvelopeFromToolParts,
  extractMessagePlainText,
  getEveToolLabel,
  toWorkspaceMessageFromEve,
} from './eve-message-mapper';

const SAMPLE_ENVELOPE: A2UIEnvelope = {
  assistantMessage: 'Clasificación sugerida 8471.30.00.90',
  classificationStatus: 'classified',
  inlineComponents: [
    {
      type: 'verdict',
      id: 'verdict-1',
      hsCode: '8471.30.00.90',
      description: 'Máquinas automáticas para tratamiento o procesamiento de datos portátiles',
      adValoremPercent: 0,
      vatPercent: 16,
      customsFeePercent: 1,
      legalRegimeCode: 'Libre',
      legalRegimeSummary: 'Sin restricciones',
      confidenceLabel: 'Alto',
      rgiApplied: ['RGI 1', 'RGI 6'],
    },
  ],
  canvasComponents: [
    {
      type: 'dossier',
      id: 'dossier-1',
      title: 'Dictamen Técnico',
      hsCode: '8471.30.00.90',
      officialDescription: 'Computadoras portátiles <= 10 kg',
      jurisdictionName: 'Venezuela (SENIAT — Decreto 4.944)',
      rgiSteps: [],
      legalNotes: [],
      technicalSpecs: [],
      permits: [],
      reviewStatus: 'draft_ai',
    },
  ],
};

describe('eve-message-mapper', () => {
  it('returns localized Spanish labels for running and completed Eve tools', () => {
    expect(getEveToolLabel('classify_item', false)).toContain('Clasificando');
    expect(getEveToolLabel('classify_item', true)).toContain('completada');
    expect(getEveToolLabel('web_search', false)).toContain('Parallel Fast');
    expect(getEveToolLabel('calculate_duties', true)).toContain('Tributos');
    expect(getEveToolLabel('unknown_tool', false)).toContain('unknown_tool');
  });

  it('extracts and validates A2UIEnvelope from classify_item tool results and patches dossier review state', () => {
    const envelope = extractEnvelopeFromToolParts([
      { type: 'text', text: 'Analizando...' },
      {
        type: 'tool-call',
        toolCallId: 'tc-1',
        toolName: 'classify_item',
        args: { description: 'Laptop 14' },
        result: { line: {}, envelope: SAMPLE_ENVELOPE },
      },
      {
        type: 'tool-call',
        toolCallId: 'tc-2',
        toolName: 'request_dossier_review',
        args: { hsCode: '8471.30.00.90', reason: 'Falta peso exacto' },
        result: {
          hsCode: '8471.30.00.90',
          reviewStatus: 'in_review',
          reason: 'Falta peso exacto',
          missingFields: ['Peso kg'],
          invokedBySkill: 've-rgi-audit',
        },
      },
    ]);

    expect(envelope).not.toBeNull();
    const dossier = envelope!.canvasComponents.find((c) => c.type === 'dossier');
    expect(dossier?.reviewStatus).toBe('in_review');
    expect(dossier?.agentReviewTrigger).toEqual({
      reason: 'Falta peso exacto',
      missingFields: ['Peso kg'],
      invokedBySkill: 've-rgi-audit',
    });
  });

  it('ignores invalid envelopes safely and extracts plain text + WorkspaceMessage', () => {
    expect(
      extractEnvelopeFromToolParts([
        {
          type: 'tool-call',
          toolCallId: 'tc-bad',
          toolName: 'classify_item',
          args: {},
          result: { envelope: { invalid: true } },
        },
      ]),
    ).toBeNull();

    const content = [
      { type: 'text', text: 'Dictamen listo.' },
      {
        type: 'tool-call',
        toolCallId: 'tc-1',
        toolName: 'classify_item',
        args: {},
        result: { line: {}, envelope: SAMPLE_ENVELOPE },
      },
    ];

    expect(extractMessagePlainText(content)).toBe('Dictamen listo.');

    const msg = toWorkspaceMessageFromEve({
      id: 'eve-msg-1',
      role: 'assistant',
      createdAt: new Date('2026-11-26T12:00:00.000Z'),
      content,
      jurisdictionId: 've-seniat',
    });

    expect(msg.id).toBe('eve-msg-1');
    expect(msg.text).toBe('Dictamen listo.');
    expect(msg.envelope?.inlineComponents).toHaveLength(1);
    expect(msg.jurisdictionId).toBe('ve-seniat');
  });
});
