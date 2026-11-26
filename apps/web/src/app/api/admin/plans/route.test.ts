import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn<() => Promise<unknown>>(),
  planCreate: vi.fn<() => Promise<unknown>>(),
  planFindUnique: vi.fn<() => Promise<unknown>>(),
  planUpdate: vi.fn<() => Promise<unknown>>(),
  recordAdminAudit: vi.fn<() => Promise<void>>(),
}));

vi.mock('@/lib/admin/http-helpers', async (importOriginal) => {
  const orig = await importOriginal<typeof import('@/lib/admin/http-helpers')>();
  return { ...orig, requireAdmin: mocks.requireAdmin };
});

vi.mock('@tariffos/database', () => ({
  prisma: {
    plan: {
      findMany: vi.fn<() => Promise<unknown[]>>(),
      findUnique: mocks.planFindUnique,
      create: mocks.planCreate,
      update: mocks.planUpdate,
    },
    $transaction: async <T>(fn: (tx: unknown) => Promise<T>) =>
      fn({
        plan: { create: mocks.planCreate, update: mocks.planUpdate },
      }),
  },
  recordAdminAudit: mocks.recordAdminAudit,
}));

import { resetOfflineAdminState } from '@/lib/admin/offline-store';
import { GET, POST } from './route';

describe('/api/admin/plans', () => {
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

  it('lists and creates custom private plans in offline mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'super_admin' },
    });

    const createRes = await POST(
      new Request('http://localhost/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'broker-vip',
          displayName: 'Broker VIP',
          basePrice: 750,
          classificationLimit: 2500,
          maxUsers: 15,
          allowOverage: true,
          overagePrice: 0.25,
          isPublic: false,
          features: ['Soporte 24/7', 'Multi-aduana'],
        }),
      }),
    );
    expect(createRes.status).toBe(201);
    const created = (await createRes.json()) as { plan: { name: string; isPublic: boolean } };
    expect(created.plan.name).toBe('broker-vip');
    expect(created.plan.isPublic).toBe(false);

    const dupRes = await POST(
      new Request('http://localhost/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'broker-vip',
          displayName: 'Broker VIP 2',
          basePrice: 800,
          classificationLimit: 3000,
        }),
      }),
    );
    expect(dupRes.status).toBe(409);

    const listRes = await GET();
    const listBody = (await listRes.json()) as { plans: Array<{ name: string }> };
    expect(listBody.plans.some((p) => p.name === 'broker-vip')).toBe(true);
  });

  it('rejects non-super_admin on POST /api/admin/plans', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.requireAdmin.mockResolvedValue({
      ok: false,
      response: Response.json({ error: 'Insufficient permissions' }, { status: 403 }),
    });

    const res = await POST(
      new Request('http://localhost/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'custom-x',
          displayName: 'Custom X',
          basePrice: 100,
          classificationLimit: 100,
        }),
      }),
    );
    expect(res.status).toBe(403);
  });
});
