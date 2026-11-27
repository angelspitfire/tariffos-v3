import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn<() => Promise<unknown>>(),
  isCloudModeEnabled: vi.fn<() => boolean>(),
  listUsers: vi.fn<() => Promise<unknown>>(),
  createUser: vi.fn<() => Promise<unknown>>(),
  updateUserById: vi.fn<() => Promise<unknown>>(),
  platformAdminFindMany: vi.fn<() => Promise<unknown[]>>(),
  grantPlatformAdmin: vi.fn<() => Promise<unknown>>(),
  revokePlatformAdmin: vi.fn<() => Promise<unknown>>(),
  provisionInternalAdminWorkspace: vi.fn<() => Promise<unknown>>(),
  sendSuperAdminCredentialsEmail: vi.fn<() => Promise<unknown>>(),
  getSuperAdminEmailProviderStatus: vi.fn<() => unknown>(),
  generateTemporaryAdminPassword: vi.fn<() => string>(),
}));

vi.mock('@/lib/admin/http-helpers', async (importOriginal) => {
  const orig = await importOriginal<typeof import('@/lib/admin/http-helpers')>();
  return { ...orig, requireAdmin: mocks.requireAdmin };
});

vi.mock('@/lib/runtime-config', () => ({
  isCloudModeEnabled: mocks.isCloudModeEnabled,
}));

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    auth: {
      admin: {
        listUsers: mocks.listUsers,
        createUser: mocks.createUser,
        updateUserById: mocks.updateUserById,
      },
    },
  }),
}));

vi.mock('@tariffos/database', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tariffos/database')>();
  return {
    ...actual,
    prisma: {
      platformAdmin: { findMany: mocks.platformAdminFindMany },
      $transaction: async <T>(fn: (tx: unknown) => Promise<T>) => fn({ tx: true }),
    },
    grantPlatformAdmin: mocks.grantPlatformAdmin,
    revokePlatformAdmin: mocks.revokePlatformAdmin,
    provisionInternalAdminWorkspace: mocks.provisionInternalAdminWorkspace,
    sendSuperAdminCredentialsEmail: mocks.sendSuperAdminCredentialsEmail,
    getSuperAdminEmailProviderStatus: mocks.getSuperAdminEmailProviderStatus,
    generateTemporaryAdminPassword: mocks.generateTemporaryAdminPassword,
  };
});

import { getOfflineAdminState, resetOfflineAdminState } from '@/lib/admin/offline-store';
import { GET, PATCH, POST } from './route';

