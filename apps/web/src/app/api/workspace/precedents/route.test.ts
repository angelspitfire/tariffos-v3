import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn(),
  findMany: vi.fn(),
  upsert: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    productMaster: {
      findMany: mocks.findMany,
      upsert: mocks.upsert,
      deleteMany: mocks.deleteMany,
    },
  },
}));

import { DELETE, GET, PUT } from './route';

describe('/api/workspace/precedents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { userId: 'u-1', userEmail: 'broker@tariffos.ve', tenantId: 't-1', role: 'OWNER' },
    });
  });

  it('loads tenant precedents from ProductMaster and saves new precedents into ProductMaster', async () => {
    const now = new Date('2026-11-26T10:00:00Z');
    mocks.findMany.mockResolvedValue([
      {
        id: 'pm-1',
        description: 'MacBook Pro 14 M3',
        hsCode: '8471.30.90.90',
        reasoning: 'Nota 5(B)',
        metadata: { sku: 'MBP-14', normalizedSku: 'MBP-14', title: 'MacBook', adValoremPercent: 16, vatPercent: 16 },
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const getRes = await GET();
    expect(getRes.status).toBe(200);
    const getJson = (await getRes.json()) as { precedents: Array<{ sku: string; hsCode: string }> };
    expect(getJson.precedents[0]).toMatchObject({ sku: 'MBP-14', hsCode: '8471.30.90.90' });

    mocks.upsert.mockResolvedValue({ id: 'pm-1' });
    const putRes = await PUT(
      new Request('http://localhost/api/workspace/precedents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'pm-1',
          sku: 'MBP-14',
          normalizedSku: 'MBP-14',
          title: 'MacBook Pro 14',
          description: 'MacBook Pro 14 M3',
          hsCode: '8471.30.90.90',
          jurisdictionId: 've-seniat',
          adValoremPercent: 16,
          vatPercent: 16,
          legalRegime: '16% BIT',
          reviewStatus: 'approved',
          usageCount: 1,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        }),
      }),
    );
    expect(putRes.status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledTimes(1);

    const delRes = await DELETE(new Request('http://localhost/api/workspace/precedents?id=pm-1', { method: 'DELETE' }));
    expect(delRes.status).toBe(200);
    expect(mocks.deleteMany).toHaveBeenCalledWith({ where: { id: 'pm-1', tenantId: 't-1' } });
  });
});
