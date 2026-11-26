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
      planId: 'agencia',
      planName: 'Agencia',
      billingStatus: 'ACTIVE',
      allowOverage: false,
      oneTimeOnly: false,
      allowBatch: true,
      month,
      year,
      used: 18,
      limit: 1000,
      percentUsed: 2,
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

  const planMeta = extractPlanFeaturesMeta(tenant.plan?.features);
  const isOneTime = planMeta.oneTimeOnly || tenant.billingStatus === 'TRIALING';
  const monthly = await billingService.getEffectiveUsage(tenant.id, isOneTime);
  const isPendingInitialActivation =
    tenant.billingStatus === 'PAST_DUE' && tenant.billingLimit === 0;
  const limit = isPendingInitialActivation
    ? 0
    : tenant.billingLimit > 0
      ? tenant.billingLimit
      : (tenant.plan?.classificationLimit ?? 0);
  const percentUsed = limit > 0 ? Math.min(100, Math.round((monthly.count / limit) * 100)) : 0;

  const fallbackPlanName =
    SAAS_PLANS.find((p) => p.planId === tenant.planId || p.planId === tenant.plan?.name)?.name ??
    tenant.plan?.name ??
    'Piloto Operativo';

  const usage: ClientCurrentUsageSnapshot = {
    tenantId: tenant.id,
    tenantName: tenant.name,
    planId: tenant.planId ?? tenant.plan?.name ?? 'pilot',
    planName: planMeta.displayName ?? fallbackPlanName,
    billingStatus: tenant.billingStatus,
    allowOverage: tenant.allowOverage,
    oneTimeOnly: planMeta.oneTimeOnly,
    allowBatch: planMeta.allowBatch,
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
