import { describe, expect, it, vi } from 'vitest';
import {
  findActivePlatformAdminByEmail,
  grantPlatformAdmin,
  normalizeAdminEmail,
  revokePlatformAdmin,
} from '../platform-admins';

describe('platform-admins service', () => {
  it('normalizes and validates admin emails', () => {
    expect(normalizeAdminEmail('  Angel.Fernandez@Gmail.com ')).toBe('angel.fernandez@gmail.com');
    expect(() => normalizeAdminEmail('invalid-email')).toThrow(/correo/i);
  });

  it('grants/upserts an active platform admin and records audit log', async () => {
    const upsertMock = vi.fn<() => Promise<unknown>>().mockResolvedValue({
      id: 'pa-1',
      email: 'ops@tariffos.app',
      role: 'ops_billing',
      isActive: true,
      notes: 'Operaciones',
    });
    const auditCreateMock = vi.fn<() => Promise<unknown>>().mockResolvedValue({ id: 'aud-1' });

    const client = {
      platformAdmin: {
        upsert: upsertMock,
        findUnique: vi.fn<() => Promise<unknown>>(),
        findMany: vi.fn<() => Promise<unknown[]>>(),
        update: vi.fn<() => Promise<unknown>>(),
      },
      adminAuditLog: { create: auditCreateMock },
    };

    const res = await grantPlatformAdmin(client, {
      email: 'OPS@TariffOS.app',
      role: 'ops_billing',
      notes: 'Operaciones',
      actor: 'cli:local',
    });

    expect(res).toMatchObject({ email: 'ops@tariffos.app', role: 'ops_billing', isActive: true });
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'ops@tariffos.app' },
        update: expect.objectContaining({ role: 'ops_billing', isActive: true }),
        create: expect.objectContaining({ email: 'ops@tariffos.app', role: 'ops_billing', isActive: true }),
      }),
    );
    expect(auditCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'platform_admin.granted' }),
      }),
    );
  });

  it('revokes an existing platform admin and records audit log', async () => {
    const findUniqueMock = vi.fn<() => Promise<unknown>>().mockResolvedValue({
      id: 'pa-1',
      email: 'ops@tariffos.app',
      role: 'ops_billing',
      isActive: true,
    });
    const updateMock = vi.fn<() => Promise<unknown>>().mockResolvedValue({
      id: 'pa-1',
      email: 'ops@tariffos.app',
      role: 'ops_billing',
      isActive: false,
    });
    const auditCreateMock = vi.fn<() => Promise<unknown>>().mockResolvedValue({ id: 'aud-2' });

    const client = {
      platformAdmin: {
        upsert: vi.fn<() => Promise<unknown>>(),
        findUnique: findUniqueMock,
        findMany: vi.fn<() => Promise<unknown[]>>(),
        update: updateMock,
      },
      adminAuditLog: { create: auditCreateMock },
    };

    const res = await revokePlatformAdmin(client, {
      email: 'ops@tariffos.app',
      reason: 'Cambio de rol',
      actor: 'cli:local',
    });

    expect(res).toMatchObject({ isActive: false });
    expect(auditCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'platform_admin.revoked' }),
      }),
    );
  });

  it('syncs profiles.role on grantPlatformAdmin and resets to user on revokePlatformAdmin', async () => {
    const upsertMock = vi.fn<() => Promise<unknown>>().mockResolvedValue({
      id: 'pa-sync',
      email: 'ops@tariffos.app',
      role: 'ops_billing',
      isActive: true,
    });
    const findUniqueMock = vi.fn<() => Promise<unknown>>().mockResolvedValue({
      id: 'pa-sync',
      email: 'ops@tariffos.app',
      role: 'ops_billing',
      isActive: true,
    });
    const updateMock = vi.fn<() => Promise<unknown>>().mockResolvedValue({
      id: 'pa-sync',
      email: 'ops@tariffos.app',
      role: 'ops_billing',
      isActive: false,
    });
    const membershipFindManyMock = vi
      .fn<() => Promise<Array<{ userId: string }>>>()
      .mockResolvedValue([{ userId: 'usr-ops-1' }]);
    const profileUpdateManyMock = vi.fn<() => Promise<unknown>>().mockResolvedValue({ count: 1 });

    const client = {
      platformAdmin: {
        upsert: upsertMock,
        findUnique: findUniqueMock,
        findMany: vi.fn<() => Promise<unknown[]>>(),
        update: updateMock,
      },
      membership: { findMany: membershipFindManyMock },
      userProfile: { updateMany: profileUpdateManyMock },
      adminAuditLog: { create: vi.fn<() => Promise<unknown>>() },
    };

    await grantPlatformAdmin(client, {
      email: 'ops@tariffos.app',
      role: 'ops_billing',
      actor: 'cli:local',
    });
    expect(profileUpdateManyMock).toHaveBeenCalledWith({
      where: { id: { in: ['usr-ops-1'] } },
      data: { role: 'ops_billing' },
    });

    await revokePlatformAdmin(client, {
      email: 'ops@tariffos.app',
      reason: 'Salida',
      actor: 'cli:local',
    });
    expect(profileUpdateManyMock).toHaveBeenLastCalledWith({
      where: { id: { in: ['usr-ops-1'] } },
      data: { role: 'user' },
    });
  });

  it('looks up active platform admin by normalized email', async () => {
    const findUniqueMock = vi
      .fn<() => Promise<{ role: string; isActive: boolean } | null>>()
      .mockResolvedValueOnce({ role: 'super_admin', isActive: true })
      .mockResolvedValueOnce({ role: 'support', isActive: false });

    const client = {
      platformAdmin: {
        upsert: vi.fn<() => Promise<unknown>>(),
        findUnique: findUniqueMock,
        findMany: vi.fn<() => Promise<unknown[]>>(),
        update: vi.fn<() => Promise<unknown>>(),
      },
      adminAuditLog: { create: vi.fn<() => Promise<unknown>>() },
    };

    expect(await findActivePlatformAdminByEmail(client, 'Admin@TariffOS.app')).toEqual({
      role: 'super_admin',
    });
    expect(await findActivePlatformAdminByEmail(client, 'revoked@tariffos.app')).toBeNull();
  });
});
