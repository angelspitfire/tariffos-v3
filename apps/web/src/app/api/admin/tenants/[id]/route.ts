import { prisma, recordAdminAudit } from '@tariffos/database';
import { AdminTenantPatchSchema } from '@tariffos/shared-types';
import { extractPlanFeaturesMeta, parseJsonBody, requireAdmin } from '@/lib/admin/http-helpers';
import { appendOfflineAudit, findOfflinePlan, getOfflineAdminState } from '@/lib/admin/offline-store';
import { toManualPaymentRecord } from '@/lib/admin/payment-mapper';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guard = await requireAdmin('admin:read');
  if (!guard.ok) return guard.response;
  const { id } = await context.params;

  if (!isCloudModeEnabled()) {
    const state = getOfflineAdminState();
    const tenant = state.tenants.find((t) => t.id === id);
    if (!tenant) return Response.json({ error: 'Tenant not found' }, { status: 404 });
    const plan = findOfflinePlan(tenant.planId);
    const now = new Date();
    return Response.json(
      {
        mode: 'offline',
        tenant: {
          ...tenant,
          planName: plan?.displayName ?? tenant.planId ?? 'Sin plan',
          payments: state.payments.filter((p) => p.tenantId === id),
          usageHistory: [
            {
              month: now.getMonth() + 1,
              year: now.getFullYear(),
              count: tenant.usedThisMonth,
              inputTokens: tenant.inputTokensThisMonth,
              outputTokens: tenant.outputTokensThisMonth,
            },
          ],
          batchJobs: [],
        },
      },
      { status: 200 },
    );
  }

  const row = await prisma.tenant.findUnique({
    where: { id },
    include: {
      plan: true,
      memberships: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'desc' }, take: 20 },
      usageRecords: { orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 6 },
      batchJobs: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });
  if (!row) return Response.json({ error: 'Tenant not found' }, { status: 404 });

  const planMeta = extractPlanFeaturesMeta(row.plan?.features);
  return Response.json({
    mode: 'cloud',
    tenant: {
      id: row.id,
      name: row.name,
      taxId: row.taxId,
      ownerName: row.ownerName,
      ownerEmail: row.ownerEmail,
      countryCode: row.countryCode,
      planId: row.planId,
      planName: planMeta.displayName ?? row.plan?.name ?? 'Sin plan',
      billingStatus: row.billingStatus,
      billingLimit: row.billingLimit,
      allowOverage: row.allowOverage,
      createdAt: row.createdAt.toISOString(),
      members: row.memberships.map((m) => ({
        userId: m.userId,
        email: m.email ?? '',
        name: m.name ?? 'Usuario',
        role: m.role,
        position: m.position ?? undefined,
      })),
      payments: row.payments.map((p) =>
        toManualPaymentRecord({ ...p, tenant: { name: row.name, ownerEmail: row.ownerEmail } }),
      ),
      usageHistory: row.usageRecords,
      batchJobs: row.batchJobs.map((j) => ({
        id: j.id,
        type: j.type,
        status: j.status,
        description: j.description,
        createdAt: j.createdAt.toISOString(),
      })),
    },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guard = await requireAdmin('tenants:manage');
  if (!guard.ok) return guard.response;
  const { id } = await context.params;
  const rawBody = await parseJsonBody(request);
  if (rawBody === null) return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });

  const parsed = AdminTenantPatchSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;

  if (!isCloudModeEnabled()) {
    const tenant = getOfflineAdminState().tenants.find((t) => t.id === id);
    if (!tenant) return Response.json({ error: 'Tenant not found' }, { status: 404 });
    const prev = { planId: tenant.planId, billingLimit: tenant.billingLimit, billingStatus: tenant.billingStatus };
    if (input.planId) {
      const plan = findOfflinePlan(input.planId);
      tenant.planId = plan?.id ?? input.planId;
      if (!input.billingLimit && plan) tenant.billingLimit = plan.classificationLimit;
    }
    if (input.billingLimit !== undefined) tenant.billingLimit = input.billingLimit;
    if (input.billingStatus !== undefined) tenant.billingStatus = input.billingStatus;
    if (input.allowOverage !== undefined) tenant.allowOverage = input.allowOverage;
    if (input.countryCode !== undefined) tenant.countryCode = input.countryCode;
    appendOfflineAudit({
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'tenant.updated',
      targetType: 'tenant',
      targetId: id,
      tenantId: id,
      reason: input.reason,
      beforeState: prev,
      afterState: { planId: tenant.planId, billingLimit: tenant.billingLimit, billingStatus: tenant.billingStatus },
    });
    return Response.json({ mode: 'offline', tenant }, { status: 200 });
  }

  const existing = await prisma.tenant.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: 'Tenant not found' }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.tenant.update({
      where: { id },
      data: {
        ...(input.planId ? { planId: input.planId } : {}),
        ...(input.billingLimit !== undefined ? { billingLimit: input.billingLimit } : {}),
        ...(input.billingStatus !== undefined ? { billingStatus: input.billingStatus } : {}),
        ...(input.allowOverage !== undefined ? { allowOverage: input.allowOverage } : {}),
        ...(input.countryCode !== undefined ? { countryCode: input.countryCode } : {}),
      },
    });
    await recordAdminAudit(tx, {
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'tenant.updated',
      targetType: 'tenant',
      targetId: id,
      tenantId: id,
      beforeState: { planId: existing.planId, billingLimit: existing.billingLimit, billingStatus: existing.billingStatus },
      afterState: { planId: row.planId, billingLimit: row.billingLimit, billingStatus: row.billingStatus },
      reason: input.reason,
    });
    return row;
  });

  return Response.json({ mode: 'cloud', tenant: updated }, { status: 200 });
}
