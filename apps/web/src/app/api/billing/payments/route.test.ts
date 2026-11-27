import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  resolveCloudTenantContext: vi.fn(),
  membershipFindFirst: vi.fn(),
  paymentFindMany: vi.fn(),
  paymentCreate: vi.fn(),
  paymentUpdate: vi.fn(),
  tenantUpdate: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
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

  it('returns complete ManualPaymentRecord after cloud POST so client confirmation and list never crash', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: {
        userId: 'usr-1',
        userEmail: 'pagos@caribe.ve',
        tenantId: 'ten-1',
        role: 'OWNER',
      },
    });
    const createdAt = new Date('2026-11-26T20:45:00.000Z');
    mocks.paymentCreate.mockResolvedValue({
      id: 'pay-cloud-1',
      tenantId: 'ten-1',
      status: 'PENDING',
      amount: 150,
      currency: 'USD',
      planId: 'pilot',
      billingCycle: 'monthly',
      method: 'zelle',
      referenceCode: 'ZEL-778899',
      receiptStorageKey: 'ten-1/1732653900-comprobante.png',
      notes: 'Pago piloto',
      createdAt,
      tenant: { name: 'Aduanas del Caribe C.A.', ownerEmail: 'pagos@caribe.ve' },
    });

    const res = await POST(
      new Request('http://localhost/api/billing/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: 'pilot',
          billingCycle: 'monthly',
          amount: 150,
          currency: 'USD',
          method: 'zelle',
          referenceCode: 'ZEL-778899',
          receiptStorageKey: 'ten-1/1732653900-comprobante.png',
          notes: 'Pago piloto',
        }),
      }),
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      mode: string;
      payment: {
        paymentId: string;
        planId: string;
        planName: string;
        amount: number;
        currency: string;
        referenceCode: string;
        paidAt: string;
        status: string;
        receiptStorageKey?: string;
      };
    };
    expect(body.mode).toBe('cloud');
    expect(body.payment).toMatchObject({
      paymentId: 'pay-cloud-1',
      planId: 'pilot',
      planName: 'Piloto Operativo',
      amount: 150,
      currency: 'USD',
      referenceCode: 'ZEL-778899',
      paidAt: createdAt.toISOString(),
      status: 'pending_verification',
      receiptStorageKey: 'ten-1/1732653900-comprobante.png',
    });
  });
});
