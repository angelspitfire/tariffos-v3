import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn<() => Promise<unknown>>(),
  paymentFindMany: vi.fn<() => Promise<unknown[]>>(),
  paymentUpdate: vi.fn<() => Promise<unknown>>(),
  paymentCreate: vi.fn<() => Promise<unknown>>(),
  planFindUnique: vi.fn<() => Promise<unknown>>(),
  tenantUpdate: vi.fn<() => Promise<unknown>>(),
  billingPeriodUpsert: vi.fn<() => Promise<unknown>>(),
  recordAdminAudit: vi.fn<() => Promise<void>>(),
}));

vi.mock('@/lib/admin/http-helpers', async (importOriginal) => {
  const orig = await importOriginal<typeof import('@/lib/admin/http-helpers')>();
  return { ...orig, requireAdmin: mocks.requireAdmin };
});

vi.mock('@tariffos/database', () => ({
  prisma: {
    payment: { findMany: mocks.paymentFindMany },
    plan: { findUnique: mocks.planFindUnique },
    $transaction: async <T>(fn: (tx: unknown) => Promise<T>) =>
      fn({
        payment: { update: mocks.paymentUpdate, create: mocks.paymentCreate },
        plan: { findUnique: mocks.planFindUnique },
        tenant: { update: mocks.tenantUpdate },
        billingPeriod: { upsert: mocks.billingPeriodUpsert },
      }),
  },
  recordAdminAudit: mocks.recordAdminAudit,
}));

import { getOfflineAdminState, resetOfflineAdminState } from '@/lib/admin/offline-store';
import { GET, PATCH, POST } from './route';

describe('/api/admin/billing/payments', () => {
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

  it('approves pending payment in offline mode and activates tenant', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'ops_billing' },
    });

    const listRes = await GET(new Request('http://localhost/api/admin/billing/payments'));
    expect(listRes.status).toBe(200);

    const patchRes = await PATCH(
      new Request('http://localhost/api/admin/billing/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: 'pay-demo-1', action: 'verify' }),
      }),
    );
    expect(patchRes.status).toBe(200);
    const tenant = getOfflineAdminState().tenants.find((t) => t.id === 'ten-demo-2');
    expect(tenant?.billingStatus).toBe('ACTIVE');
    expect(tenant?.planId).toBe('pro');
    expect(tenant?.billingLimit).toBe(400);
  });

  it('records off-app manual payment and auto-activates tenant', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'ops_billing' },
    });

    const postRes = await POST(
      new Request('http://localhost/api/admin/billing/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'ten-demo-2',
          planId: 'enterprise',
          billingCycle: 'monthly',
          amount: 449,
          currency: 'USD',
          method: 'zelle',
          referenceCode: 'WA-44901',
          autoApprove: true,
        }),
      }),
    );
    expect(postRes.status).toBe(201);
    const tenant = getOfflineAdminState().tenants.find((t) => t.id === 'ten-demo-2');
    expect(tenant?.planId).toBe('enterprise');
    expect(tenant?.billingLimit).toBe(1500);
  });

  it('verifies payment transactionally in cloud mode with BillingPeriod and AuditLog', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'super_admin' },
    });
    mocks.paymentUpdate.mockResolvedValue({
      id: 'pay-9',
      tenantId: 'ten-9',
      planId: 'pro',
      amount: 299,
      currency: 'USD',
      billingCycle: 'monthly',
      method: 'zelle',
      referenceCode: 'Z-9',
      status: 'CONFIRMED',
      createdAt: new Date('2026-11-26T00:00:00Z'),
      verifiedBy: 'adm-1',
      verifiedAt: new Date('2026-11-26T02:00:00Z'),
    });
    mocks.planFindUnique.mockResolvedValue({
      id: 'pro',
      name: 'pro',
      classificationLimit: 400,
      allowOverage: false,
      basePrice: 299,
    });

    const res = await PATCH(
      new Request('http://localhost/api/admin/billing/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: 'pay-9', action: 'verify' }),
      }),
    );
    expect(res.status).toBe(200);
    expect(mocks.tenantUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ten-9' },
        data: expect.objectContaining({ billingStatus: 'ACTIVE', planId: 'pro', billingLimit: 400 }),
      }),
    );
    expect(mocks.billingPeriodUpsert).toHaveBeenCalledTimes(1);
    expect(mocks.recordAdminAudit).toHaveBeenCalledTimes(1);
  });
});
