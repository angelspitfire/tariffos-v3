import { describe, it, expect, vi, beforeEach } from 'vitest';
import { billingService } from '../billing';
import { getUnscopedSystemPrisma } from '../client';

// Mock del cliente de base de datos
vi.mock('../client', () => {
  const mockTenantFindUnique = vi.fn();
  const mockUsageRecordUpsert = vi.fn();
  const mockUsageRecordFindUnique = vi.fn();
  const mockUsageRecordAggregate = vi.fn();

  const mockPrisma = {
    tenant: {
      findUnique: mockTenantFindUnique,
    },
    usageRecord: {
      upsert: mockUsageRecordUpsert,
      findUnique: mockUsageRecordFindUnique,
      aggregate: mockUsageRecordAggregate,
    },
  };

  return {
    getUnscopedSystemPrisma: vi.fn(() => mockPrisma),
    getTenantClient: vi.fn(() => mockPrisma),
  };
});

describe('BillingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('incrementUsage', () => {
    it('checks the database for tenant existence and returns early when missing', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      // Simular que el inquilino no existe
      (mockPrisma.tenant.findUnique as any).mockResolvedValue(null);

      await billingService.incrementUsage('invalid-tenant', 'classification', 1);

      // Verify tenant existence was checked
      expect(mockPrisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: 'invalid-tenant' },
        select: { id: true },
      });

      // Verify no UsageRecord upsert was attempted
      expect(mockPrisma.usageRecord.upsert).not.toHaveBeenCalled();
    });

    it('debe proceder con el upsert de UsageRecord si el inquilino existe', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      // Simulate an existing tenant
      (mockPrisma.tenant.findUnique as any).mockResolvedValue({ id: 'valid-tenant' });
      (mockPrisma.usageRecord.upsert as any).mockResolvedValue({ id: 'record-id' });

      await billingService.incrementUsage('valid-tenant', 'classification', 1);

      // Verify existence was checked
      expect(mockPrisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: 'valid-tenant' },
        select: { id: true },
      });

      // Verify upsert was called
      expect(mockPrisma.usageRecord.upsert).toHaveBeenCalled();
    });
  });

  describe('checkBillingLimit', () => {
    it('blocks classification when the tenant is missing (fail-closed)', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.tenant.findUnique as any).mockResolvedValue(null);

      const result = await billingService.checkBillingLimit('ghost-tenant');

      expect(result).toEqual({ allowed: false, reason: 'UNKNOWN_TENANT' });
      expect(mockPrisma.usageRecord.findUnique).not.toHaveBeenCalled();
    });

    it('allows classification when the tenant is active and under the limit', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.tenant.findUnique as any).mockResolvedValue({
        billingLimit: 100,
        billingStatus: 'ACTIVE',
        plan: { maxClassifications: 100 },
        allowOverage: false,
      });
      (mockPrisma.usageRecord.findUnique as any).mockResolvedValue({ count: 10 });

      const result = await billingService.checkBillingLimit('valid-tenant');

      expect(result).toEqual({ allowed: true });
    });

    it('allows classification when tenant is TRIALING and under limit', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.tenant.findUnique as any).mockResolvedValue({
        billingLimit: 5,
        billingStatus: 'TRIALING',
        plan: { classificationLimit: 5, maxClassifications: 5 },
        allowOverage: false,
      });
      (mockPrisma.usageRecord.aggregate as any).mockResolvedValue({ _sum: { count: 2 } });

      const result = await billingService.checkBillingLimit('trial-tenant');
      expect(result).toEqual({ allowed: true });
    });

    it('uses lifetime usage via aggregate for TRIALING and oneTimeOnly plans', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.tenant.findUnique as any).mockResolvedValue({
        billingLimit: 250,
        billingStatus: 'ACTIVE',
        plan: { classificationLimit: 250, maxClassifications: 250, features: { oneTimeOnly: true } },
        allowOverage: false,
      });
      (mockPrisma.usageRecord.aggregate as any).mockResolvedValue({ _sum: { count: 250 } });

      const result = await billingService.checkBillingLimit('pilot-tenant');
      expect(result).toEqual({ allowed: false, reason: 'LIMIT_REACHED' });
      expect(mockPrisma.usageRecord.aggregate).toHaveBeenCalled();
    });

    it('blocks batch requests when requestedCount exceeds remaining quota', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.tenant.findUnique as any).mockResolvedValue({
        billingLimit: 1000,
        billingStatus: 'ACTIVE',
        plan: { classificationLimit: 1000, maxClassifications: 1000, features: { allowBatch: true } },
        allowOverage: false,
      });
      (mockPrisma.usageRecord.findUnique as any).mockResolvedValue({ count: 995 });

      const blocked = await billingService.checkBillingLimit('agency-tenant', {
        requestedCount: 10,
        isBatch: true,
      });
      expect(blocked).toEqual({ allowed: false, reason: 'LIMIT_REACHED' });

      const allowed = await billingService.checkBillingLimit('agency-tenant', {
        requestedCount: 5,
        isBatch: true,
      });
      expect(allowed).toEqual({ allowed: true });
    });

    it('blocks batch requests with BATCH_NOT_IN_PLAN when allowBatch is false or TRIALING', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.tenant.findUnique as any).mockResolvedValue({
        billingLimit: 50,
        billingStatus: 'ACTIVE',
        plan: { classificationLimit: 50, maxClassifications: 50, features: { allowBatch: false } },
        allowOverage: false,
      });

      const result = await billingService.checkBillingLimit('no-batch-tenant', {
        requestedCount: 3,
        isBatch: true,
      });
      expect(result).toEqual({ allowed: false, reason: 'BATCH_NOT_IN_PLAN' });
    });

    it('fails closed with QUOTA_CHECK_ERROR when database query throws', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.tenant.findUnique as any).mockRejectedValue(new Error('DB offline'));

      const result = await billingService.checkBillingLimit('any-tenant');
      expect(result).toEqual({ allowed: false, reason: 'QUOTA_CHECK_ERROR' });
    });

    it('blocks when limit <= 0 and allowOverage is false even without a plan', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.tenant.findUnique as any).mockResolvedValue({
        billingLimit: 0,
        billingStatus: 'ACTIVE',
        plan: null,
        allowOverage: false,
      });

      const result = await billingService.checkBillingLimit('zero-limit-tenant');
      expect(result).toEqual({ allowed: false, reason: 'LIMIT_REACHED' });
    });

    it('blocks classification with ACCOUNT_CANCELED when tenant is CANCELED', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.tenant.findUnique as any).mockResolvedValue({
        billingLimit: 100,
        billingStatus: 'CANCELED',
        plan: { classificationLimit: 100, maxClassifications: 100 },
        allowOverage: false,
      });

      const result = await billingService.checkBillingLimit('canceled-tenant');
      expect(result).toEqual({ allowed: false, reason: 'ACCOUNT_CANCELED' });
    });

    it('blocks classification with PAST_DUE when tenant is PAST_DUE', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.tenant.findUnique as any).mockResolvedValue({
        billingLimit: 100,
        billingStatus: 'PAST_DUE',
        plan: { classificationLimit: 100, maxClassifications: 100 },
        allowOverage: false,
      });

      const result = await billingService.checkBillingLimit('past-due-tenant');
      expect(result).toEqual({ allowed: false, reason: 'PAST_DUE' });
    });

    it('prioritizes custom tenant.billingLimit over plan.maxClassifications', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.tenant.findUnique as any).mockResolvedValue({
        billingLimit: 250,
        billingStatus: 'ACTIVE',
        plan: { classificationLimit: 100, maxClassifications: 100 },
        allowOverage: false,
      });
      (mockPrisma.usageRecord.findUnique as any).mockResolvedValue({ count: 150 });

      const result = await billingService.checkBillingLimit('custom-limit-tenant');
      expect(result).toEqual({ allowed: true });
    });
  });

  describe('getCurrentMonthUsage', () => {
    it('returns zeroed metrics when no usage record exists for current month', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.usageRecord.findUnique as any).mockResolvedValue(null);

      const snapshot = await billingService.getCurrentMonthUsage('valid-tenant');
      expect(snapshot.count).toBe(0);
      expect(snapshot.inputTokens).toBe(0);
      expect(snapshot.outputTokens).toBe(0);
      expect(snapshot.month).toBeGreaterThanOrEqual(1);
      expect(snapshot.month).toBeLessThanOrEqual(12);
    });

    it('returns stored count and token usage when record exists', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.usageRecord.findUnique as any).mockResolvedValue({
        count: 42,
        inputTokens: 12000,
        outputTokens: 3500,
      });

      const snapshot = await billingService.getCurrentMonthUsage('valid-tenant');
      expect(snapshot.count).toBe(42);
      expect(snapshot.inputTokens).toBe(12000);
      expect(snapshot.outputTokens).toBe(3500);
    });
  });

  describe('getEffectiveUsage', () => {
    it('aggregates lifetime counts and tokens when oneTimeOnly is true', async () => {
      const mockPrisma = getUnscopedSystemPrisma();
      (mockPrisma.usageRecord.aggregate as any).mockResolvedValue({
        _sum: { count: 140, inputTokens: 80000, outputTokens: 21000 },
      });

      const snapshot = await billingService.getEffectiveUsage('pilot-tenant', true);
      expect(snapshot.count).toBe(140);
      expect(snapshot.inputTokens).toBe(80000);
      expect(snapshot.outputTokens).toBe(21000);
    });
  });
});
