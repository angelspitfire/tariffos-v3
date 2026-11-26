import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
  executeRaw: vi.fn(),
}));

vi.mock('@tariffos/database', () => ({
  Prisma: {
    sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
      sql: strings.join('?'),
      values,
    }),
  },
  prisma: {
    $queryRaw: mocks.queryRaw,
    $executeRaw: mocks.executeRaw,
  },
}));

import {
  saveProductMasterEmbedding,
  searchProductMasterSemantic,
  SEMANTIC_TIER0_THRESHOLD,
} from './product-master-embedding';

describe('product-master-embedding', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NVIDIA_API_KEY = 'nvapi-test';
    delete process.env.EMBEDDING_DIMS;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it('returns semantic ProductMaster match when cosine similarity >= 0.94', async () => {
    const vec = new Array(768).fill(0.02);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ embedding: vec }] }), { status: 200 })),
    );
    mocks.queryRaw.mockResolvedValue([
      {
        hsCode: '8471.30.90.90',
        description: 'Laptop MacBook Pro 14 M3 16GB',
        confidence: 0.99,
        similarity: 0.962,
      },
    ]);

    const hit = await searchProductMasterSemantic('tenant-1', 'Apple MacBook Pro 14 M3 16GB RAM');
    expect(hit).toEqual({
      hsCode: '8471.30.90.90',
      officialDescription: 'Laptop MacBook Pro 14 M3 16GB',
      confidencePct: 96,
      approvedByBroker: true,
    });
  });

  it('returns null below threshold and persists passage embedding cleanly', async () => {
    const vec = new Array(768).fill(0.02);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ data: [{ embedding: vec }] }), { status: 200 })),
    );
    mocks.queryRaw.mockResolvedValue([
      {
        hsCode: '8471.30.90.90',
        description: 'Monitor',
        confidence: 0.95,
        similarity: SEMANTIC_TIER0_THRESHOLD - 0.05,
      },
    ]);

    await expect(searchProductMasterSemantic('tenant-1', 'Cable HDMI')).resolves.toBeNull();

    mocks.executeRaw.mockResolvedValue(1);
    await saveProductMasterEmbedding('pm-1', 'Monitor LED 27');
    expect(mocks.executeRaw).toHaveBeenCalledTimes(1);
  });
});
