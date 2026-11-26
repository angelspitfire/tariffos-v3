import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  membershipFindFirst: vi.fn(),
  paymentFindMany: vi.fn(),
  paymentCreate: vi.fn(),
  paymentUpdate: vi.fn(),
  tenantUpdate: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    membership: { findFirst: mocks.membershipFindFirst },
    payment: {
      findMany: mocks.paymentFindMany,
      create: mocks.paymentCreate,
      update: mocks.paymentUpdate,
    },
    tenant: { update: mocks.tenantUpdate },
  },
}));

import { GET, PATCH, POST } from './route';

describe('/api/billing/payments', () => {
  const originalCloudMode = process.env.NEXT_PUBLIC_CLOUD_MODE;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    vi.clearAllMocks();
    if (originalCloudMode === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloudMode;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it('supports offline create, list, and verify/reject lifecycle', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';

    const createRes = await POST(
      new Request('http://localhost/api/billing/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: 'pro',
          billingCycle: 'monthly',
          amount: 299,
          currency: 'USD',
          method: 'zelle',
          referenceCode: 'ZELLE-998877',
        }),
      }),
    );
    expect(createRes.status).toBe(201);
    const created = (await createRes.json()) as { payment: { paymentId: string; status: string } };
    expect(created.payment.status).toBe('pending_verification');

    const listRes = await GET(new Request('http://localhost/api/billing/payments'));
    expect(listRes.status).toBe(200);
    const listed = (await listRes.json()) as { payments: Array<{ paymentId: string }> };
    expect(listed.payments.some((p) => p.paymentId === created.payment.paymentId)).toBe(true);

    const patchRes = await PATCH(
      new Request('http://localhost/api/billing/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: created.payment.paymentId,
          action: 'verify',
        }),
      }),
    );
    expect(patchRes.status).toBe(200);
    const patched = (await patchRes.json()) as { payment: { status: string } };
    expect(patched.payment.status).toBe('verified');
  });

  it('verifies a payment in cloud mode and activates the tenant', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'admin-1', email: 'admin@tariffos.app' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'ten-1', role: 'OWNER' });
    mocks.paymentUpdate.mockResolvedValue({
      id: 'pay-1',
      tenantId: 'ten-1',
      planId: 'pro',
      status: 'CONFIRMED',
      amount: 299,
      currency: 'USD',
      billingCycle: 'monthly',
      method: 'zelle',
      referenceCode: 'ZELLE-1',
      createdAt: new Date('2026-11-25T10:00:00Z'),
      verifiedBy: 'admin-1',
      verifiedAt: new Date('2026-11-25T11:00:00Z'),
    });
    mocks.tenantUpdate.mockResolvedValue({ id: 'ten-1', billingStatus: 'ACTIVE' });

    const res = await PATCH(
      new Request('http://localhost/api/billing/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: 'pay-1', action: 'verify' }),
      }),
    );
    expect(res.status).toBe(200);
    expect(mocks.paymentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'pay-1' },
        data: expect.objectContaining({ status: 'CONFIRMED' }),
      }),
    );
    expect(mocks.tenantUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ten-1' },
        data: expect.objectContaining({ billingStatus: 'ACTIVE' }),
      }),
    );
  });
});
