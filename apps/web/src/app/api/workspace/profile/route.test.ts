import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn(),
  findUnique: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    userProfile: {
      findUnique: mocks.findUnique,
      upsert: mocks.upsert,
    },
  },
}));

import { GET, PUT } from './route';

describe('/api/workspace/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { userId: 'u-1', userEmail: 'erika@tariffos.ve', tenantId: 't-1', role: 'OWNER' },
    });
  });

  it('loads and upserts UserProfile settings by authenticated userId', async () => {
    const now = new Date('2026-11-26T10:00:00Z');
    mocks.findUnique.mockResolvedValue({
      fullName: 'Erika Peña',
      companyName: 'Aduanas Venezuela',
      brokerLicense: 'SENIAT-881',
      approvalWorkflowMode: 'always_review',
      defaultIncoterm: 'CIF',
      preferredCurrency: 'USD',
      detailLevel: 'exhaustive',
      role: 'Agente Titular',
      updatedAt: now,
    });

    const getRes = await GET();
    expect(getRes.status).toBe(200);
    const json = (await getRes.json()) as { profile: { fullName: string; detailLevel: string } };
    expect(json.profile.fullName).toBe('Erika Peña');
    expect(json.profile.detailLevel).toBe('exhaustive');

    const putRes = await PUT(
      new Request('http://localhost/api/workspace/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json.profile),
      }),
    );
    expect(putRes.status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledTimes(1);
  });
});
