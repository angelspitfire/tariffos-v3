import { describe, expect, it } from 'vitest';
import {
  FilingLineInputSchema,
  FilingLineSchema,
  FilingsListItemSchema,
  rollupLineCounts,
} from '../filings';

const baseLine = {
  filingId: 'fil_1',
  lineNumber: 1,
  description: 'Redmi Watch 4 (Smart Fitness)',
  hsCode: '8517.62.00.00',
  omaCode: 'OMA 8517.62',
  confidence: 0.96,
  candidates: [
    { code: '8517.62.00.00', prob: 0.96 },
    { code: '8517.11.00.00', prob: 0.03 },
    { code: '9102.11.00.00', prob: 0.01 },
  ],
  status: 'AUTO',
  cifValue: 5000,
  taxBreakdown: { adv: 150, iva: 184, fee: 10, total: 344, currency: 'USD' },
  permits: [{ agency: 'CONATEL', status: 'verified', prob: 0.98 }],
  rgiSteps: [{ rule: 'RGI 1', text: 'Texto de la partida 85.17.' }],
  engineName: 'langgraph',
  engineVersion: 'classifier@2.4',
  corpusVersion: 'v2026.09',
} as const;

describe('FilingLineSchema', () => {
  it('accepts a complete adjudicated line', () => {
    const parsed = FilingLineSchema.parse({ ...baseLine, id: 'line_1' });
    expect(parsed.status).toBe('AUTO');
    expect(parsed.candidates).toHaveLength(3);
  });

  it('accepts a draft line with no adjudication yet', () => {
    const parsed = FilingLineSchema.parse({
      id: 'line_2',
      filingId: 'fil_1',
      lineNumber: 2,
      description: 'Termo Inteligente LCD',
      status: 'DRAFT',
    });
    expect(parsed.candidates).toEqual([]);
    expect(parsed.confidence).toBeUndefined();
  });

  it('rejects out-of-range confidence and probabilities', () => {
    expect(() =>
      FilingLineSchema.parse({ ...baseLine, id: 'x', confidence: 1.5 }),
    ).toThrow();
    expect(() =>
      FilingLineSchema.parse({
        ...baseLine,
        id: 'x',
        candidates: [{ code: '8517.62.00.00', prob: -0.1 }],
      }),
    ).toThrow();
  });

  it('defaults justification to empty texts', () => {
    const parsed = FilingLineSchema.parse({ ...baseLine, id: 'x' });
    expect(parsed.justification).toEqual({
      technical: '',
      colloquial: '',
      alerts: [],
      clarifications: [],
      missingDocuments: [],
    });
  });

  it('FilingLineInput omits server-assigned id', () => {
    const parsed = FilingLineInputSchema.parse(baseLine);
    expect((parsed as Record<string, unknown>).id).toBeUndefined();
    expect(parsed.lineNumber).toBe(1);
  });
});

describe('FilingsListItemSchema', () => {
  it('accepts a list row', () => {
    const parsed = FilingsListItemSchema.parse({
      id: 'fil_1',
      code: 'EXP-2026-XIA-01',
      clientName: 'Xiaomi Latam Corp',
      customsOffice: 'La Guaira 5001',
      counts: { total: 5, auto: 3, confirm: 1, blocked: 1 },
      triage: 'action',
      estimatedTax: 3845.2,
      updatedAt: new Date().toISOString(),
    });
    expect(parsed.triage).toBe('action');
  });
});

describe('rollupLineCounts', () => {
  it('rolls up to action when confirm/blocked lines exist', () => {
    const { counts, triage } = rollupLineCounts([
      { status: 'AUTO' },
      { status: 'AUTO' },
      { status: 'CONFIRM' },
      { status: 'BLOCKED' },
    ]);
    expect(counts).toEqual({ total: 4, auto: 2, confirm: 1, blocked: 1 });
    expect(triage).toBe('action');
  });

  it('buckets NEEDS_INFO lines with confirm so triage flags them (§4.3)', () => {
    const { counts, triage } = rollupLineCounts([{ status: 'AUTO' }, { status: 'NEEDS_INFO' }]);
    expect(counts).toEqual({ total: 2, auto: 1, confirm: 1, blocked: 0 });
    expect(triage).toBe('action');
  });

  it('rolls up to ready when all lines are auto', () => {
    expect(
      rollupLineCounts([{ status: 'AUTO' }, { status: 'AUTO' }]).triage,
    ).toBe('ready');
  });

  it('rolls up to draft when any line is unadjudicated', () => {
    expect(
      rollupLineCounts([{ status: 'AUTO' }, { status: 'DRAFT' }]).triage,
    ).toBe('draft');
    expect(rollupLineCounts([]).triage).toBe('draft');
  });
});
