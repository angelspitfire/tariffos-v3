import { prisma } from '@tariffos/database';
import type { TenantBillingStatus } from '@tariffos/shared-types';
import { resolvePlatformAdminContext } from '@/lib/admin/admin-session';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export type FunnelGateRoute = 'onboarding' | 'activate-plan' | 'app';

export interface FunnelMembershipSnapshot {
  tenantId: string;
  isOnboarded: boolean;
  billingStatus: TenantBillingStatus;
}

export interface DecideFunnelGateParams {
  route: FunnelGateRoute;
  isAuthenticated: boolean;
  isPlatformAdmin: boolean;
  isSuperAdmin?: boolean;
  membership: FunnelMembershipSnapshot | null;
  hasFunnelPlanParam: boolean;
  plan?: string | null;
  cycle?: string | null;
}

function buildPlanQuery(plan?: string | null, cycle?: string | null): string {
  if (!plan) return '';
  const cycleSuffix =
    cycle === 'annual' || cycle === 'monthly'
      ? `&cycle=${encodeURIComponent(cycle)}`
      : '';
  return `?plan=${encodeURIComponent(plan)}${cycleSuffix}`;
}

export function decideFunnelGateRedirect(params: DecideFunnelGateParams): string | null {
  const {
    route,
    isAuthenticated,
    isPlatformAdmin,
    isSuperAdmin,
    membership,
    hasFunnelPlanParam,
    plan,
    cycle,
  } = params;
  const planQuery = buildPlanQuery(plan, cycle);

  if (!isAuthenticated) {
    return `/login?next=${encodeURIComponent(`/${route}${planQuery}`)}`;
  }

  if (isSuperAdmin) {
    return null;
  }

  if (isPlatformAdmin) {
    if (membership?.isOnboarded) {
      return route === 'app' ? null : '/app';
    }
    return route === 'onboarding' ? null : '/onboarding';
  }

  if (route === 'app') {
    if (!membership?.isOnboarded) return '/onboarding';
    return null;
  }

  if (route === 'onboarding') {
    if (!membership?.isOnboarded) return null;
    if (membership.billingStatus === 'PAST_DUE') {
      return `/activate-plan${planQuery}`;
    }
    return '/app';
  }

  // route === 'activate-plan'
  if (
    hasFunnelPlanParam &&
    membership &&
    (membership.billingStatus === 'ACTIVE' || membership.billingStatus === 'TRIALING')
  ) {
    return '/app';
  }

  return null;
}

export async function resolveCloudFunnelGateRedirect(params: {
  route: FunnelGateRoute;
  hasFunnelPlanParam: boolean;
  plan?: string | null;
  cycle?: string | null;
}): Promise<string | null> {
  if (!isCloudModeEnabled()) {
    return null;
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return decideFunnelGateRedirect({
      route: params.route,
      isAuthenticated: false,
      isPlatformAdmin: false,
      membership: null,
      hasFunnelPlanParam: params.hasFunnelPlanParam,
      plan: params.plan,
      cycle: params.cycle,
    });
  }

  const [adminAuth, membershipRow] = await Promise.all([
    resolvePlatformAdminContext('admin:read'),
    prisma.membership.findFirst({
      where: { userId: user.id },
      select: {
        tenantId: true,
        tenant: { select: { isOnboarded: true, billingStatus: true } },
      },
    }),
  ]);

  const membership: FunnelMembershipSnapshot | null = membershipRow?.tenant
    ? {
        tenantId: membershipRow.tenantId,
        isOnboarded: membershipRow.tenant.isOnboarded,
        billingStatus: membershipRow.tenant.billingStatus,
      }
    : null;

  return decideFunnelGateRedirect({
    route: params.route,
    isAuthenticated: true,
    isPlatformAdmin: adminAuth.ok,
    isSuperAdmin: adminAuth.ok && adminAuth.context.role === 'super_admin',
    membership,
    hasFunnelPlanParam: params.hasFunnelPlanParam,
    plan: params.plan,
    cycle: params.cycle,
  });
}

function buildPlanQuerySuffix(nextPath: string): string {
  const qIdx = nextPath.indexOf('?');
  if (qIdx < 0) return '';
  const params = new URLSearchParams(nextPath.slice(qIdx + 1));
  const plan = params.get('plan');
  const cycle = params.get('cycle');
  if (!plan) return '';
  return cycle ? `?plan=${encodeURIComponent(plan)}&cycle=${encodeURIComponent(cycle)}` : `?plan=${encodeURIComponent(plan)}`;
}

export async function resolvePostAuthCallbackRedirect(params: {
  userId: string;
  nextPath: string;
}): Promise<string> {
  const [adminAuth, membershipRow] = await Promise.all([
    resolvePlatformAdminContext('admin:read'),
    prisma.membership.findFirst({
      where: { userId: params.userId },
      select: {
        tenantId: true,
        tenant: { select: { isOnboarded: true, billingStatus: true } },
      },
    }),
  ]);

  const membership = membershipRow?.tenant
    ? {
        tenantId: membershipRow.tenantId,
        isOnboarded: membershipRow.tenant.isOnboarded,
        billingStatus: membershipRow.tenant.billingStatus,
      }
    : null;

  const planQuery = buildPlanQuerySuffix(params.nextPath);
  if (adminAuth.ok) {
    if (adminAuth.context.role === 'super_admin') {
      return params.nextPath || '/app';
    }
    return membership?.isOnboarded ? (params.nextPath || '/app') : `/onboarding${planQuery}`;
  }

  if (!membership?.isOnboarded) {
    return `/onboarding${planQuery}`;
  }
  if (membership.billingStatus === 'PAST_DUE') {
    return `/activate-plan${planQuery}`;
  }
  return params.nextPath || '/app';
}
