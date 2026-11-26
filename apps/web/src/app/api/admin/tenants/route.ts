import { prisma } from '@tariffos/database';
import type { AdminTenantSummary } from '@tariffos/shared-types';
import { extractPlanFeaturesMeta, requireAdmin } from '@/lib/admin/http-helpers';
import { findOfflinePlan, getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function GET(request: Request): Promise<Response> {
  const guard = await requireAdmin('admin:read');
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim().toLowerCase();
  const status = searchParams.get('status')?.trim();
  const planId = searchParams.get('planId')?.trim();
  const countryCode = searchParams.get('countryCode')?.trim().toUpperCase();

  if (!isCloudModeEnabled()) {
    let rows = getOfflineAdminState().tenants.map((t): AdminTenantSummary => {
      const plan = findOfflinePlan(t.planId);
      return {
        id: t.id,
        name: t.name,
        taxId: t.taxId,
        ownerName: t.ownerName,
        ownerEmail: t.ownerEmail,
        countryCode: t.countryCode,
        planId: t.planId,
        planName: plan?.displayName ?? t.planId ?? 'Sin plan',
        billingStatus: t.billingStatus,
        billingLimit: t.billingLimit,
        allowOverage: t.allowOverage,
        memberCount: t.members.length,
        usedThisMonth: t.usedThisMonth,
        inputTokensThisMonth: t.inputTokensThisMonth,
        outputTokensThisMonth: t.outputTokensThisMonth,
        createdAt: t.createdAt,
      };
    });
    if (status) rows = rows.filter((r) => r.billingStatus === status);
    if (planId) rows = rows.filter((r) => r.planId === planId);
    if (countryCode) rows = rows.filter((r) => r.countryCode.toUpperCase() === countryCode);
    if (query) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          (r.ownerEmail ?? '').toLowerCase().includes(query) ||
          (r.taxId ?? '').toLowerCase().includes(query),
      );
    }
    return Response.json({ mode: 'offline', tenants: rows }, { status: 200 });
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const dbTenants = await prisma.tenant.findMany({
    where: {
      ...(status ? { billingStatus: status as 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' } : {}),
      ...(planId ? { planId } : {}),
      ...(countryCode ? { countryCode } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { ownerEmail: { contains: query, mode: 'insensitive' } },
              { taxId: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      plan: { select: { name: true, features: true } },
      _count: { select: { memberships: true } },
      usageRecords: {
        where: { month, year },
        select: { count: true, inputTokens: true, outputTokens: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const tenants: AdminTenantSummary[] = dbTenants.map((t) => {
    const usage = t.usageRecords[0];
    const meta = extractPlanFeaturesMeta(t.plan?.features);
    return {
      id: t.id,
      name: t.name,
      taxId: t.taxId,
      ownerName: t.ownerName,
      ownerEmail: t.ownerEmail,
      countryCode: t.countryCode,
      planId: t.planId,
      planName: meta.displayName ?? t.plan?.name ?? 'Sin plan',
      billingStatus: t.billingStatus,
      billingLimit: t.billingLimit,
      allowOverage: t.allowOverage,
      memberCount: t._count.memberships,
      usedThisMonth: usage?.count ?? 0,
      inputTokensThisMonth: usage?.inputTokens ?? 0,
      outputTokensThisMonth: usage?.outputTokens ?? 0,
      createdAt: t.createdAt.toISOString(),
    };
  });

  return Response.json({ mode: 'cloud', tenants }, { status: 200 });
}
