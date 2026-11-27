import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn<() => Promise<unknown>>(),
  isCloudModeEnabled: vi.fn<() => boolean>(),
  platformAdminFindMany: vi.fn<() => Promise<unknown[]>>(),
  grantPlatformAdmin: vi.fn<() => Promise<unknown>>(),
  revokePlatformAdmin: vi.fn<() => Promise<unknown>>(),
  provisionInternalAdminWorkspace: vi.fn<() => Promise<unknown>>(),
  getSuperAdminEmailProviderStatus: vi.fn<() => unknown>(),
}));

vi.mock('@/lib/admin/http-helpers', async (importOriginal) => {
  const orig = await importOriginal<typeof import('@/lib/admin/http-helpers')>();
  return { ...orig, requireAdmin: mocks.requireAdmin };
});

vi.mock('@/lib/runtime-config', () => ({
  isCloudModeEnabled: mocks.isCloudModeEnabled,
}));

vi.mock('@tariffos/database', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tariffos/database')>();
  return {
    ...actual,
    prisma: {
      platformAdmin: { findMany: mocks.platformAdminFindMany },
    },
    grantPlatformAdmin: mocks.grantPlatformAdmin,
    revokePlatformAdmin: mocks.revokePlatformAdmin,
    provisionInternalAdminWorkspace: mocks.provisionInternalAdminWorkspace,
    getSuperAdminEmailProviderStatus: mocks.getSuperAdminEmailProviderStatus,
  };
});

import { resetOfflineAdminState } from '@/lib/admin/offline-store';
import { GET, PATCH, POST } from './route';

describe('/api/admin/admins (read-only web, CLI-only mutations)', () => {
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

  it('blocks POST /api/admin/admins with 403 CLI_ONLY_ADMIN_MANAGEMENT even for super_admin', async () => {
    const res = await POST();
    expect(res.status).toBe(403);
    const body = (await res.json()) as { code?: string; error?: string };
    expect(body.code).toBe('CLI_ONLY_ADMIN_MANAGEMENT');
    expect(body.error).toMatch(/consola local|pnpm admin:users/i);
    expect(mocks.provisionInternalAdminWorkspace).not.toHaveBeenCalled();
  });

  it('blocks PATCH /api/admin/admins with 403 CLI_ONLY_ADMIN_MANAGEMENT even for super_admin', async () => {
    const res = await PATCH();
    expect(res.status).toBe(403);
    const body = (await res.json()) as { code?: string; error?: string };
    expect(body.code).toBe('CLI_ONLY_ADMIN_MANAGEMENT');
    expect(body.error).toMatch(/consola local|pnpm admin:users/i);
    expect(mocks.revokePlatformAdmin).not.toHaveBeenCalled();
    expect(mocks.grantPlatformAdmin).not.toHaveBeenCalled();
  });
});
