import { describe, expect, it, vi } from 'vitest';
import { classifyInvoiceBatch } from './orchestrator.js';
import type { PipelinePorts, TariffCandidateRecord } from './types.js';
import type { DecisionProvider } from '../decision/provider.js';

const LAPTOP_TARIFF: TariffCandidateRecord = {
  hsCode: '8471.30.90.90',
  description: 'Portable automatic data processing machines <=10kg, without TV tuner',
  adValoremRate: 16,
  ivaRate: 16,
  unit: 'u',
  permits: ['CONATEL'],
  score: 0.72,
};

function createBasePorts(overrides?: Partial<PipelinePorts>): PipelinePorts {
  return {
    findSkuPrecedent: vi.fn().mockResolvedValue(null),
    searchTariffCandidates: vi.fn().mockResolvedValue([LAPTOP_TARIFF]),
    getLegalNotes: vi.fn().mockResolvedValue([{ ref: 'Cap. 84 Nota 5(B)', text: 'CPU + input + output' }]),
    verifyHsCode: vi.fn().mockResolvedValue(LAPTOP_TARIFF),
    runRgiReasoning: vi.fn().mockResolvedValue({
      hsCode: '8471.30.90.90',
      confidenceLevel: 'Alto',
      confidencePct: 95,
      confidenceReason: 'Matches 8471.30.90.90 under RGI 1 and Note 5(B)',
      rgiSteps: [
        {
          rule: 'RGI 1',
          note: 'Cap. 84 Nota 5(B)',
          items: ['CPU + keyboard + display <= 10kg'],
          conclusion: '84.71',
        },
      ],
      alternatives: [],
      rejected: [],
      flags: [],
      unresolved: [],
      modelUsed: 'reasoning-model',
    }),
    ...overrides,
  };
}

