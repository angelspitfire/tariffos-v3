import { describe, it, expect, vi, beforeEach } from 'vitest';
import { billingService } from '../billing';
import { getTenantClient, getUnscopedSystemPrisma } from '../client';

// Mock del cliente de base de datos
vi.mock('../client', () => {
  const mockTenantFindUnique = vi.fn();
  const mockUsageRecordUpsert = vi.fn();
  const mockUsageRecordFindUnique = vi.fn();

  const mockPrisma = {
    tenant: {
      findUnique: mockTenantFindUnique,
    },
    usageRecord: {
      upsert: mockUsageRecordUpsert,
      findUnique: mockUsageRecordFindUnique,
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
  });
});
