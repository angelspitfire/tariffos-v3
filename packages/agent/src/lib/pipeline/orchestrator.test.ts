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
      classifyChoice: vi.fn().mockResolvedValue({
        choice: 'prohibited_tariff',
        confidence: 0.92,
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

  it('propagates RGI tokenUsage onto Tier 2 ClassificationLinePayload', async () => {
    const ports = createBasePorts({
      runRgiReasoning: vi.fn().mockResolvedValue({
        hsCode: '8471.30.90.90',
        confidenceLevel: 'Alto',
        confidencePct: 95,
        confidenceReason: 'Verified',
        rgiSteps: [],
        alternatives: [],
        rejected: [],
        flags: [],
        unresolved: [],
        modelUsed: 'nvidia/nemotron-3.5-super-vl',
        tokenUsage: { inputTokens: 4200, outputTokens: 980 },
      }),
    });

    const result = await classifyInvoiceBatch(
      [{ lineId: 'L1', description: 'Laptop computer 14 inch aluminum', originCountry: 'CN', cifValue: 1200 }],
      ports,
      { tenantId: 't1', countryCode: 'VE' },
    );

    expect(result.lines[0]?.tokenUsage).toEqual({ inputTokens: 4200, outputTokens: 980 });
  });

  it('always formats tariff codes with dots across hsCode, alternatives, and rejected', async () => {
    const ports = createBasePorts({
      searchTariffCandidates: vi.fn().mockResolvedValue([
        { ...LAPTOP_TARIFF, hsCode: '8471309090', score: 0.72 },
        { ...LAPTOP_TARIFF, hsCode: '8471301990', score: 0.68 },
      ]),
      verifyHsCode: vi.fn().mockResolvedValue({ ...LAPTOP_TARIFF, hsCode: '8471309090' }),
      runRgiReasoning: vi.fn().mockResolvedValue({
        hsCode: '8471309090',
        confidenceLevel: 'Alto',
        confidencePct: 95,
        confidenceReason: 'Verified',
        rgiSteps: [],
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
        rejected: [{ code: '8517624100', reason: 'Not telecom' }],
        flags: [],
        unresolved: [],
        modelUsed: 'test-model',
      }),
    });

    const result = await classifyInvoiceBatch(
      [{ lineId: 'L1', description: 'Laptop computer 14 inch aluminum', originCountry: 'CN', cifValue: 1200 }],
      ports,
      { tenantId: 't1', countryCode: 'VE' },
    );

    expect(result.lines[0]?.hsCode).toBe('8471.30.90.90');
    expect(result.lines[0]?.alternatives[0]?.code).toBe('8471.30.19.90');
    expect(result.lines[0]?.rejected[0]?.code).toBe('8517.62.41.00');
  });

  it('expands sibling subheadings and propagates customsFee, BK/BIT flags, and trade remedies', async () => {
    const runRgiReasoning = vi.fn().mockResolvedValue({
      hsCode: '7318.15.00.20',
      confidenceLevel: 'Alto',
      confidencePct: 91,
      confidenceReason: 'Tornillo hexagonal roscado acero',
      rgiSteps: [],
      alternatives: [],
      rejected: [],
      flags: [],
      unresolved: [],
      modelUsed: 'test-model',
    });
    const expandSiblingSubheadings = vi.fn().mockResolvedValue([
      {
        hsCode: '7318.15.00.20',
        description: 'Pernos hexagonales de acero',
        adValoremRate: 14,
        ivaRate: 16,
        unit: 'kg',
        customsFeeRate: 1,
        isBK: true,
        isBIT: false,
      },
    ]);
    const ports = createBasePorts({
      searchTariffCandidates: vi.fn().mockResolvedValue([
        {
          hsCode: '7318.15.00.90',
          description: 'Los demás tornillos',
          adValoremRate: 14,
          ivaRate: 16,
          unit: 'kg',
          score: 0.72,
        },
      ]),
      expandSiblingSubheadings,
      verifyHsCode: vi.fn().mockResolvedValue({
        hsCode: '7318.15.00.20',
        description: 'Pernos hexagonales de acero',
        adValoremRate: 14,
        ivaRate: 16,
        unit: 'kg',
        customsFeeRate: 1,
        isBK: true,
        isBIT: false,
      }),
      runRgiReasoning,
    });

    const result = await classifyInvoiceBatch(
      [{ lineId: 'L1', description: 'Pernos hexagonales acero inoxidable M10', originCountry: 'CN', cifValue: 1000 }],
      ports,
      { tenantId: 't1', countryCode: 'VE' },
    );

    expect(expandSiblingSubheadings).toHaveBeenCalledWith('VE', ['731815']);
    const passed = runRgiReasoning.mock.calls[0]?.[0] as { candidates: TariffCandidateRecord[] };
    expect(passed.candidates.map((c) => c.hsCode)).toEqual(['7318.15.00.90', '7318.15.00.20']);
    const line = result.lines[0]!;
    expect(line.duties.customsFeeRate).toBe(1);
    expect(line.duties.customsFeeAmount).toBe(10);
    expect(line.duties.isBK).toBe(true);
    expect(line.flags.some((f) => f.title.includes('Bien de Capital (BK)'))).toBe(true);
    expect(line.flags.some((f) => f.title.includes('antidumping'))).toBe(true);
  });

  it('includes trade remedies on Tier 0 and Tier 1 hits for matching origin and HS chapter', async () => {
    const steelTariff: TariffCandidateRecord = {
      hsCode: '7208.10.00.00',
      description: 'Productos laminados planos de hierro o acero sin alear',
      adValoremRate: 14,
      ivaRate: 16,
      unit: 'kg',
      score: 0.95,
    };

    const tier0Ports = createBasePorts({
      findSkuPrecedent: vi.fn().mockResolvedValue({
        hsCode: '7208.10.00.00',
        officialDescription: steelTariff.description,
        confidencePct: 99,
        approvedByBroker: true,
      }),
      verifyHsCode: vi.fn().mockResolvedValue(steelTariff),
    });

    const tier0Result = await classifyInvoiceBatch(
      [{ lineId: 'L-T0', sku: 'ACERO-7208', description: 'Bobina acero CN', originCountry: 'CN', cifValue: 1000 }],
      tier0Ports,
      { tenantId: 't1', countryCode: 'VE' },
    );
    expect(tier0Result.lines[0]?.tierUsed).toBe('tier0_sku');
    expect(tier0Result.lines[0]?.flags.some((f) => f.title.includes('antidumping'))).toBe(true);

    const tier1Ports = createBasePorts({
      searchTariffCandidates: vi.fn().mockResolvedValue([steelTariff]),
      verifyHsCode: vi.fn().mockResolvedValue(steelTariff),
    });

    const tier1Result = await classifyInvoiceBatch(
      [{ lineId: 'L-T1', description: 'Bobina de acero laminado en caliente', originCountry: 'CN', cifValue: 1000 }],
      tier1Ports,
      { tenantId: 't1', countryCode: 'VE' },
    );
    expect(tier1Result.lines[0]?.tierUsed).toBe('tier1_fast');
    expect(tier1Result.lines[0]?.flags.some((f) => f.title.includes('antidumping'))).toBe(true);
  });

  it('preserves rgi.hsCode on unverified Tier 2 instead of mutating it to topCandidate.hsCode', async () => {
    const ports = createBasePorts({
      searchTariffCandidates: vi.fn().mockResolvedValue([
        { ...LAPTOP_TARIFF, hsCode: '8471.30.12.00', score: 0.72 },
      ]),
      verifyHsCode: vi.fn().mockResolvedValue(null),
      runRgiReasoning: vi.fn().mockResolvedValue({
        hsCode: '8471.30.90.90',
        confidenceLevel: 'Alto',
        confidencePct: 91,
        confidenceReason: 'RGI 1 y 6 hacia 8471.30.90.90',
        rgiSteps: [{ rule: 'RGI 6', note: 'Subheading', items: ['laptop'], conclusion: '8471.30.90.90' }],
        alternatives: [],
        rejected: [],
        flags: [],
        unresolved: [],
        modelUsed: 'reasoning-model',
      }),
    });

    const result = await classifyInvoiceBatch(
      [{ lineId: 'L-UNV', description: 'Laptop computer 14 inch', originCountry: 'CN', cifValue: 1000 }],
      ports,
      { tenantId: 't1', countryCode: 'VE' },
    );

    expect(result.lines[0]?.hsCode).toBe('8471.30.90.90');
    expect(result.lines[0]?.verifiedAgainstDb).toBe(false);
    expect(result.lines[0]?.unresolved.some((u) => u.item.includes('8471.30.90.90'))).toBe(true);
  });

  it('keeps tokenUsage only on representative line and strips it from duplicate clones', async () => {
    const ports = createBasePorts({
      runRgiReasoning: vi.fn().mockResolvedValue({
        hsCode: '8471.30.90.90',
        confidenceLevel: 'Alto',
        confidencePct: 95,
        confidenceReason: 'Verified',
        rgiSteps: [],
        alternatives: [],
        rejected: [],
        flags: [],
        unresolved: [],
        modelUsed: 'test-model',
        tokenUsage: { inputTokens: 1500, outputTokens: 350 },
      }),
    });

    const result = await classifyInvoiceBatch(
      [
        { lineId: 'L1', sku: 'SKU-DUP', description: 'Laptop 14', originCountry: 'CN', cifValue: 1000 },
        { lineId: 'L2', sku: 'SKU-DUP', description: 'Laptop 14', originCountry: 'CN', cifValue: 2000 },
        { lineId: 'L3', sku: 'SKU-DUP', description: 'Laptop 14', originCountry: 'CN', cifValue: 3000 },
      ],
      ports,
      { tenantId: 't1', countryCode: 'VE' },
    );

    expect(result.lines[0]?.tokenUsage).toEqual({ inputTokens: 1500, outputTokens: 350 });
    expect(result.lines[1]?.tokenUsage).toBeUndefined();
    expect(result.lines[2]?.tokenUsage).toBeUndefined();
  });
});
