import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
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
  },
}));

import { searchTariffCandidatesVector } from './tariff-vector';

describe('searchTariffCandidatesVector', () => {
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

  it('uses vector(768) cast for 768-dim embeddings so HNSW partial index applies and maps BK/BIT/customsFee', async () => {
    const embedding = new Array(768).fill(0.01);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ data: [{ embedding }] }), { status: 200 }),
      ),
    );
    mocks.queryRaw.mockResolvedValue([
      {
        hsCode: '8471309090',
        document: 'Máquinas automáticas para tratamiento o procesamiento de datos › Portátiles › Las demás',
        description: 'Las demás',
        adValorem: 16,
        iva: 16,
        legalNotes: 'Régimen Legal Importación: 20',
        customsFee: 1,
        isBK: false,
        isBIT: true,
        similarity: 0.9134,
      },
    ]);

    const hits = await searchTariffCandidatesVector('VE', 'laptop macbook', 12);

    expect(mocks.queryRaw).toHaveBeenCalledTimes(1);
    const rawArg = mocks.queryRaw.mock.calls[0]?.[0] as { sql: string };
    expect(rawArg.sql).toContain('::vector(768)');
    expect(hits).toEqual([
      {
        hsCode: '8471.30.90.90',
        description:
          'Máquinas automáticas para tratamiento o procesamiento de datos › Portátiles › Las demás',
        adValoremRate: 16,
        ivaRate: 16,
        unit: 'u',
        legalRegime: 'Régimen Legal Importación: 20',
        prohibited: false,
        permits: [],
        score: 0.9134,
        customsFeeRate: 1,
        isBK: false,
        isBIT: true,
      },
    ]);
  });
});
