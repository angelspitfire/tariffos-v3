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

  it('supports offline create and list while blocking PATCH on public client route', async () => {
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

    const patchRes = await PATCH();
    expect(patchRes.status).toBe(403);
  });

  it('rejects PATCH in cloud mode even for authenticated tenant owners', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const res = await PATCH();
    expect(res.status).toBe(403);
    expect(mocks.paymentUpdate).not.toHaveBeenCalled();
  });
});
