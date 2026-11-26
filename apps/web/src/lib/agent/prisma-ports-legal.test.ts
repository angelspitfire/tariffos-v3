import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  legalKnowledgeChunkFindMany: vi.fn(),
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    nationalTariff: { findMany: vi.fn(), findFirst: vi.fn() },
    legalKnowledgeChunk: { findMany: mocks.legalKnowledgeChunkFindMany },
    hsPermitRequirement: { findMany: vi.fn() },
  },
}));

vi.mock('./tariff-fts', () => ({
  searchTariffCandidatesFts: vi.fn(),
}));

vi.mock('./tariff-vector', () => ({
  searchTariffCandidatesVector: vi.fn(),
}));

vi.mock('./tier0-lookup', () => ({
  findTenantSkuPrecedent: vi.fn(),
}));

import { createPrismaPipelinePorts } from './prisma-ports';

describe('prisma-ports getLegalNotes hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters strictly by PUBLISHED, non-derogated, temporal validity, matches HS scope variants, and orders deterministically', async () => {
    mocks.legalKnowledgeChunkFindMany.mockResolvedValue([
      {
        heading: 'Ley Orgánica de Aduanas',
        ruleNumber: '25',
        content: 'La partida 8504.40 requiere declaración anticipada.',
        parent: { hierarchyPath: 'loa' },
      },
      {
        heading: 'SECCIÓN XVI',
        ruleNumber: '4',
        content: 'Unidad funcional.',
        parent: { hierarchyPath: 'SEC-XVI' },
      },
    ]);

    const ports = createPrismaPipelinePorts();
    const notes = await ports.getLegalNotes('VE', '8504.40.90.00');

    expect(mocks.legalKnowledgeChunkFindMany).toHaveBeenCalledTimes(1);
    const callArg = mocks.legalKnowledgeChunkFindMany.mock.calls[0]?.[0] as {
      where: {
        parent: Record<string, unknown>;
        OR: Array<Record<string, unknown>>;
      };
      orderBy: Array<Record<string, string>>;
      take: number;
    };

    expect(callArg.where.parent).toMatchObject({
      countryCode: 'VE',
      status: 'PUBLISHED',
      isDerogated: false,
    });
    expect(callArg.where.parent.validFromDate).toHaveProperty('lte');
    expect(callArg.where.parent.OR).toEqual([
      { validToDate: null },
      { validToDate: { gte: expect.any(Date) } },
    ]);
    expect(callArg.where.OR).toEqual([
      { parent: { hierarchyPath: { in: ['85', 'SEC-XVI'] } } },
      {
        scope: {
          hasSome: expect.arrayContaining(['85.04', '8504', '8504.40', '8504.40.90', '8504.40.90.00']),
        },
      },
    ]);
    expect(callArg.orderBy).toEqual([{ chunkIndex: 'asc' }, { id: 'asc' }]);
    expect(notes).toEqual([
      {
        ref: 'Ley Orgánica de Aduanas (Nota 25)',
        text: 'La partida 8504.40 requiere declaración anticipada.',
        chapter: '85',
      },
      {
        ref: 'SECCIÓN XVI (Nota 4)',
        text: 'Unidad funcional.',
      },
    ]);
  });
});
