import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  platformAdminFindUnique: vi.fn(),
  userProfileFindUnique: vi.fn(),
  membershipFindFirst: vi.fn(),
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    platformAdmin: { findUnique: mocks.platformAdminFindUnique },
    userProfile: { findUnique: mocks.userProfileFindUnique },
    membership: { findFirst: mocks.membershipFindFirst },
  },
}));

import { isSuperAdminUser } from './super-admin';

describe('super-admin detection', () => {
  const originalEnv = process.env.PLATFORM_ADMIN_EMAILS;

  afterEach(() => {
    vi.clearAllMocks();
    if (originalEnv === undefined) delete process.env.PLATFORM_ADMIN_EMAILS;
    else process.env.PLATFORM_ADMIN_EMAILS = originalEnv;
  });

  it('detects bootstrap, active platform_admins, and profile super_admin when no platform_admins row exists', async () => {
    process.env.PLATFORM_ADMIN_EMAILS = 'founder@tariffos.app';
    mocks.platformAdminFindUnique.mockResolvedValueOnce(null);
    expect(await isSuperAdminUser({ email: 'FOUNDER@tariffos.app' })).toBe(true);
    delete process.env.PLATFORM_ADMIN_EMAILS;

    mocks.platformAdminFindUnique.mockResolvedValueOnce({ role: 'super_admin', isActive: true });
    expect(await isSuperAdminUser({ userId: 'u-1', email: 'erickampg25@gmail.com' })).toBe(true);

    mocks.platformAdminFindUnique.mockResolvedValueOnce(null);
    mocks.userProfileFindUnique.mockResolvedValueOnce({ role: 'super_admin' });
    expect(await isSuperAdminUser({ userId: 'u-3', email: 'profile-admin@tariffos.app' })).toBe(true);
  });

  it('denies revoked or downgraded platform_admins even if profiles.role or PLATFORM_ADMIN_EMAILS say super_admin', async () => {
    process.env.PLATFORM_ADMIN_EMAILS = 'revoked@tariffos.app';
    mocks.platformAdminFindUnique.mockResolvedValueOnce({ role: 'super_admin', isActive: false });
    mocks.userProfileFindUnique.mockResolvedValueOnce({ role: 'super_admin' });
    expect(await isSuperAdminUser({ userId: 'u-rev', email: 'revoked@tariffos.app' })).toBe(false);
    delete process.env.PLATFORM_ADMIN_EMAILS;

    mocks.platformAdminFindUnique.mockResolvedValueOnce({ role: 'ops_billing', isActive: true });
    mocks.userProfileFindUnique.mockResolvedValueOnce({ role: 'super_admin' });
    expect(await isSuperAdminUser({ userId: 'u-ops', email: 'ops@tariffos.app' })).toBe(false);
  });

  it('resolves email via membership when called with userId only (Eve tool path) so revoked admins stay blocked', async () => {
    mocks.membershipFindFirst.mockResolvedValueOnce({ email: 'revoked@tariffos.app' });
    mocks.platformAdminFindUnique.mockResolvedValueOnce({ role: 'super_admin', isActive: false });
    mocks.userProfileFindUnique.mockResolvedValueOnce({ role: 'super_admin' });

    expect(await isSuperAdminUser({ userId: 'u-eve-revoked' })).toBe(false);
    expect(mocks.platformAdminFindUnique).toHaveBeenCalledWith({
      where: { email: 'revoked@tariffos.app' },
      select: { role: true, isActive: true },
    });
  });
});
