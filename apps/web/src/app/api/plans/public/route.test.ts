import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  planFindMany: vi.fn<() => Promise<unknown[]>>(),
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    plan: { findMany: mocks.planFindMany },
  },
}));

import { getOfflineAdminState, resetOfflineAdminState } from '@/lib/admin/offline-store';
import { GET } from './route';

describe('GET /api/plans/public', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    vi.clearAllMocks();
    resetOfflineAdminState();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it('excludes private and archived plans in offline mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const state = getOfflineAdminState();
    state.plans.push({
      id: 'private-vip',
      name: 'private-vip',
      displayName: 'VIP Privado',
      description: 'Solo por invitación',
      basePrice: 999,
      annualPriceUsd: 9990,
      annualOnly: false,
      classificationLimit: 9000,
      maxTokens: 1000000,
      maxUsers: 20,
      overagePrice: 0,
      allowOverage: false,
      isPublic: false,
      isArchived: false,
      features: [],
      tenantCount: 0,
    });
    const enterprise = state.plans.find((p) => p.id === 'enterprise');
    if (enterprise) enterprise.isArchived = true;

    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { plans: Array<{ planId: string }> };
    const ids = body.plans.map((p) => p.planId);
    expect(ids).toContain('pilot');
    expect(ids).toContain('agencia');
    expect(ids).not.toContain('private-vip');
    expect(ids).not.toContain('enterprise');
    expect(ids).not.toContain('pro');
    expect(ids).not.toContain('trial');
  });

  it('maps public plans from Postgres in cloud mode and falls back when empty', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.planFindMany.mockResolvedValueOnce([
      {
        id: 'plan-custom-1',
        name: 'custom-export',
        description: 'Plan exportador',
        basePrice: 149,
        classificationLimit: 200,
        features: {
          displayName: 'Exportador Plus',
          monthlyPriceUsd: 149,
          annualPriceUsd: 1490,
          annualOnly: false,
          maxUsers: 4,
          isPublic: true,
          isArchived: false,
          items: ['200 clasificaciones/mes'],
        },
      },
      {
        id: 'plan-secret',
        name: 'secret-vip',
        description: 'Privado',
        basePrice: 1999,
        classificationLimit: 10000,
        features: { displayName: 'Secret', isPublic: false, isArchived: false, items: [] },
      },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { plans: Array<{ planId: string; name: string }> };
    expect(body.plans).toHaveLength(1);
    expect(body.plans[0]?.planId).toBe('custom-export');
    expect(body.plans[0]?.name).toBe('Exportador Plus');

    mocks.planFindMany.mockResolvedValueOnce([]);
    const fallbackRes = await GET();
    const fallbackBody = (await fallbackRes.json()) as { plans: Array<{ planId: string }> };
    expect(fallbackBody.plans.map((p) => p.planId)).toEqual(['pilot', 'agencia', 'enterprise']);
  });
});