describe('classifyInvoiceBatch', () => {
  it('blocks prohibited goods in Pre-Gate before calling RGI reasoning', async () => {
    const decisionProvider: DecisionProvider = {
      name: 'mock-system-one',
      systemOne: vi.fn().mockResolvedValue({
        model: 'system-one',
        answers: {
          compliance_status: { type: 'choice', choice: 'prohibited_tariff', confidence: 0.92 },
        },
        usage: { input_tokens: 10, output_tokens: 5 },
      }),
    };
    const ports = createBasePorts({ decisionProvider });

    const result = await classifyInvoiceBatch(
      [{ lineId: 'L1', description: 'Illicit narcotic substance', originCountry: 'CO', cifValue: 1000 }],
      ports,
      { tenantId: 't1', countryCode: 'VE' },
    );

    expect(result.stats.blockedByPreGate).toBe(1);
    expect(result.lines[0]?.tierUsed).toBe('pre_gate_blocked');
    expect(result.lines[0]?.flags[0]?.type).toBe('blocking');
    expect(ports.runRgiReasoning).not.toHaveBeenCalled();
  });

  it('deduplicates identical invoice lines and computes deterministic duties per line CIF', async () => {
    const ports = createBasePorts();

    const result = await classifyInvoiceBatch(
      [
        { lineId: 'L1', sku: 'MBP-14', description: 'MacBook Pro 14', originCountry: 'CN', cifValue: 2000 },
        { lineId: 'L2', sku: 'MBP-14', description: 'MacBook Pro 14', originCountry: 'CN', cifValue: 4000 },
      ],
      ports,
      { tenantId: 't1', countryCode: 'VE' },
    );

    expect(result.stats.uniqueItems).toBe(1);
    expect(result.stats.tier2Hits).toBe(2);
    expect(ports.runRgiReasoning).toHaveBeenCalledTimes(1);
    expect(result.lines[0]?.duties.arancelAmount).toBe(320);
    expect(result.lines[1]?.duties.arancelAmount).toBe(640);
  });

  it('uses Tier 0 ProductMaster precedent with zero LLM reasoning calls', async () => {
    const ports = createBasePorts({
      findSkuPrecedent: vi.fn().mockResolvedValue({
        hsCode: '8471.30.90.90',
        officialDescription: LAPTOP_TARIFF.description,
        confidencePct: 99,
        approvedByBroker: true,
      }),
    });

    const result = await classifyInvoiceBatch(
      [{ lineId: 'L1', sku: 'MBP-14', description: 'MacBook Pro 14', originCountry: 'CN', cifValue: 1000 }],
      ports,
      { tenantId: 't1', countryCode: 'VE' },
    );

    expect(result.stats.tier0Hits).toBe(1);
    expect(result.lines[0]?.tierUsed).toBe('tier0_sku');
    expect(ports.runRgiReasoning).not.toHaveBeenCalled();
  });

  it('enforces maxWebGrounding budget on short descriptions in Standard mode', async () => {
    const fetchWebSpecs = vi.fn().mockResolvedValue('1.84 kg aluminum laptop');
    const ports = createBasePorts({ fetchWebSpecs });

    const result = await classifyInvoiceBatch(
      [
        { lineId: 'L1', description: 'A123', originCountry: 'CN', cifValue: 500 },
        { lineId: 'L2', description: 'B456', originCountry: 'CN', cifValue: 500 },
      ],
      ports,
      { tenantId: 't1', countryCode: 'VE', maxWebGrounding: 1, deepMode: false },
    );

    expect(result.stats.webGroundingUsed).toBe(1);
    expect(fetchWebSpecs).toHaveBeenCalledTimes(1);
  });

  it('enforces DEFAULT_MAX_WEB_GROUNDING_STANDARD (12) in Standard mode', async () => {
    const fetchWebSpecs = vi.fn().mockResolvedValue('specs');
    const ports = createBasePorts({ fetchWebSpecs });
    const items = Array.from({ length: 15 }, (_, idx) => ({
      lineId: `L${idx + 1}`,
      description: `SKU${idx + 1}`,
      originCountry: 'CN',
      cifValue: 100,
    }));

    const result = await classifyInvoiceBatch(items, ports, {
      tenantId: 't1',
      countryCode: 'VE',
      deepMode: false,
    });

    expect(result.stats.webGroundingUsed).toBe(12);
    expect(fetchWebSpecs).toHaveBeenCalledTimes(12);
  });

  it('combines vector and lexical candidates and filters out off-chapter legal notes', async () => {
    const runRgiReasoning = vi.fn().mockResolvedValue({
      hsCode: '8471.30.90.90',
      confidenceLevel: 'Alto',
      confidencePct: 93,
      confidenceReason: 'Verified via hybrid retrieval',
      rgiSteps: [],
      alternatives: [],
      rejected: [],
      flags: [],
      unresolved: [],
      modelUsed: 'reasoning-model',
    });

    const ports = createBasePorts({
      searchVectorCandidates: vi.fn().mockResolvedValue([
        { ...LAPTOP_TARIFF, hsCode: '8471.30.12.90', score: 0.8 },
        { ...LAPTOP_TARIFF, hsCode: '8471.30.90.90', score: 0.75 },
      ]),
      searchTariffCandidates: vi.fn().mockResolvedValue([
        { ...LAPTOP_TARIFF, hsCode: '8471.30.90.90', score: 0.72 },
        { ...LAPTOP_TARIFF, hsCode: '8471.30.12.90', score: 0.71 },
      ]),
      getLegalNotes: vi.fn().mockResolvedValue([
        { ref: 'Cap. 84 Nota 5(B)', text: 'Valid chapter 84 note' },
        { ref: 'Cap. 91 Nota 2', text: 'Irrelevant chapter 91 note', chapter: '91' },
      ]),
      runRgiReasoning,
    });

    await classifyInvoiceBatch(
      [{ lineId: 'L1', description: 'Laptop computer 14 inch aluminum', originCountry: 'CN', cifValue: 1200 }],
      ports,
      { tenantId: 't1', countryCode: 'VE' },
    );

    const passedInput = runRgiReasoning.mock.calls[0]?.[0] as { notes: Array<{ ref: string }> };
    expect(passedInput.notes.map((n) => n.ref)).toEqual(['Cap. 84 Nota 5(B)']);
  });

  it('flags official schedule audit discrepancy when verifyHsCode returns a different code', async () => {
    const ports = createBasePorts({
      verifyHsCode: vi.fn().mockResolvedValue({
        ...LAPTOP_TARIFF,
        hsCode: '8471.30.19.90',
      }),
    });

    const result = await classifyInvoiceBatch(
      [{ lineId: 'L1', description: 'Laptop computer 14 inch aluminum', originCountry: 'CN', cifValue: 1200 }],
      ports,
      { tenantId: 't1', countryCode: 'VE' },
    );

    expect(result.lines[0]?.verifiedAgainstDb).toBe(false);
    expect(result.lines[0]?.flags.some((f) => f.title.includes('Auditoría'))).toBe(true);
  });

  it('emits real stage progress events in order during Tier 2 classification', async () => {
    const ports = createBasePorts();
    const stages: string[] = [];

    await classifyInvoiceBatch(
      [{ lineId: 'L1', description: 'Laptop computer 14 inch aluminum', originCountry: 'CN', cifValue: 1200 }],
      ports,
      {
        tenantId: 't1',
        countryCode: 'VE',
        onProgress: (event) => stages.push(event.stage),
      },
    );

    expect(stages).toEqual([
      'pre_gate',
      'sku_lookup',
      'hybrid_retrieval',
      'rgi_reasoning',
      'verifying_tariff',
    ]);
  });
});
