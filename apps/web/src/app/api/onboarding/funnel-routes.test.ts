import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockIsCloudModeEnabled = vi.fn();
const mockGetAuthenticatedUser = vi.fn();
const mockProfileUpsert = vi.fn();
const mockMembershipFindFirst = vi.fn();
const mockTenantUpdate = vi.fn();
const mockPaymentFindMany = vi.fn();
const mockPaymentCreate = vi.fn();
const mockPaymentUpdate = vi.fn();

vi.mock('@/lib/runtime-config', () => ({
  isCloudModeEnabled: () => mockIsCloudModeEnabled(),
}));

vi.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    userProfile: { upsert: (...args: unknown[]) => mockProfileUpsert(...args) },
    membership: {
      findFirst: (...args: unknown[]) => mockMembershipFindFirst(...args),
      create: vi.fn(),
    },
    tenant: {
      update: (...args: unknown[]) => mockTenantUpdate(...args),
      create: vi.fn(),
    },
    payment: {
      findMany: (...args: unknown[]) => mockPaymentFindMany(...args),
      create: (...args: unknown[]) => mockPaymentCreate(...args),
      update: (...args: unknown[]) => mockPaymentUpdate(...args),
    },
  },
}));

import { POST as postOnboarding } from '../onboarding/route';
import {
  GET as getPayments,
  POST as postPayment,
  PATCH as patchPayment,
} from '../billing/payments/route';

describe('Funnel cloud API routes (/api/onboarding & /api/billing/payments)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsCloudModeEnabled.mockReturnValue(false);
  });

  it('POST /api/onboarding validates input and returns offline mock success', async () => {
    const badReq = new Request('http://localhost/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'A' }),
    });
    expect((await postOnboarding(badReq)).status).toBe(400);

    const okReq = new Request('http://localhost/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'María González',
        companyName: 'Aduanas Bolívar C.A.',
        brokerLicense: 'SENIAT-4421',
        countryCode: 'VE',
      }),
    });
    const res = await postOnboarding(okReq);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { ok: boolean; mode: string; tenant: { isOnboarded: boolean } };
    expect(data.ok).toBe(true);
    expect(data.mode).toBe('offline');
    expect(data.tenant.isOnboarded).toBe(true);
  });

  it('GET/POST/PATCH /api/billing/payments supports offline lifecycle cleanly', async () => {
    const createReq = new Request('http://localhost/api/billing/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: 'pro',
        billingCycle: 'monthly',
        amount: 299,
        currency: 'USD',
        method: 'zelle',
        referenceCode: 'ZLL-994821',
      }),
    });
    const createRes = await postPayment(createReq);
    expect(createRes.status).toBe(201);
    const created = (await createRes.json()) as { payment: { paymentId: string; status: string } };
    expect(created.payment.status).toBe('pending_verification');

    const listRes = await getPayments(new Request('http://localhost/api/billing/payments'));
    expect(listRes.status).toBe(200);
    const listed = (await listRes.json()) as { payments: Array<{ paymentId: string }> };
    expect(listed.payments.some((p) => p.paymentId === created.payment.paymentId)).toBe(true);

    const verifyReq = new Request('http://localhost/api/billing/payments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: created.payment.paymentId,
        action: 'verify',
      }),
    });
    const verifyRes = await patchPayment(verifyReq);
    expect(verifyRes.status).toBe(200);
    const verified = (await verifyRes.json()) as { payment: { status: string } };
    expect(verified.payment.status).toBe('verified');
  });
});