describe('/api/admin/admins', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetOfflineAdminState();
    mocks.isCloudModeEnabled.mockReturnValue(false);
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'admin@tariffos.app', role: 'super_admin' },
    });
    mocks.getSuperAdminEmailProviderStatus.mockReturnValue({
      configured: false,
      provider: 'none',
      fromAddress: null,
    });
    mocks.generateTemporaryAdminPassword.mockReturnValue('TfOS!Temp#999a');
    mocks.sendSuperAdminCredentialsEmail.mockResolvedValue({
      delivered: false,
      provider: 'none',
      includedTemporaryPassword: false,
      error: 'No provider',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('rejects non-super_admin callers with 403', async () => {
    mocks.requireAdmin.mockResolvedValue({
      ok: false,
      response: Response.json({ error: 'Insufficient permissions for admins:manage' }, { status: 403 }),
    });

    const res = await GET();
    expect(res.status).toBe(403);
    expect(mocks.requireAdmin).toHaveBeenCalledWith('admins:manage');
  });

  it('lists admins and email provider status in offline and cloud modes', async () => {
    const offlineRes = await GET();
    expect(offlineRes.status).toBe(200);
    const offlineBody = (await offlineRes.json()) as {
      mode: string;
      admins: Array<{ email: string }>;
      emailProvider: { configured: boolean };
    };
    expect(offlineBody.mode).toBe('offline');
    expect(offlineBody.admins[0]?.email).toBe('admin@tariffos.app');
    expect(offlineBody.emailProvider.configured).toBe(false);

    mocks.isCloudModeEnabled.mockReturnValue(true);
    mocks.platformAdminFindMany.mockResolvedValue([
      {
        id: 'pa-1',
        email: 'angel.alberto.fernandez@gmail.com',
        role: 'super_admin',
        isActive: true,
        notes: 'Founder',
        createdBy: 'cli:test',
        createdAt: new Date('2026-11-26T10:00:00.000Z'),
        updatedAt: new Date('2026-11-26T10:00:00.000Z'),
      },
    ]);

    const cloudRes = await GET();
    expect(cloudRes.status).toBe(200);
    const cloudBody = (await cloudRes.json()) as {
      mode: string;
      admins: Array<{ email: string; createdAt: string }>;
    };
    expect(cloudBody.mode).toBe('cloud');
    expect(cloudBody.admins[0]?.email).toBe('angel.alberto.fernandez@gmail.com');
    expect(cloudBody.admins[0]?.createdAt).toBe('2026-11-26T10:00:00.000Z');
  });

  it('validates input and provisions admin in offline mode with tariffos_internal plan', async () => {
    const badRes = await POST(
      new Request('http://localhost/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bad-email', fullName: 'X' }),
      }),
    );
    expect(badRes.status).toBe(400);

    const okRes = await POST(
      new Request('http://localhost/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'Erickampg25@gmail.com',
          fullName: 'Ericka',
          role: 'super_admin',
        }),
      }),
    );
    expect(okRes.status).toBe(201);
    const body = (await okRes.json()) as {
      mode: string;
      admin: { email: string; role: string; isActive: boolean };
      temporaryPassword: string;
      planSlug: string;
    };
    expect(body.mode).toBe('offline');
    expect(body.admin.email).toBe('erickampg25@gmail.com');
    expect(body.temporaryPassword).toBe('TfOS!Temp#999a');
    expect(body.planSlug).toBe('tariffos_internal');
    expect(getOfflineAdminState().auditLogs[0]?.action).toBe('platform_admin.provisioned');
  });

  it('provisions confirmed Supabase Auth user, unlimited workspace, and dispatches credentials email in cloud mode', async () => {
    mocks.isCloudModeEnabled.mockReturnValue(true);
    mocks.listUsers.mockResolvedValue({ data: { users: [] }, error: null });
    mocks.createUser.mockResolvedValue({
      data: { user: { id: 'usr-new-admin' } },
      error: null,
    });
    mocks.provisionInternalAdminWorkspace.mockResolvedValue({
      adminId: 'pa-new',
      tenantId: 'ten-new',
      tenantAction: 'created',
      planId: 'plan-internal',
      planSlug: 'tariffos_internal',
    });
    mocks.sendSuperAdminCredentialsEmail.mockResolvedValue({
      delivered: true,
      provider: 'resend',
      includedTemporaryPassword: true,
      messageId: 're_1',
    });

    const res = await POST(
      new Request('http://localhost/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nuevo@tariffos.app',
          fullName: 'Nuevo Admin',
          role: 'super_admin',
        }),
      }),
    );

    expect(res.status).toBe(201);
    expect(mocks.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'nuevo@tariffos.app',
        password: 'TfOS!Temp#999a',
        email_confirm: true,
        user_metadata: { full_name: 'Nuevo Admin', must_change_password: true },
        app_metadata: { platform_role: 'super_admin' },
      }),
    );
    expect(mocks.provisionInternalAdminWorkspace).toHaveBeenCalledTimes(1);
    expect(mocks.sendSuperAdminCredentialsEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: 'nuevo@tariffos.app',
        temporaryPassword: 'TfOS!Temp#999a',
      }),
    );
  });

  it('prevents self-revocation and revokes/re-grants other admins via PATCH', async () => {
    const selfRes = await PATCH(
      new Request('http://localhost/api/admin/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@tariffos.app', action: 'revoke' }),
      }),
    );
    expect(selfRes.status).toBe(400);

    getOfflineAdminState().platformAdmins.push({
      id: 'pa-2',
      email: 'soporte@tariffos.app',
      role: 'support',
      isActive: true,
      notes: null,
      createdBy: 'adm-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const revokeRes = await PATCH(
      new Request('http://localhost/api/admin/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'soporte@tariffos.app', action: 'revoke', reason: 'Rotación' }),
      }),
    );
    expect(revokeRes.status).toBe(200);
    const revoked = (await revokeRes.json()) as { admin: { isActive: boolean } };
    expect(revoked.admin.isActive).toBe(false);

    mocks.isCloudModeEnabled.mockReturnValue(true);
    mocks.grantPlatformAdmin.mockResolvedValue({
      id: 'pa-2',
      email: 'soporte@tariffos.app',
      role: 'ops_billing',
      isActive: true,
      notes: 'Reactivado',
      createdBy: 'adm-1',
      createdAt: new Date('2026-11-26T10:00:00.000Z'),
      updatedAt: new Date('2026-11-26T12:00:00.000Z'),
    });

    const grantRes = await PATCH(
      new Request('http://localhost/api/admin/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'soporte@tariffos.app',
          action: 'grant',
          role: 'ops_billing',
          reason: 'Reactivado',
        }),
      }),
    );
    expect(grantRes.status).toBe(200);
    expect(mocks.grantPlatformAdmin).toHaveBeenCalledTimes(1);
  });
});
