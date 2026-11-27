import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  membershipFindFirst: vi.fn(),
  isSuperAdminUser: vi.fn(),
  checkBillingLimit: vi.fn(),
  provisionInternalAdminWorkspace: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock('@/lib/admin/super-admin', () => ({
  isSuperAdminUser: mocks.isSuperAdminUser,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    membership: { findFirst: mocks.membershipFindFirst },
  },
  billingService: {
    checkBillingLimit: mocks.checkBillingLimit,
  },
  provisionInternalAdminWorkspace: mocks.provisionInternalAdminWorkspace,
}));

import { checkTenantQuota, resolveCloudTenantContext } from './cloud-session';

describe('cloud-session super_admin bypass & auto-provisioning', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('bypasses billingService.checkBillingLimit completely when isSuperAdmin is true', async () => {
    const res = await checkTenantQuota('ten-any', { isBatch: true, requestedCount: 500, isSuperAdmin: true });
    expect(res).toEqual({ allowed: true });
    expect(mocks.checkBillingLimit).not.toHaveBeenCalled();
  });

  it('forwards clean options to billingService.checkBillingLimit for regular tenants', async () => {
    mocks.checkBillingLimit.mockResolvedValueOnce({ allowed: true });
    await checkTenantQuota('ten-1', { requestedCount: 5, isBatch: true });
    expect(mocks.checkBillingLimit).toHaveBeenCalledWith('ten-1', {
      requestedCount: 5,
      isBatch: true,
    });
  });

  it('auto-provisions internal workspace when super_admin lacks membership instead of returning 403', async () => {
    mocks.getAuthenticatedUser.mockResolvedValueOnce({
      id: 'usr-sa-2',
      email: 'erickampg25@gmail.com',
      user_metadata: { full_name: 'Erick' },
    });
    mocks.isSuperAdminUser.mockResolvedValueOnce(true);
    mocks.membershipFindFirst.mockResolvedValueOnce(null);
    mocks.provisionInternalAdminWorkspace.mockResolvedValueOnce({ tenantId: 'ten-internal-2' });

    const auth = await resolveCloudTenantContext();
    expect(auth).toEqual({
      ok: true,
      context: {
        userId: 'usr-sa-2',
        userEmail: 'erickampg25@gmail.com',
        tenantId: 'ten-internal-2',
        role: 'OWNER',
        isSuperAdmin: true,
      },
    });
    expect(mocks.provisionInternalAdminWorkspace).toHaveBeenCalledTimes(1);
  });

  it('returns 403 when regular user has no membership', async () => {
    mocks.getAuthenticatedUser.mockResolvedValueOnce({ id: 'usr-reg', email: 'reg@user.ve' });
    mocks.isSuperAdminUser.mockResolvedValueOnce(false);
    mocks.membershipFindFirst.mockResolvedValueOnce(null);

    const auth = await resolveCloudTenantContext();
    expect(auth).toEqual({
      ok: false,
      status: 403,
      error: 'No tenant membership found for user',
    });
  });
});
