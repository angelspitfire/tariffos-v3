import { describe, expect, it } from 'vitest';
import type { A2UIEnvelope } from '@tariffos/shared-types';
import {
  extractEnvelopeFromToolParts,
  extractMessagePlainText,
  getEveToolActivity,
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
  it('returns localized Spanish labels and argument details for tools, skills, and preliminary phases', () => {
    expect(getEveToolLabel('classify_item', false)).toContain('Clasificando');
    expect(getEveToolLabel('classify_item', true)).toContain('completada');
    expect(getEveToolLabel('web_search', false)).toContain('Parallel Fast');
    expect(getEveToolLabel('calculate_duties', true)).toContain('Tributos');
    expect(getEveToolLabel('get_bcv_rate', false)).toContain('BCV');
    expect(getEveToolLabel('request_technical_clarification', true)).toContain('Validación');
    expect(getEveToolLabel('analyze_invoice_manifest', true)).toContain('Manifiesto');
    expect(getEveToolLabel('ve-rgi-classification', true)).toContain('RGI Venezuela');
    expect(getEveToolLabel('unknown_tool', false)).toContain('unknown_tool');

    expect(
      getEveToolActivity('verify_hs_code', true, { hsCode: '8471.30.90.90' }),
    ).toEqual({
      label: 'Código HS verificado',
      detail: '8471.30.90.90',
    });

    expect(
      getEveToolActivity(
        'analyze_invoice_manifest',
        false,
        { documentReference: 'FAC-100' },
        'Clasificando 5 líneas…',
      ),
    ).toEqual({
      label: 'Clasificando 5 líneas…',
      detail: 'FAC-100',
    });
  });

  it('extracts A2UIEnvelope from classify_item, patches dossier review, and merges calculate_duties calculatorComponent', () => {
    const envelope = extractEnvelopeFromToolParts([
      { type: 'text', text: 'Analizando…' },
      {
        type: 'tool-call',
        toolCallId: 'tc-prelim',
        toolName: 'analyze_invoice_manifest',
        isPreliminary: true,
        result: { phase: 'Procesando…', envelope: null },
      },
      {
        type: 'tool-call',
        toolCallId: 'tc-1',
        toolName: 'classify_item',
        args: { description: 'Laptop 14' },
        result: { line: {}, envelope: SAMPLE_ENVELOPE },
      },
      {
        type: 'tool-call',
        toolCallId: 'tc-calc',
        toolName: 'calculate_duties',
        args: { hsCode: '8471.30.00.90' },
        result: {
          calculatorComponent: {
            type: 'calculator',
            id: 'calc-1',
            title: 'Liquidación CIF · 8471.30.00.90',
            hsCode: '8471.30.00.90',
            adValoremPercent: 0,
            vatPercent: 16,
            customsServiceFeePercent: 1,
            currencyCode: 'USD',
            localCurrencyCode: 'VES',
            suggestedExchangeRate: 45,
            exemptionAvailable: false,
          },
        },
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
          invokedBySkill: 'oga-compliance-review',
        },
      },
    ]);

    expect(envelope).not.toBeNull();
    const dossier = envelope!.canvasComponents.find((c) => c.type === 'dossier');
    expect(dossier?.reviewStatus).toBe('in_review');
    expect(dossier?.agentReviewTrigger).toEqual({
      reason: 'Falta peso exacto',
      missingFields: ['Peso kg'],
      invokedBySkill: 'oga-compliance-review',
    });
    expect(envelope!.canvasComponents.some((c) => c.type === 'calculator')).toBe(true);
  });

  it('extracts standalone calculatorComponent and HITL questionnaire envelope with assistantMessage fallback', () => {
    const calcOnly = extractEnvelopeFromToolParts([
      {
        type: 'tool-call',
        toolCallId: 'tc-calc-solo',
        toolName: 'calculate_duties',
        args: { hsCode: '9102.19.00.00' },
        result: {
          calculatorComponent: {
            type: 'calculator',
            id: 'calc-solo',
            title: 'Liquidación CIF · 9102.19.00.00',
            hsCode: '9102.19.00.00',
            adValoremPercent: 20,
            vatPercent: 16,
            customsServiceFeePercent: 1,
            currencyCode: 'USD',
            localCurrencyCode: 'VES',
            suggestedExchangeRate: 46,
            exemptionAvailable: false,
          },
        },
      },
    ]);
    expect(calcOnly?.canvasComponents[0]?.type).toBe('calculator');

    const hitlMsg = toWorkspaceMessageFromEve({
      id: 'eve-hitl-1',
      role: 'assistant',
      createdAt: new Date('2026-11-26T12:10:00.000Z'),
      jurisdictionId: 've-seniat',
      content: [
        {
          type: 'tool-call',
          toolCallId: 'tc-hitl',
          toolName: 'request_technical_clarification',
          args: { title: 'Datos del motor' },
          result: {
            status: 'needs_input',
            envelope: {
              assistantMessage: 'Confirma potencia nominal y fases para clasificar en 85.01:',
              classificationStatus: 'needs_details',
              workflowState: 'needs_input',
              inlineComponents: [
                {
                  type: 'questionnaire',
                  id: 'q-1',
                  title: 'Datos del motor',
                  fields: [{ id: 'kw', label: 'Potencia', fieldType: 'number', unit: 'kW' }],
                },
              ],
              canvasComponents: [],
            },
          },
        },
      ],
    });

    expect(hitlMsg.text).toContain('Confirma potencia nominal');
    expect(hitlMsg.envelope?.inlineComponents[0]?.type).toBe('questionnaire');
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
