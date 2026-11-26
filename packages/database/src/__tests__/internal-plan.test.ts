import { beforeEach, describe, expect, it, vi } from 'vitest';
import { billingService } from '../billing';
import { getUnscopedSystemPrisma } from '../client';
import {
  ensureInternalTariffosPlan,
  INTERNAL_TARIFFOS_PLAN_DISPLAY_NAME,
  INTERNAL_TARIFFOS_PLAN_SLUG,
  isInternalTariffosPlanSlug,
  provisionInternalAdminWorkspace,
  UNLIMITED_QUOTA_SENTINEL,
} from '../internal-plan';

vi.mock('../client', () => {
  const mockPrisma = {
    tenant: { findUnique: vi.fn<() => Promise<unknown>>() },
    usageRecord: {
      findUnique: vi.fn<() => Promise<unknown>>(),
      aggregate: vi.fn<() => Promise<unknown>>(),
    },
  };
  return {
    getUnscopedSystemPrisma: vi.fn<() => typeof mockPrisma>(() => mockPrisma),
    getTenantClient: vi.fn<() => typeof mockPrisma>(() => mockPrisma),
  };
});

describe('Internal TariffOS Unlimited Plan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('identifies tariffos_internal slug exclusively', () => {
    expect(isInternalTariffosPlanSlug('tariffos_internal')).toBe(true);
    expect(isInternalTariffosPlanSlug('  TARIFFOS_INTERNAL ')).toBe(true);
    expect(isInternalTariffosPlanSlug('corporate')).toBe(false);
    expect(isInternalTariffosPlanSlug('pilot')).toBe(false);
    expect(isInternalTariffosPlanSlug(null)).toBe(false);
  });

  it('upserts hidden unlimited TariffOS internal plan via ensureInternalTariffosPlan', async () => {
    const planUpsert = vi.fn().mockResolvedValue({
      id: 'plan-internal-1',
      name: INTERNAL_TARIFFOS_PLAN_SLUG,
      classificationLimit: UNLIMITED_QUOTA_SENTINEL,
      allowOverage: true,
    });

    const row = await ensureInternalTariffosPlan({ plan: { upsert: planUpsert } });
    expect(row.id).toBe('plan-internal-1');
    expect(planUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: 'tariffos_internal' },
        create: expect.objectContaining({
          name: 'tariffos_internal',
          basePrice: 0,
          overagePrice: 0,
          allowOverage: true,
          classificationLimit: UNLIMITED_QUOTA_SENTINEL,
          features: expect.objectContaining({
            displayName: INTERNAL_TARIFFOS_PLAN_DISPLAY_NAME,
            unlimited: true,
            internalOnly: true,
            isPublic: false,
            allowBatch: true,
          }),
        }),
      }),
    );
  });

  it('provisions full internal admin workspace bound to the unlimited TariffOS plan', async () => {
    const client = {
      plan: {
        upsert: vi.fn().mockResolvedValue({
          id: 'plan-internal-1',
          name: INTERNAL_TARIFFOS_PLAN_SLUG,
          classificationLimit: UNLIMITED_QUOTA_SENTINEL,
          allowOverage: true,
        }),
      },
      platformAdmin: {
        upsert: vi.fn().mockResolvedValue({
          id: 'pa-1',
          email: 'angel.alberto.fernandez@gmail.com',
          role: 'super_admin',
          isActive: true,
        }),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      userProfile: {
        upsert: vi.fn().mockResolvedValue({ id: 'usr-1' }),
      },
      membership: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      tenant: {
        create: vi.fn().mockResolvedValue({ id: 'ten-internal-1' }),
        update: vi.fn(),
      },
      adminAuditLog: {
        create: vi.fn().mockResolvedValue({ id: 'aud-1' }),
      },
    };

    const result = await provisionInternalAdminWorkspace(client, {
      userId: 'usr-1',
      email: 'angel.alberto.fernandez@gmail.com',
      fullName: 'Ángel Alberto Fernández',
      companyName: 'TariffOS',
      role: 'super_admin',
      actor: 'cli:test',
    });

    expect(result).toMatchObject({
      tenantId: 'ten-internal-1',
      planId: 'plan-internal-1',
      planSlug: 'tariffos_internal',
      tenantAction: 'created',
    });
    expect(client.tenant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'TariffOS',
          planId: 'plan-internal-1',
          billingStatus: 'ACTIVE',
          billingLimit: UNLIMITED_QUOTA_SENTINEL,
          allowOverage: true,
          isOnboarded: true,
        }),
      }),
    );
  });

  it('allows unlimited single and batch classifications in BillingService when plan is unlimited', async () => {
    const mockPrisma = getUnscopedSystemPrisma();
    (mockPrisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      billingLimit: 0,
      billingStatus: 'ACTIVE',
      allowOverage: false,
      plan: {
        name: 'tariffos_internal',
        classificationLimit: 0,
        maxClassifications: 0,
        features: { unlimited: true, allowBatch: true, isPublic: false },
      },
    });

    const result = await billingService.checkBillingLimit('ten-internal-1', {
      requestedCount: 500_000,
      isBatch: true,
    });

    expect(result).toEqual({ allowed: true });
    expect(mockPrisma.usageRecord.findUnique).not.toHaveBeenCalled();
  });
});
