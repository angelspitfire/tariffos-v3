import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  userProfileUpsert: vi.fn(),
  membershipFindFirst: vi.fn(),
  tenantUpdate: vi.fn(),
  tenantCreate: vi.fn(),
  membershipCreate: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    userProfile: { upsert: mocks.userProfileUpsert },
    membership: { findFirst: mocks.membershipFindFirst, create: mocks.membershipCreate },
    tenant: { update: mocks.tenantUpdate, create: mocks.tenantCreate },
  },
}));

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
});
