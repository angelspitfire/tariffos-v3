import { getTenantClient, getUnscopedSystemPrisma } from './client';

class BillingService {
  /**
   * Checks if a tenant is allowed to run a new classification based on their billing limit.
   * Fail-closed on unknown tenant (M4): an unresolvable tenant must never
   * default to allowed. No-plan and DB-error paths intentionally unchanged.
   */
  async checkBillingLimit(tenantId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const prisma = getUnscopedSystemPrisma();
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { billingLimit: true, billingStatus: true, plan: true, allowOverage: true }
      });

      if (!tenant) {
        console.warn(`[BillingService] Tenant not found: ${tenantId}. Blocking classification.`);
        return { allowed: false, reason: 'UNKNOWN_TENANT' };
      }

      if (tenant.billingStatus !== 'ACTIVE') {
        console.log(`[BillingService] Tenant ${tenantId} is not active (status: ${tenant.billingStatus}). Blocked.`);
        return { allowed: false, reason: 'LIMIT_REACHED' };
      }

      if (!tenant.plan) {
        console.warn(`[BillingService] Tenant ${tenantId} has no plan. Allowing fallback or assume strict limit.`);
        return { allowed: true };
      }

      const limit = tenant.plan.maxClassifications;

      const now = new Date();
      const month = now.getMonth() + 1; // 1-12
      const year = now.getFullYear();

      const usage = await prisma.usageRecord.findUnique({
        where: {
          tenantId_month_year: {
            tenantId,
            month,
            year
          }
        },
        select: { count: true }
      });

      const currentCount = usage?.count || 0;
      if (currentCount >= limit) {
        if (tenant.allowOverage) {
          return { allowed: true };
        }
        console.log(`[BillingService] Tenant ${tenantId} exceeded limit: ${currentCount}/${limit}`);
        return { allowed: false, reason: 'LIMIT_REACHED' };
      }

      return { allowed: true };
    } catch (err: any) {
      console.error(`[BillingService] Error checking limit for tenant ${tenantId}:`, err);
      return { allowed: true };
    }
  }

  /**
   * Increments usage for the tenant for the current month.
   */
  async incrementUsage(
    tenantId: string, 
    type: "input" | "output" | "classification", 
    amount: number = 1
  ): Promise<void> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Check tenant existence before recording usage to avoid foreign-key violations
    try {
      const systemPrisma = getUnscopedSystemPrisma();
      const tenantExists = await systemPrisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true }
      });
      if (!tenantExists) {
        console.warn(`[BillingService] Tenant not found: ${tenantId}. Skipping usage increment.`);
        return;
      }
    } catch (err: any) {
      console.error(`[BillingService] Error checking tenant existence for ${tenantId}:`, err);
      return;
    }

    let client;
    try {
      client = getTenantClient(tenantId);
    } catch (err: any) {
      console.warn(`[BillingService] Skipping increment (Prisma failed): ${err.message}`);
      return;
    }

    if (!client || !client.usageRecord) {
      console.error(`[BillingService] Critical: Prisma client or usageRecord model is missing for tenant ${tenantId}.`);
      return;
    }

    try {
      const updateData: any = { updatedAt: new Date() };
      if (type === "input") updateData.inputTokens = { increment: amount };
      if (type === "output") updateData.outputTokens = { increment: amount };
      if (type === "classification") updateData.count = { increment: amount };

      await client.usageRecord.upsert({
        where: {
          tenantId_month_year: {
            tenantId,
            month,
            year
          }
        },
        update: updateData,
        create: {
          tenantId,
          month,
          year,
          inputTokens: type === "input" ? amount : 0,
          outputTokens: type === "output" ? amount : 0,
          count: type === "classification" ? amount : 0
        }
      });
      console.log(`[BillingService] Successfully incremented usage for tenant ${tenantId} (type: ${type}, amount: +${amount})`);
    } catch (err: any) {
      console.error(`[BillingService] Failed to increment usage for tenant ${tenantId}:`, err);
    }
  }

  /**
   * Increments the classification usage count and token usage (Agent backward-compatible)
   */
  async incrementUsageTokens(tenantId: string, inputTokens = 0, outputTokens = 0): Promise<void> {
    if (inputTokens > 0) await this.incrementUsage(tenantId, 'input', inputTokens);
    if (outputTokens > 0) await this.incrementUsage(tenantId, 'output', outputTokens);
    await this.incrementUsage(tenantId, 'classification', 1);
  }

  /**
   * Increments only the token usage without affecting the classification run count.
   */
  async incrementTokenUsage(tenantId: string, inputTokens = 0, outputTokens = 0): Promise<void> {
    if (inputTokens > 0) await this.incrementUsage(tenantId, 'input', inputTokens);
    if (outputTokens > 0) await this.incrementUsage(tenantId, 'output', outputTokens);
  }
}

export const billingService = new BillingService();

export async function incrementUsage(
  tenantId: string,
  type: "input" | "output" | "classification",
  amount: number = 1
) {
  return billingService.incrementUsage(tenantId, type, amount);
}

export async function checkUsageLimit(tenantId: string) {
  const { allowed, reason } = await billingService.checkBillingLimit(tenantId);
  return { allowed, reason };
}
