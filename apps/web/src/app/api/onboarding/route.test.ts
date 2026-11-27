import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  platformAdminFindUnique: vi.fn(),
  userProfileUpsert: vi.fn(),
  membershipFindFirst: vi.fn(),
  planFindUnique: vi.fn(),
  planUpsert: vi.fn(),
  tenantUpdate: vi.fn(),
  tenantCreate: vi.fn(),
  membershipCreate: vi.fn(),
  countryFindUnique: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock('@tariffos/database', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tariffos/database')>();
  return {
    ...actual,
    prisma: {
      platformAdmin: { findUnique: mocks.platformAdminFindUnique },
      userProfile: { upsert: mocks.userProfileUpsert },
      membership: { findFirst: mocks.membershipFindFirst, create: mocks.membershipCreate },
      plan: { findUnique: mocks.planFindUnique, upsert: mocks.planUpsert },
      tenant: { update: mocks.tenantUpdate, create: mocks.tenantCreate },
      country: { findUnique: mocks.countryFindUnique },
    },
  };
});

import { POST } from './route';

describe('POST /api/onboarding', () => {
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

  it('returns 400 on invalid onboarding payload', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const req = new Request('http://localhost/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'A' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns mock success in offline mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const req = new Request('http://localhost/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'María González',
        companyName: 'Aduanas del Caribe C.A.',
        brokerLicense: 'SENIAT-4821',
        taxId: 'J-40123456-7',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; mode: string; tenant: { name: string } };
    expect(body.ok).toBe(true);
    expect(body.mode).toBe('offline');
    expect(body.tenant.name).toBe('Aduanas del Caribe C.A.');
  });

  it('persists UserProfile and Tenant updates in cloud mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'usr-9', email: 'maria@caribe.ve' });
    mocks.userProfileUpsert.mockResolvedValue({ id: 'usr-9', fullName: 'María González' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'ten-9', role: 'OWNER' });
    mocks.tenantUpdate.mockResolvedValue({ id: 'ten-9', name: 'Aduanas del Caribe C.A.', isOnboarded: true });

    const req = new Request('http://localhost/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'María González',
        companyName: 'Aduanas del Caribe C.A.',
        brokerLicense: 'SENIAT-4821',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mocks.userProfileUpsert).toHaveBeenCalledTimes(1);
    expect(mocks.tenantUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ten-9' },
        data: expect.objectContaining({ name: 'Aduanas del Caribe C.A.', isOnboarded: true }),
      }),
    );
  });

  it('creates new cloud tenant locked as PAST_DUE with billingLimit 0 and selected plan', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'usr-new', email: 'nuevo@agencia.ve' });
    mocks.userProfileUpsert.mockResolvedValue({ id: 'usr-new', fullName: 'Carlos Pérez' });
    mocks.membershipFindFirst.mockResolvedValue(null);
    mocks.planFindUnique.mockResolvedValue({ id: 'plan-pilot-id', name: 'pilot' });
    mocks.tenantCreate.mockResolvedValue({
      id: 'ten-new',
      name: 'Agencia Puerto C.A.',
      billingStatus: 'PAST_DUE',
      billingLimit: 0,
    });

    const req = new Request('http://localhost/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Carlos Pérez',
        companyName: 'Agencia Puerto C.A.',
        selectedPlanId: 'pilot',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { skipPaymentActivation: boolean };
    expect(body.skipPaymentActivation).toBe(false);
    expect(mocks.tenantCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          planId: 'plan-pilot-id',
          billingStatus: 'PAST_DUE',
          billingLimit: 0,
          allowOverage: false,
        }),
      }),
    );
  });

  it('creates and assigns exclusive unlimited tariffos_internal plan when super_admin onboards, and blocks non-admins from claiming it', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.getAuthenticatedUser.mockResolvedValue({
      id: 'usr-admin',
      email: 'angel.alberto.fernandez@gmail.com',
    });
    mocks.platformAdminFindUnique.mockResolvedValue({
      role: 'super_admin',
      isActive: true,
    });
    mocks.userProfileUpsert.mockResolvedValue({
      id: 'usr-admin',
      fullName: 'Angel Fernandez',
      role: 'super_admin',
    });
    mocks.membershipFindFirst.mockResolvedValue(null);
    mocks.planUpsert.mockResolvedValue({
      id: 'plan-tariffos-internal',
      name: 'tariffos_internal',
      classificationLimit: 1_000_000_000,
      allowOverage: true,
    });
    mocks.tenantCreate.mockResolvedValue({
      id: 'ten-admin',
      name: 'TariffOS',
      billingStatus: 'ACTIVE',
      billingLimit: 1_000_000_000,
      isOnboarded: true,
    });

    const req = new Request('http://localhost/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Angel Fernandez',
        companyName: 'TariffOS',
        selectedPlanId: 'pilot',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { skipPaymentActivation: boolean };
    expect(body.skipPaymentActivation).toBe(true);
    expect(mocks.planUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { name: 'tariffos_internal' } }),
    );
    expect(mocks.tenantCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          planId: 'plan-tariffos-internal',
          billingStatus: 'ACTIVE',
          billingLimit: 1_000_000_000,
          allowOverage: true,
        }),
      }),
    );

    // Non-admin trying to request tariffos_internal must NOT get it
    vi.clearAllMocks();
    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'usr-ext', email: 'cliente@externo.ve' });
    mocks.platformAdminFindUnique.mockResolvedValue(null);
    mocks.userProfileUpsert.mockResolvedValue({ id: 'usr-ext', role: 'user' });
    mocks.membershipFindFirst.mockResolvedValue(null);
    mocks.planFindUnique.mockResolvedValue({ id: 'plan-pilot-id', name: 'pilot' });
    mocks.tenantCreate.mockResolvedValue({
      id: 'ten-ext',
      billingStatus: 'PAST_DUE',
      billingLimit: 0,
    });

    const spoofReq = new Request('http://localhost/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Cliente Externo',
        companyName: 'Importadora Sur',
        selectedPlanId: 'tariffos_internal',
      }),
    });
    const spoofRes = await POST(spoofReq);
    expect(spoofRes.status).toBe(200);
    expect(mocks.planFindUnique).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { name: 'tariffos_internal' } }),
    );
    expect(mocks.planUpsert).not.toHaveBeenCalled();
  });

  it('falls back to VE countryCode in cloud onboarding when requested country is not seeded', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'usr-eu', email: 'eu@agencia.com' });
    mocks.platformAdminFindUnique.mockResolvedValue(null);
    mocks.userProfileUpsert.mockResolvedValue({ id: 'usr-eu', fullName: 'Ana EU' });
    mocks.membershipFindFirst.mockResolvedValue(null);
    mocks.countryFindUnique.mockResolvedValue(null);
    mocks.planFindUnique.mockResolvedValue({ id: 'plan-pilot-id', name: 'pilot' });
    mocks.tenantCreate.mockResolvedValue({
      id: 'ten-eu',
      name: 'Agencia EU',
      countryCode: 'VE',
      billingStatus: 'PAST_DUE',
      billingLimit: 0,
    });

    const req = new Request('http://localhost/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Ana EU',
        companyName: 'Agencia EU',
        countryCode: 'OM',
        selectedPlanId: 'pilot',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mocks.tenantCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ countryCode: 'VE' }),
      }),
    );
  });
});
