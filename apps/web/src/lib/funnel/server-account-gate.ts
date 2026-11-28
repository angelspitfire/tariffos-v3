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
  allowPreview?: boolean;
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

function normalizeOnboardedNextPath(nextPath: string): string {
  const trimmed = nextPath.trim();
  if (!trimmed || trimmed === '/') return '/app';
  if (trimmed === '/onboarding' || trimmed.startsWith('/onboarding?') || trimmed.startsWith('/onboarding/')) return '/app';
  if (trimmed.startsWith('/activate-plan?')) return '/app';
  return trimmed;
}

async function findMembershipSnapshot(userId: string, userEmail?: string | null): Promise<FunnelMembershipSnapshot | null> {
  const select = { tenantId: true, tenant: { select: { isOnboarded: true, billingStatus: true } } } as const;
  let row = await prisma.membership.findFirst({ where: { userId }, select });
  const normalizedEmail = userEmail?.trim().toLowerCase();
  if (!row && normalizedEmail) {
    row = await prisma.membership.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      select,
    });
  }
  return row?.tenant
    ? { tenantId: row.tenantId, isOnboarded: row.tenant.isOnboarded, billingStatus: row.tenant.billingStatus }
    : null;
}

export function decideFunnelGateRedirect(params: DecideFunnelGateParams): string | null {
  const { route, isAuthenticated, isPlatformAdmin, isSuperAdmin, allowPreview, membership, hasFunnelPlanParam, plan, cycle } = params;
  const planQuery = buildPlanQuery(plan, cycle);

  if (!isAuthenticated) return `/login?next=${encodeURIComponent(`/${route}${planQuery}`)}`;

  if (isSuperAdmin) {
    if (route === 'app') return null;
    if (route === 'onboarding') return allowPreview ? null : '/app';
    return hasFunnelPlanParam && !allowPreview ? '/app' : null;
  }

  if (isPlatformAdmin) {
    if (membership?.isOnboarded) return route === 'app' ? null : '/app';
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

  if (
    hasFunnelPlanParam &&
    membership?.isOnboarded &&
    (membership.billingStatus === 'ACTIVE' || membership.billingStatus === 'TRIALING')
  ) {
    return '/app';
  }

  return null;
}

export async function resolveCloudFunnelGateRedirect(params: {
  route: FunnelGateRoute;
  hasFunnelPlanParam: boolean;
  allowPreview?: boolean;
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

  const [adminAuth, membership] = await Promise.all([
    resolvePlatformAdminContext('admin:read', {
      authenticatedUser: { id: user.id, email: user.email ?? null },
    }),
    findMembershipSnapshot(user.id, user.email),
  ]);

  return decideFunnelGateRedirect({
    route: params.route,
    isAuthenticated: true,
    isPlatformAdmin: adminAuth.ok,
    isSuperAdmin: adminAuth.ok && adminAuth.context.role === 'super_admin',
    allowPreview: params.allowPreview,
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
  userEmail?: string | null;
  nextPath: string;
}): Promise<string> {
  const [adminAuth, membership] = await Promise.all([
    resolvePlatformAdminContext('admin:read', {
      authenticatedUser: { id: params.userId, email: params.userEmail ?? null },
    }),
    findMembershipSnapshot(params.userId, params.userEmail),
  ]);

  const planQuery = buildPlanQuerySuffix(params.nextPath);
  const readyTarget = normalizeOnboardedNextPath(params.nextPath);
  if (adminAuth.ok) {
    if (adminAuth.context.role === 'super_admin') {
      return readyTarget;
    }
    return membership?.isOnboarded ? readyTarget : `/onboarding${planQuery}`;
  }

  if (!membership?.isOnboarded) {
    return `/onboarding${planQuery}`;
  }
  if (membership.billingStatus === 'PAST_DUE') {
    return `/activate-plan${planQuery}`;
  }
  return readyTarget;
}
