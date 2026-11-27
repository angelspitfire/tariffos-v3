import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn<() => Promise<unknown>>(),
  inviteUserByEmail: vi.fn<() => Promise<unknown>>(),
  createUser: vi.fn<() => Promise<unknown>>(),
  listUsers: vi.fn<() => Promise<unknown>>(),
  planFindUnique: vi.fn<() => Promise<unknown>>(),
  tenantCreate: vi.fn<() => Promise<unknown>>(),
  userProfileUpsert: vi.fn<() => Promise<unknown>>(),
  waitlistLeadUpdate: vi.fn<() => Promise<unknown>>(),
  recordAdminAudit: vi.fn<() => Promise<void>>(),
}));

vi.mock('@/lib/admin/http-helpers', async (importOriginal) => {
  const orig = await importOriginal<typeof import('@/lib/admin/http-helpers')>();
  return { ...orig, requireAdmin: mocks.requireAdmin };
});

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    auth: {
      admin: {
        inviteUserByEmail: mocks.inviteUserByEmail,
        createUser: mocks.createUser,
        listUsers: mocks.listUsers,
      },
    },
  }),
}));

vi.mock('@tariffos/database', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tariffos/database')>();
  return {
    ...actual,
    prisma: {
      plan: { findUnique: mocks.planFindUnique },
      $transaction: async <T>(fn: (tx: unknown) => Promise<T>) =>
        fn({
          tenant: { create: mocks.tenantCreate },
          userProfile: { upsert: mocks.userProfileUpsert },
          waitlistLead: { update: mocks.waitlistLeadUpdate },
        }),
    },
    recordAdminAudit: mocks.recordAdminAudit,
  };
});

import { getOfflineAdminState, resetOfflineAdminState } from '@/lib/admin/offline-store';
import { POST } from './route';

describe('POST /api/admin/tenants/onboard', () => {
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

  it('creates tenant + owner and converts linked lead in offline mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'super_admin' },
    });

    const res = await POST(
      new Request('http://localhost/api/admin/tenants/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: 'Aduanas del Caribe C.A.',
          taxId: 'J-50012345-9',
          countryCode: 'VE',
          ownerName: 'Carlos Mendoza',
          ownerEmail: 'gerencia@aduanacaribe.ve',
          planId: 'pro',
          billingStatus: 'ACTIVE',
          leadId: 'lead-demo-1',
        }),
      }),
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { tenant: { name: string; billingLimit: number } };
    expect(body.tenant.name).toBe('Aduanas del Caribe C.A.');
    expect(body.tenant.billingLimit).toBe(400);

    const lead = getOfflineAdminState().leads.find((l) => l.id === 'lead-demo-1');
    expect(lead?.status).toBe('CONVERTED');
  });

  it('invites user via Supabase Admin and persists tenant + audit in cloud mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'ops_billing' },
    });
    mocks.planFindUnique.mockResolvedValue({
      id: 'plan-pro',
      name: 'pro',
      classificationLimit: 400,
      allowOverage: false,
    });
    mocks.inviteUserByEmail.mockResolvedValue({
      data: { user: { id: 'usr-new-1', email: 'new@agency.ve' } },
      error: null,
    });
    mocks.tenantCreate.mockResolvedValue({
      id: 'ten-new-1',
      name: 'Agencia Nueva',
      billingLimit: 400,
      billingStatus: 'ACTIVE',
    });

    const res = await POST(
      new Request('http://localhost/api/admin/tenants/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: 'Agencia Nueva',
          countryCode: 'VE',
          ownerName: 'Pedro',
          ownerEmail: 'new@agency.ve',
          planId: 'plan-pro',
          billingStatus: 'ACTIVE',
          sendInviteEmail: true,
        }),
      }),
    );
    expect(res.status).toBe(201);
    expect(mocks.inviteUserByEmail).toHaveBeenCalledWith(
      'new@agency.ve',
      expect.objectContaining({
        data: expect.objectContaining({ full_name: 'Pedro' }),
        redirectTo: 'https://tariffos.app/auth/callback?next=%2Fapp',
      }),
    );
    expect(mocks.recordAdminAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'tenant.onboarded', targetId: 'ten-new-1' }),
    );
  });

  it('paginates Supabase listUsers to find an existing user beyond page 1', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'ops_billing' },
    });
    mocks.planFindUnique.mockResolvedValue({
      id: 'plan-pilot',
      name: 'pilot',
      classificationLimit: 250,
      allowOverage: false,
    });
    mocks.inviteUserByEmail.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    });
    mocks.createUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    });

    const page1Users = Array.from({ length: 200 }, (_, i) => ({
      id: `usr-${i}`,
      email: `user-${i}@other.ve`,
    }));
    mocks.listUsers
      .mockResolvedValueOnce({ data: { users: page1Users }, error: null })
      .mockResolvedValueOnce({
        data: { users: [{ id: 'usr-page2', email: 'existing@agency.ve' }] },
        error: null,
      });
    mocks.tenantCreate.mockResolvedValue({
      id: 'ten-page2',
      name: 'Agencia Page 2',
      billingLimit: 250,
      billingStatus: 'ACTIVE',
    });

    const res = await POST(
      new Request('http://localhost/api/admin/tenants/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: 'Agencia Page 2',
          countryCode: 'VE',
          ownerName: 'Ana',
          ownerEmail: 'existing@agency.ve',
          planId: 'pilot',
          billingStatus: 'ACTIVE',
          sendInviteEmail: true,
        }),
      }),
    );

    expect(res.status).toBe(201);
    expect(mocks.listUsers).toHaveBeenNthCalledWith(1, { page: 1, perPage: 200 });
    expect(mocks.listUsers).toHaveBeenNthCalledWith(2, { page: 2, perPage: 200 });
    expect(mocks.tenantCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          memberships: {
            create: expect.objectContaining({ userId: 'usr-page2' }),
          },
        }),
      }),
    );
  });
});
