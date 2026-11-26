import { billingService, prisma } from '@tariffos/database';
import { SAAS_PLANS, type ClientCurrentUsageSnapshot } from '@tariffos/shared-types';
import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import { extractPlanFeaturesMeta } from '@/lib/admin/http-helpers';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function GET(): Promise<Response> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  if (!isCloudModeEnabled()) {
    const usage: ClientCurrentUsageSnapshot = {
      tenantId: 'offline-tenant',
      tenantName: 'Espacio Demo TariffOS',
      planId: 'pro',
      planName: 'Pro',
      billingStatus: 'ACTIVE',
      allowOverage: false,
      month,
      year,
      used: 18,
      limit: 400,
      percentUsed: 5,
      inputTokens: 14200,
      outputTokens: 3800,
    };
    return Response.json({ mode: 'offline', usage }, { status: 200 });
  }

  const auth = await resolveCloudTenantContext();
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: auth.context.tenantId },
    select: {
      id: true,
      name: true,
      planId: true,
      billingLimit: true,
      billingStatus: true,
      allowOverage: true,
      plan: { select: { name: true, classificationLimit: true, features: true } },
    },
  });

  if (!tenant) {
    return Response.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const monthly = await billingService.getCurrentMonthUsage(tenant.id);
  const limit =
    tenant.billingLimit > 0 ? tenant.billingLimit : (tenant.plan?.classificationLimit ?? 100);
  const percentUsed = limit > 0 ? Math.min(100, Math.round((monthly.count / limit) * 100)) : 0;

  const planMeta = extractPlanFeaturesMeta(tenant.plan?.features);
  const fallbackPlanName =
    SAAS_PLANS.find((p) => p.planId === tenant.planId)?.name ?? tenant.plan?.name ?? 'Trial';

  const usage: ClientCurrentUsageSnapshot = {
    tenantId: tenant.id,
    tenantName: tenant.name,
    planId: tenant.planId ?? 'trial',
    planName: planMeta.displayName ?? fallbackPlanName,
    billingStatus: tenant.billingStatus,
    allowOverage: tenant.allowOverage,
    month: monthly.month,
    year: monthly.year,
    used: monthly.count,
    limit,
    percentUsed,
    inputTokens: monthly.inputTokens,
    outputTokens: monthly.outputTokens,
  };

  return Response.json({ mode: 'cloud', usage }, { status: 200 });
}
