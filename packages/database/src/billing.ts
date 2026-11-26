import type { Prisma } from './generated/client';
import { getTenantClient, getUnscopedSystemPrisma } from './client';

export interface CurrentMonthUsageSnapshot {
  month: number;
  year: number;
  count: number;
  inputTokens: number;
  outputTokens: number;
}

function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

class BillingService {
  /**
   * Checks if a tenant is allowed to run a new classification based on their billing limit.
   * Fail-closed on unknown tenant, canceled accounts, or past-due accounts.
   */
  async checkBillingLimit(tenantId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const prisma = getUnscopedSystemPrisma();
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { billingLimit: true, billingStatus: true, plan: true, allowOverage: true },
      });

      if (!tenant) {
        console.warn(`[BillingService] Tenant not found: ${tenantId}. Blocking classification.`);
        return { allowed: false, reason: 'UNKNOWN_TENANT' };
      }

      if (tenant.billingStatus === 'CANCELED') {
        return { allowed: false, reason: 'ACCOUNT_CANCELED' };
      }
      if (tenant.billingStatus === 'PAST_DUE') {
        return { allowed: false, reason: 'PAST_DUE' };
      }
      if (tenant.billingStatus !== 'ACTIVE' && tenant.billingStatus !== 'TRIALING') {
        return { allowed: false, reason: 'LIMIT_REACHED' };
      }

      const planLimit = tenant.plan?.classificationLimit ?? tenant.plan?.maxClassifications ?? 0;
      const limit = tenant.billingLimit > 0 ? tenant.billingLimit : planLimit;

      if (!tenant.plan && limit <= 0) {
        return { allowed: true };
      }

      const { month, year } = getCurrentMonthYear();
      const usage = await prisma.usageRecord.findUnique({
        where: { tenantId_month_year: { tenantId, month, year } },
        select: { count: true },
      });

      const currentCount = usage?.count ?? 0;
      if (limit > 0 && currentCount >= limit) {
        if (tenant.allowOverage) {
          return { allowed: true };
        }
        return { allowed: false, reason: 'LIMIT_REACHED' };
      }

      return { allowed: true };
    } catch (err: unknown) {
      console.error(`[BillingService] Error checking limit for tenant ${tenantId}:`, err);
      return { allowed: true };
    }
  }

  async getCurrentMonthUsage(tenantId: string): Promise<CurrentMonthUsageSnapshot> {
    const { month, year } = getCurrentMonthYear();
    const prisma = getUnscopedSystemPrisma();
    const usage = await prisma.usageRecord.findUnique({
      where: { tenantId_month_year: { tenantId, month, year } },
      select: { count: true, inputTokens: true, outputTokens: true },
    });

    return {
      month,
      year,
      count: usage?.count ?? 0,
      inputTokens: usage?.inputTokens ?? 0,
      outputTokens: usage?.outputTokens ?? 0,
    };
  }

  /**
   * Increments usage for the tenant for the current month.
   */
  async incrementUsage(
    tenantId: string,
    type: 'input' | 'output' | 'classification',
    amount = 1,
  ): Promise<void> {
    const { month, year } = getCurrentMonthYear();

    try {
      const systemPrisma = getUnscopedSystemPrisma();
      const tenantExists = await systemPrisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true },
      });
      if (!tenantExists) {
        console.warn(`[BillingService] Tenant not found: ${tenantId}. Skipping usage increment.`);
        return;
      }
    } catch (err: unknown) {
      console.error(`[BillingService] Error checking tenant existence for ${tenantId}:`, err);
      return;
    }

    let client;
    try {
      client = getTenantClient(tenantId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[BillingService] Skipping increment (Prisma failed): ${message}`);
      return;
    }

    if (!client || !client.usageRecord) {
      console.error(
        `[BillingService] Critical: Prisma client or usageRecord model is missing for tenant ${tenantId}.`,
      );
      return;
    }

    try {
      const updateData: Prisma.UsageRecordUpdateInput = { updatedAt: new Date() };
      if (type === 'input') updateData.inputTokens = { increment: amount };
      if (type === 'output') updateData.outputTokens = { increment: amount };
      if (type === 'classification') updateData.count = { increment: amount };

      await client.usageRecord.upsert({
        where: { tenantId_month_year: { tenantId, month, year } },
        update: updateData,
        create: {
          tenantId,
          month,
          year,
          inputTokens: type === 'input' ? amount : 0,
          outputTokens: type === 'output' ? amount : 0,
          count: type === 'classification' ? amount : 0,
        },
      });
    } catch (err: unknown) {
      console.error(`[BillingService] Failed to increment usage for tenant ${tenantId}:`, err);
    }
  }

  async incrementUsageTokens(tenantId: string, inputTokens = 0, outputTokens = 0): Promise<void> {
    if (inputTokens > 0) await this.incrementUsage(tenantId, 'input', inputTokens);
    if (outputTokens > 0) await this.incrementUsage(tenantId, 'output', outputTokens);
    await this.incrementUsage(tenantId, 'classification', 1);
  }

  async incrementTokenUsage(tenantId: string, inputTokens = 0, outputTokens = 0): Promise<void> {
    if (inputTokens > 0) await this.incrementUsage(tenantId, 'input', inputTokens);
    if (outputTokens > 0) await this.incrementUsage(tenantId, 'output', outputTokens);
  }
}

export const billingService = new BillingService();

export async function incrementUsage(
  tenantId: string,
  type: 'input' | 'output' | 'classification',
  amount = 1,
) {
  return billingService.incrementUsage(tenantId, type, amount);
}

export async function checkUsageLimit(tenantId: string) {
  const { allowed, reason } = await billingService.checkBillingLimit(tenantId);
  return { allowed, reason };
}
