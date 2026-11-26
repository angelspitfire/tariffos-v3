// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ClassificationLinePayload } from '@tariffos/shared-types';

const mocks = vi.hoisted(() => ({
  getActiveLlmRuntimeConfig: vi.fn(),
  createPrismaPipelinePorts: vi.fn(),
  classifyInvoiceBatch: vi.fn(),
  persistFilingLinesAndUsage: vi.fn(),
}));

vi.mock('@/lib/admin/llm-settings', () => ({
  getActiveLlmRuntimeConfig: mocks.getActiveLlmRuntimeConfig,
}));

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
});
