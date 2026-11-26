import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TariffCandidateRecord } from '@tariffos/agent';

const mocks = vi.hoisted(() => ({
  nationalTariffFindFirst: vi.fn(),
  hsPermitRequirementFindMany: vi.fn(),
  legalKnowledgeChunkFindMany: vi.fn(),
  ftsSearch: vi.fn<() => Promise<TariffCandidateRecord[]>>(),
  vectorSearch: vi.fn<() => Promise<TariffCandidateRecord[]>>(),
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    productMaster: { findFirst: vi.fn() },
    nationalTariff: { findMany: vi.fn(), findFirst: mocks.nationalTariffFindFirst },
    legalKnowledgeChunk: { findMany: mocks.legalKnowledgeChunkFindMany },
    hsPermitRequirement: { findMany: mocks.hsPermitRequirementFindMany },
  },
}));

vi.mock('./tariff-fts', () => ({
  searchTariffCandidatesFts: mocks.ftsSearch,
}));

vi.mock('./tariff-vector', () => ({
  searchTariffCandidatesVector: mocks.vectorSearch,
}));

import { createPrismaPipelinePorts } from './prisma-ports';

describe('createPrismaPipelinePorts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches both dotted and 10-digit compact HS codes and enforces non-derogated active rows', async () => {
    mocks.nationalTariffFindFirst.mockResolvedValue({
      hsCode: '8471309090',
      description: 'Las demás sin sintonizador de TV',
      adValorem: 16,
      iva: 16,
      legalNotes: null,
    });
    mocks.hsPermitRequirementFindMany.mockResolvedValue([]);

    const ports = createPrismaPipelinePorts();
    const verified = await ports.verifyHsCode('VE', '8471.30.90.90');

    expect(verified?.hsCode).toBe('8471309090');
    expect(mocks.nationalTariffFindFirst).toHaveBeenCalledWith({
      where: {
        countryCode: 'VE',
        hsCode: { in: ['8471.30.90.90', '8471309090'] },
        isActive: true,
        isDerogated: false,
      },
    });
  });

  it('queries LegalKnowledgeChunk by parent.hierarchyPath chapter prefix (01..98)', async () => {
    mocks.legalKnowledgeChunkFindMany.mockResolvedValue([
      {
        heading: 'CAPÍTULO 85 — MÁQUINAS Y APARATOS ELÉCTRICOS',
        ruleNumber: '1',
        content: 'Este Capítulo no comprende las mantas calentadas eléctricamente.',
      },
    ]);

    const ports = createPrismaPipelinePorts();
    const notes = await ports.getLegalNotes('VE', '8504.40.90.00');

    expect(mocks.legalKnowledgeChunkFindMany).toHaveBeenCalledWith({
      where: {
        parent: {
          countryCode: 'VE',
          hierarchyPath: { startsWith: '85' },
        },
      },
      take: 8,
    });
    expect(notes).toEqual([
      {
        ref: 'CAPÍTULO 85 — MÁQUINAS Y APARATOS ELÉCTRICOS (Nota 1)',
        text: 'Este Capítulo no comprende las mantas calentadas eléctricamente.',
        chapter: '85',
      },
    ]);
  });

  it('fuses vector and FTS candidates with RRF when TariffNodeEmbedding returns hits', async () => {
    mocks.vectorSearch.mockResolvedValue([
      { hsCode: '8504.40.90.00', description: 'Inversores', adValoremRate: 14, ivaRate: 16, unit: 'u', prohibited: false, score: 0.91 },
    ]);
    mocks.ftsSearch.mockResolvedValue([
      { hsCode: '8504.40.90.00', description: 'Convertidores estáticos › Los demás', adValoremRate: 14, ivaRate: 16, unit: 'u', prohibited: false, score: 0.72 },
      { hsCode: '8504.40.10.00', description: 'Cargadores de acumuladores', adValoremRate: 14, ivaRate: 16, unit: 'u', prohibited: false, score: 0.65 },
    ]);

    const ports = createPrismaPipelinePorts();
    const results = await ports.searchTariffCandidates('VE', 'inversor solar híbrido 5kw');

    expect(results[0]?.hsCode).toBe('8504.40.90.00');
    expect(results[0]?.score).toBe(1);
    expect(results).toHaveLength(2);
  });
});
