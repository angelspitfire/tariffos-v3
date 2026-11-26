import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  nationalTariffFindFirst: vi.fn(),
  hsPermitRequirementFindMany: vi.fn(),
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    productMaster: { findFirst: vi.fn() },
    nationalTariff: { findMany: vi.fn(), findFirst: mocks.nationalTariffFindFirst },
    legalKnowledgeChunk: { findMany: vi.fn() },
    hsPermitRequirement: { findMany: mocks.hsPermitRequirementFindMany },
  },
}));

import { createPrismaPipelinePorts } from './prisma-ports';

describe('createPrismaPipelinePorts.verifyHsCode', () => {
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
});
