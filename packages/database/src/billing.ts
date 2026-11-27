import type { Prisma } from './generated/client';
import { getTenantClient, getUnscopedSystemPrisma } from './client';
import { isInternalTariffosPlanSlug } from './internal-plan';

export interface CurrentMonthUsageSnapshot {
  month: number;
  year: number;
  count: number;
  inputTokens: number;
  outputTokens: number;
}

export interface CheckBillingLimitOptions {
  requestedCount?: number;
  isBatch?: boolean;
}

function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function extractBillingPlanFlags(features: unknown): {
  oneTimeOnly: boolean;
  allowBatch: boolean;
  unlimited: boolean;
} {
  if (!features || typeof features !== 'object' || Array.isArray(features)) {
    return { oneTimeOnly: false, allowBatch: true, unlimited: false };
  }
  const record = features as Record<string, unknown>;
  return {
    oneTimeOnly: Boolean(record.oneTimeOnly),
    allowBatch: record.allowBatch === undefined ? true : Boolean(record.allowBatch),
    unlimited: Boolean(record.unlimited),
  };
}

class BillingService {
  /**
   * Checks if a tenant is allowed to run new classifications based on status, plan capabilities, and quota.
   * Fail-closed on unknown tenant, canceled/past-due accounts, quota errors, or batch overflow.
   */
  async checkBillingLimit(
    tenantId: string,
    options?: CheckBillingLimitOptions,
  ): Promise<{ allowed: boolean; reason?: string }> {
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

      const planFlags = extractBillingPlanFlags(tenant.plan?.features);
      if (options?.isBatch && (!planFlags.allowBatch || tenant.billingStatus === 'TRIALING')) {
        return { allowed: false, reason: 'BATCH_NOT_IN_PLAN' };
      }

      if (planFlags.unlimited || isInternalTariffosPlanSlug(tenant.plan?.name)) {
        return { allowed: true };
      }

      const planLimit = tenant.plan?.classificationLimit ?? tenant.plan?.maxClassifications ?? 0;
      const limit = tenant.billingLimit > 0 ? tenant.billingLimit : planLimit;

      if (limit <= 0 && !tenant.allowOverage) {
        return { allowed: false, reason: 'LIMIT_REACHED' };
      }

      const isLifetimeQuota = planFlags.oneTimeOnly || tenant.billingStatus === 'TRIALING';
      let currentCount = 0;
      if (isLifetimeQuota) {
        const agg = await prisma.usageRecord.aggregate({
          where: { tenantId },
          _sum: { count: true },
        });
        currentCount = agg._sum.count ?? 0;
      } else {
        const { month, year } = getCurrentMonthYear();
        const usage = await prisma.usageRecord.findUnique({
          where: { tenantId_month_year: { tenantId, month, year } },
          select: { count: true },
        });
        currentCount = usage?.count ?? 0;
      }

      const requested = Math.max(1, options?.requestedCount ?? 1);
      if (limit > 0 && currentCount + requested > limit) {
        if (tenant.allowOverage) {
          return { allowed: true };
        }
        return { allowed: false, reason: 'LIMIT_REACHED' };
      }

      return { allowed: true };
    } catch (err: unknown) {
      console.error(`[BillingService] Error checking limit for tenant ${tenantId}:`, err);
      return { allowed: false, reason: 'QUOTA_CHECK_ERROR' };
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

  async getEffectiveUsage(
    tenantId: string,
    oneTimeOnly: boolean,
  ): Promise<CurrentMonthUsageSnapshot> {
    if (!oneTimeOnly) {
      return this.getCurrentMonthUsage(tenantId);
    }
    const { month, year } = getCurrentMonthYear();
    const prisma = getUnscopedSystemPrisma();
    const agg = await prisma.usageRecord.aggregate({
      where: { tenantId },
      _sum: { count: true, inputTokens: true, outputTokens: true },
    });
    return {
      month,
      year,
      count: agg._sum.count ?? 0,
      inputTokens: agg._sum.inputTokens ?? 0,
      outputTokens: agg._sum.outputTokens ?? 0,
    };
  }

  /**
   * Atomically records classification count and token deltas in a single
   * tenant existence check + `usageRecord.upsert` roundtrip.
   */
  async recordUsageDelta(
    tenantId: string,
    delta: { count?: number; inputTokens?: number; outputTokens?: number },
  ): Promise<void> {
    const countDelta = Math.max(0, Math.floor(delta.count ?? 0));
    const inputDelta = Math.max(0, Math.floor(delta.inputTokens ?? 0));
    const outputDelta = Math.max(0, Math.floor(delta.outputTokens ?? 0));
    if (countDelta === 0 && inputDelta === 0 && outputDelta === 0) return;

    const { month, year } = getCurrentMonthYear();
    const systemPrisma = getUnscopedSystemPrisma();

    try {
      const tenantExists = await systemPrisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true },
      });
      if (!tenantExists) {
        console.warn(`[BillingService] Tenant not found: ${tenantId}. Skipping usage increment.`);
        return;
      }

      const client = getTenantClient(tenantId);
      if (!client?.usageRecord) {
        console.error(
          `[BillingService] Critical: Prisma client or usageRecord model is missing for tenant ${tenantId}.`,
        );
        return;
      }

      const updateData: Prisma.UsageRecordUpdateInput = { updatedAt: new Date() };
      if (countDelta > 0) updateData.count = { increment: countDelta };
      if (inputDelta > 0) updateData.inputTokens = { increment: inputDelta };
      if (outputDelta > 0) updateData.outputTokens = { increment: outputDelta };

      await client.usageRecord.upsert({
        where: { tenantId_month_year: { tenantId, month, year } },
        update: updateData,
        create: {
          tenantId,
          month,
          year,
          count: countDelta,
          inputTokens: inputDelta,
          outputTokens: outputDelta,
        },
      });
    } catch (err: unknown) {
      console.error(`[BillingService] Failed to increment usage for tenant ${tenantId}:`, err);
    }
  }

  /**
   * Increments usage for the tenant for the current month.
   */
  async incrementUsage(
    tenantId: string,
    type: 'input' | 'output' | 'classification',
    amount = 1,
  ): Promise<void> {
    return this.recordUsageDelta(tenantId, {
      ...(type === 'classification' ? { count: amount } : {}),
      ...(type === 'input' ? { inputTokens: amount } : {}),
      ...(type === 'output' ? { outputTokens: amount } : {}),
    });
  }

  async incrementUsageTokens(tenantId: string, inputTokens = 0, outputTokens = 0): Promise<void> {
    return this.recordUsageDelta(tenantId, { count: 1, inputTokens, outputTokens });
  }

  async incrementTokenUsage(tenantId: string, inputTokens = 0, outputTokens = 0): Promise<void> {
    return this.recordUsageDelta(tenantId, { inputTokens, outputTokens });
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

export async function checkUsageLimit(
  tenantId: string,
  options?: CheckBillingLimitOptions,
) {
  const { allowed, reason } = await billingService.checkBillingLimit(tenantId, options);
  return { allowed, reason };
}
