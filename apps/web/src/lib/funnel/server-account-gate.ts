import { prisma } from '@tariffos/database';
import type { TenantBillingStatus } from '@tariffos/shared-types';
import { resolvePlatformAdminContext } from '@/lib/admin/admin-session';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export type FunnelGateRoute = 'onboarding' | 'activate-plan';

export interface FunnelMembershipSnapshot {
  tenantId: string;
  isOnboarded: boolean;
  billingStatus: TenantBillingStatus;
}

export interface DecideFunnelGateParams {
  route: FunnelGateRoute;
  isAuthenticated: boolean;
  isPlatformAdmin: boolean;
  membership: FunnelMembershipSnapshot | null;
  hasFunnelPlanParam: boolean;
}

export function decideFunnelGateRedirect(params: DecideFunnelGateParams): string | null {
  const { route, isAuthenticated, isPlatformAdmin, membership, hasFunnelPlanParam } = params;

  if (!isAuthenticated) {
    return `/login?next=${encodeURIComponent(`/${route}`)}`;
  }

  if (isPlatformAdmin) {
    if (membership) {
      return '/app';
    }
    return route === 'activate-plan' ? '/onboarding' : null;
  }

  if (route === 'onboarding') {
    if (!membership?.isOnboarded) return null;
    if (membership.billingStatus === 'PAST_DUE') {
      return '/activate-plan';
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
    membership,
    hasFunnelPlanParam: params.hasFunnelPlanParam,
  });
}
