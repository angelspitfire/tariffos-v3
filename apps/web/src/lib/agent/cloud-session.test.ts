import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  membershipFindFirst: vi.fn(),
  decisionArtifactCount: vi.fn(),
  decisionArtifactCreate: vi.fn(),
  countryFindUnique: vi.fn(),
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
    decisionArtifact: {
      count: mocks.decisionArtifactCount,
      create: mocks.decisionArtifactCreate,
    },
    country: { findUnique: mocks.countryFindUnique },
  },
  billingService: {
    checkBillingLimit: mocks.checkBillingLimit,
  },
  provisionInternalAdminWorkspace: mocks.provisionInternalAdminWorkspace,
}));

import {
  checkTenantQuota,
  computeSourceSha256,
  persistClassificationOutcome,
  resolveCloudTenantContext,
} from './cloud-session';

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

  it('persists append-only DecisionArtifact with incremented version, userId, sourceSha256, and datasetVersion', async () => {
    mocks.decisionArtifactCount.mockResolvedValueOnce(1);
    mocks.countryFindUnique.mockResolvedValueOnce({ datasetVersion: 'arancel-2026' });
    mocks.decisionArtifactCreate.mockResolvedValueOnce({ id: 'art-v2' });

    const sha = computeSourceSha256('PDF-SOURCE-CONTENT');
    expect(sha).toMatch(/^[a-f0-9]{64}$/);

    const meta = await persistClassificationOutcome(
      'ten-1',
      {
        lineId: 'L1',
        product: 'Azúcar',
        hsCode: '1701.99.00.91',
        officialDescription: 'Azúcar refinada',
        originCountry: 'BR',
        confidenceLevel: 'Alto',
        confidencePct: 96,
        confidenceReason: 'RGI 1',
        rgiSteps: [],
        alternatives: [],
        rejected: [],
        flags: [],
        unresolved: [],
        duties: { cif: 1000, adValoremRate: 98, arancelAmount: 980, ivaRate: 16, ivaAmount: 316.8, unit: 'kg' },
        tierUsed: 'tier2_rgi',
        verifiedAgainstDb: true,
        modelUsed: 'test-model',
      },
      'Azúcar 1kg',
      'openai',
      {
        classificationId: 'cls_fixed_1',
        userId: 'usr-99',
        countryCode: 'VE',
        sourceSha256: sha,
      },
    );

    expect(meta).toEqual({
      artifactId: 'art-v2',
      version: 2,
      datasetVersion: 'arancel-2026',
      sourceSha256: sha,
    });
    expect(mocks.decisionArtifactCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          classificationId: 'cls_fixed_1',
          userId: 'usr-99',
          sourceSha256: sha,
          datasetVersion: 'arancel-2026',
          version: 2,
        }),
      }),
    );
  });
});
