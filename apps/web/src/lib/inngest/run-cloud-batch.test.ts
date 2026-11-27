// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ClassificationLinePayload } from '@tariffos/shared-types';

const mocks = vi.hoisted(() => ({
  getActiveLlmRuntimeConfig: vi.fn(),
  createPrismaPipelinePorts: vi.fn(),
  classifyInvoiceBatch: vi.fn(),
  persistFilingLinesAndUsage: vi.fn(),
}));

vi.mock('@/lib/admin/llm-settings', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/admin/llm-settings')>();
  return {
    ...actual,
    getActiveLlmRuntimeConfig: mocks.getActiveLlmRuntimeConfig,
  };
});

vi.mock('@/lib/agent/prisma-ports', () => ({
  createPrismaPipelinePorts: mocks.createPrismaPipelinePorts,
}));

vi.mock('./persist-filing', () => ({
  persistFilingLinesAndUsage: mocks.persistFilingLinesAndUsage,
}));

vi.mock('@tariffos/agent', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tariffos/agent')>();
  return {
    ...actual,
    classifyInvoiceBatch: mocks.classifyInvoiceBatch,
  };
});

import { executeCloudBatchInline, resolveBatchExecutionMode } from './run-cloud-batch';

const SAMPLE_LINE: ClassificationLinePayload = {
  lineId: 'l1',
  product: 'Inversor solar híbrido 5kW',
  hsCode: '8504.40.90.00',
  officialDescription: 'Convertidores estáticos',
  originCountry: 'CN',
  confidenceLevel: 'Alto',
  confidencePct: 92,
  confidenceReason: 'Match oficial',
  rgiSteps: [],
  alternatives: [],
  rejected: [],
  flags: [],
  unresolved: [],
  duties: { cif: 1000, adValoremRate: 14, arancelAmount: 140, ivaRate: 16, ivaAmount: 182.4, unit: 'u' },
  tierUsed: 'tier2_rgi',
  verifiedAgainstDb: true,
  modelUsed: 'test',
};

describe('run-cloud-batch', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it('defaults to inline in local development even when INNGEST_EVENT_KEY is present', () => {
    vi.stubEnv('NODE_ENV', 'development');
    delete process.env.BATCH_EXECUTION_MODE;
    delete process.env.INNGEST_DEV;
    process.env.INNGEST_EVENT_KEY = 'evt-key-in-env-local';
    expect(resolveBatchExecutionMode()).toBe('inline');

    process.env.INNGEST_DEV = '1';
    expect(resolveBatchExecutionMode()).toBe('inngest');

    delete process.env.INNGEST_DEV;
    process.env.BATCH_EXECUTION_MODE = 'inngest';
    expect(resolveBatchExecutionMode()).toBe('inngest');

    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.BATCH_EXECUTION_MODE;
    expect(resolveBatchExecutionMode()).toBe('inngest');

    process.env.BATCH_EXECUTION_MODE = 'inline';
    expect(resolveBatchExecutionMode()).toBe('inline');
  });

  it('deduplicates identical items, classifies reps, expands members, and persists to Filing', async () => {
    mocks.getActiveLlmRuntimeConfig.mockResolvedValue({ source: 'env' });
    mocks.createPrismaPipelinePorts.mockReturnValue({});
    mocks.classifyInvoiceBatch.mockResolvedValue({
      lines: [SAMPLE_LINE],
      stats: { totalLines: 1, uniqueItems: 1, blockedByPreGate: 0, tier0Hits: 0, tier1Hits: 1, tier2Hits: 0, webGroundingUsed: 0 },
    });
    mocks.persistFilingLinesAndUsage.mockResolvedValue({ persisted: 2 });

    const out = await executeCloudBatchInline({
      filingId: 'fil-inline-1',
      tenantId: 'tenant-ve',
      countryCode: 'VE',
      deepMode: false,
      fileName: 'lote.xlsx',
      items: [
        { lineId: 'l1', sku: 'INV-5KW', description: 'Inversor solar híbrido 5kW', originCountry: 'CN', cifValue: 1000 },
        { lineId: 'l2', sku: 'INV-5KW', description: 'Inversor solar híbrido 5kW', originCountry: 'CN', cifValue: 2000 },
      ],
    });

    expect(mocks.classifyInvoiceBatch).toHaveBeenCalledTimes(1);
    expect(mocks.persistFilingLinesAndUsage).toHaveBeenCalledWith(
      expect.objectContaining({ filingId: 'fil-inline-1', tenantId: 'tenant-ve' }),
    );
    expect(out.lines).toHaveLength(2);
    expect(out.lines[1]?.duties.cif).toBe(2000);
    expect(out.summary.totalCifUsd).toBe(3000);
    expect(out.envelope.canvasComponents[0]?.type).toBe('batch_manifest');
  });

  it('preserves original item order and strips tokenUsage from duplicate clones', async () => {
    mocks.getActiveLlmRuntimeConfig.mockResolvedValue({ source: 'env' });
    mocks.createPrismaPipelinePorts.mockReturnValue({});
    mocks.classifyInvoiceBatch.mockResolvedValue({
      lines: [
        { ...SAMPLE_LINE, lineId: 'l1', tokenUsage: { inputTokens: 800, outputTokens: 200 } },
        { ...SAMPLE_LINE, lineId: 'l2', hsCode: '8501.52.10.00', tokenUsage: { inputTokens: 900, outputTokens: 250 } },
      ],
      stats: { totalLines: 2, uniqueItems: 2, blockedByPreGate: 0, tier0Hits: 0, tier1Hits: 0, tier2Hits: 2, webGroundingUsed: 0 },
    });
    mocks.persistFilingLinesAndUsage.mockResolvedValue({ persisted: 3 });

    const out = await executeCloudBatchInline({
      filingId: 'fil-order-1',
      tenantId: 'tenant-ve',
      countryCode: 'VE',
      deepMode: false,
      items: [
        { lineId: 'l1', sku: 'SKU-A', description: 'Inversor solar 5kW', originCountry: 'CN', cifValue: 1000 },
        { lineId: 'l2', sku: 'SKU-B', description: 'Motor eléctrico 5HP', originCountry: 'CN', cifValue: 500 },
        { lineId: 'l3', sku: 'SKU-A', description: 'Inversor solar 5kW', originCountry: 'CN', cifValue: 2000 },
      ],
    });

    expect(out.lines.map((l) => l.lineId)).toEqual(['l1', 'l2', 'l3']);
    expect(out.lines[0]?.tokenUsage).toEqual({ inputTokens: 800, outputTokens: 200 });
    expect(out.lines[2]?.tokenUsage).toBeUndefined();
  });
});
