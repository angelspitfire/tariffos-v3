import { prisma } from '@tariffos/database';
import { requireAdmin } from '@/lib/admin/http-helpers';
import { getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function GET(): Promise<Response> {
  const guard = await requireAdmin('admin:read');
  if (!guard.ok) return guard.response;

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  if (!isCloudModeEnabled()) {
    const state = getOfflineAdminState();
    const pendingPaymentsList = state.payments.filter((p) => p.status === 'pending_verification');
    const overview = {
      totalTenants: state.tenants.length,
      activeTenants: state.tenants.filter((t) => t.billingStatus === 'ACTIVE').length,
      trialingTenants: state.tenants.filter((t) => t.billingStatus === 'TRIALING').length,
      canceledTenants: state.tenants.filter((t) => t.billingStatus === 'CANCELED').length,
      pendingPayments: pendingPaymentsList.length,
      pendingPaymentsAmountUsd: pendingPaymentsList.reduce((acc, p) => acc + p.amount, 0),
      pendingLeads: state.leads.filter((l) => l.status === 'PENDING').length,
      totalLeads: state.leads.length,
      totalPlans: state.plans.filter((p) => !p.isArchived).length,
      monthlyClassifications: state.tenants.reduce((acc, t) => acc + t.usedThisMonth, 0),
      monthlyTokens: state.tenants.reduce(
        (acc, t) => acc + t.inputTokensThisMonth + t.outputTokensThisMonth,
        0,
      ),
      nearLimitTenants: state.tenants.filter(
        (t) => t.billingLimit > 0 && t.usedThisMonth / t.billingLimit >= 0.8,
      ).length,
    };
    return Response.json({ mode: 'offline', overview }, { status: 200 });
  }

  const [tenants, pendingPaymentsAgg, pendingLeads, totalLeads, totalPlans, usageRows] =
    await Promise.all([
      prisma.tenant.findMany({
        select: { id: true, billingStatus: true, billingLimit: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'PENDING' },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.waitlistLead.count({ where: { status: 'PENDING' } }),
      prisma.waitlistLead.count(),
      prisma.plan.count(),
      prisma.usageRecord.findMany({
        where: { month, year },
        select: { tenantId: true, count: true, inputTokens: true, outputTokens: true },
      }),
    ]);

  const usageByTenant = new Map(usageRows.map((u) => [u.tenantId, u.count]));
  const overview = {
    totalTenants: tenants.length,
    activeTenants: tenants.filter((t) => t.billingStatus === 'ACTIVE').length,
    trialingTenants: tenants.filter((t) => t.billingStatus === 'TRIALING').length,
    canceledTenants: tenants.filter((t) => t.billingStatus === 'CANCELED').length,
    pendingPayments: pendingPaymentsAgg._count._all,
    pendingPaymentsAmountUsd: pendingPaymentsAgg._sum.amount ?? 0,
    pendingLeads,
    totalLeads,
    totalPlans,
    monthlyClassifications: usageRows.reduce((acc, u) => acc + u.count, 0),
    monthlyTokens: usageRows.reduce((acc, u) => acc + u.inputTokens + u.outputTokens, 0),
    nearLimitTenants: tenants.filter((t) => {
      const used = usageByTenant.get(t.id) ?? 0;
      return t.billingLimit > 0 && used / t.billingLimit >= 0.8;
    }).length,
  };

  return Response.json({ mode: 'cloud', overview }, { status: 200 });
}
