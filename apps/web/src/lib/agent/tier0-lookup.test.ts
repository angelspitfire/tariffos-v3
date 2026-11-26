import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  customRuleFindMany: vi.fn(),
  productMasterFindFirst: vi.fn(),
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    customClassificationRule: { findMany: mocks.customRuleFindMany },
    productMaster: { findFirst: mocks.productMasterFindFirst },
  },
}));

import { findTenantSkuPrecedent } from './tier0-lookup';

describe('findTenantSkuPrecedent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for blank input without hitting DB', async () => {
    await expect(findTenantSkuPrecedent('t-1', '   ')).resolves.toBeNull();
    expect(mocks.customRuleFindMany).not.toHaveBeenCalled();
    expect(mocks.productMasterFindFirst).not.toHaveBeenCalled();
  });

  it('prefers tenant custom rule over GLOBAL rule', async () => {
    mocks.customRuleFindMany.mockResolvedValue([
      {
        tenantId: 'GLOBAL',
        inputDescription: 'MacBook Pro 14',
        targetHsCode: '8471.30.90.00',
        confidence: 0.9,
      },
      {
        tenantId: 't-1',
        inputDescription: 'MacBook Pro 14',
        targetHsCode: '8471.30.90.90',
        confidence: 0.99,
      },
    ]);

    const result = await findTenantSkuPrecedent('t-1', 'MacBook Pro 14');

    expect(result).toEqual({
      hsCode: '8471.30.90.90',
      officialDescription: 'MacBook Pro 14',
      confidencePct: 99,
      approvedByBroker: true,
    });
    expect(mocks.productMasterFindFirst).not.toHaveBeenCalled();
  });

  it('falls back to ProductMaster matching either description or metadata.sku', async () => {
    mocks.customRuleFindMany.mockResolvedValue([]);
    mocks.productMasterFindFirst.mockResolvedValue({
      hsCode: '8504.40.90.00',
      description: 'Inversor solar 5kW',
      confidence: 0.96,
    });

    const result = await findTenantSkuPrecedent('t-1', 'INV-5KW-01');

    expect(mocks.productMasterFindFirst).toHaveBeenCalledWith({
      where: {
        tenantId: 't-1',
        OR: [
          { description: { equals: 'INV-5KW-01', mode: 'insensitive' } },
          { metadata: { path: ['sku'], equals: 'INV-5KW-01' } },
        ],
      },
    });
    expect(result).toEqual({
      hsCode: '8504.40.90.00',
      officialDescription: 'Inversor solar 5kW',
      confidencePct: 96,
      approvedByBroker: true,
    });
  });
});
