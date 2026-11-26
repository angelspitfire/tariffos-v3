import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isCloudModeEnabled: vi.fn<() => boolean>(),
  getAuthenticatedUser: vi.fn(),
  resolvePlatformAdminContext: vi.fn(),
  membershipFindFirst: vi.fn(),
}));

vi.mock('@/lib/runtime-config', () => ({
  isCloudModeEnabled: mocks.isCloudModeEnabled,
}));

vi.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock('@/lib/admin/admin-session', () => ({
  resolvePlatformAdminContext: mocks.resolvePlatformAdminContext,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    membership: {
      findFirst: mocks.membershipFindFirst,
    },
  },
}));

import {
  decideFunnelGateRedirect,
  resolveCloudFunnelGateRedirect,
} from './server-account-gate';

describe('server-account-gate (payment & onboarding bypass)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isCloudModeEnabled.mockReturnValue(true);
  });

  it('never redirects when cloud mode is disabled', async () => {
    mocks.isCloudModeEnabled.mockReturnValue(false);
    const target = await resolveCloudFunnelGateRedirect({
      route: 'activate-plan',
      hasFunnelPlanParam: true,
    });
    expect(target).toBeNull();
  });

  it('redirects unauthenticated cloud requests to /login with next path', () => {
    expect(
      decideFunnelGateRedirect({
        route: 'activate-plan',
        isAuthenticated: false,
        isPlatformAdmin: false,
        membership: null,
        hasFunnelPlanParam: true,
      }),
    ).toBe('/login?next=%2Factivate-plan');
  });

  it('always skips /activate-plan for super_admin with a workspace and sends straight to /app', async () => {
    mocks.getAuthenticatedUser.mockResolvedValue({
      id: 'usr-admin',
      email: 'angel.alberto.fernandez@gmail.com',
    });
    mocks.resolvePlatformAdminContext.mockResolvedValue({
      ok: true,
      context: {
        userId: 'usr-admin',
        userEmail: 'angel.alberto.fernandez@gmail.com',
        role: 'super_admin',
      },
    });
    mocks.membershipFindFirst.mockResolvedValue({
      tenantId: 'ten-internal',
      tenant: { isOnboarded: true, billingStatus: 'ACTIVE' },
    });

    const fromActivatePlan = await resolveCloudFunnelGateRedirect({
      route: 'activate-plan',
      hasFunnelPlanParam: true,
    });
    expect(fromActivatePlan).toBe('/app');

    const fromManageLink = await resolveCloudFunnelGateRedirect({
      route: 'activate-plan',
      hasFunnelPlanParam: false,
    });
    expect(fromManageLink).toBe('/app');

    const fromOnboarding = await resolveCloudFunnelGateRedirect({
      route: 'onboarding',
      hasFunnelPlanParam: false,
    });
    expect(fromOnboarding).toBe('/app');
  });

  it('sends super_admin without a workspace yet from /activate-plan to /onboarding, not payment', () => {
    expect(
      decideFunnelGateRedirect({
        route: 'activate-plan',
        isAuthenticated: true,
        isPlatformAdmin: true,
        membership: null,
        hasFunnelPlanParam: true,
      }),
    ).toBe('/onboarding');
  });

  it('redirects already-onboarded ACTIVE customer from /onboarding and funnel /activate-plan?plan=... to /app, while allowing explicit /activate-plan management', () => {
    const activeMembership = {
      tenantId: 'ten-1',
      isOnboarded: true,
      billingStatus: 'ACTIVE' as const,
    };

    expect(
      decideFunnelGateRedirect({
        route: 'onboarding',
        isAuthenticated: true,
        isPlatformAdmin: false,
        membership: activeMembership,
        hasFunnelPlanParam: false,
      }),
    ).toBe('/app');

    expect(
      decideFunnelGateRedirect({
        route: 'activate-plan',
        isAuthenticated: true,
        isPlatformAdmin: false,
        membership: activeMembership,
        hasFunnelPlanParam: true,
      }),
    ).toBe('/app');

    expect(
      decideFunnelGateRedirect({
        route: 'activate-plan',
        isAuthenticated: true,
        isPlatformAdmin: false,
        membership: activeMembership,
        hasFunnelPlanParam: false,
      }),
    ).toBeNull();
  });

  it('redirects already-onboarded PAST_DUE customer from /onboarding to /activate-plan and keeps them on /activate-plan', () => {
    const pastDueMembership = {
      tenantId: 'ten-2',
      isOnboarded: true,
      billingStatus: 'PAST_DUE' as const,
    };

    expect(
      decideFunnelGateRedirect({
        route: 'onboarding',
        isAuthenticated: true,
        isPlatformAdmin: false,
        membership: pastDueMembership,
        hasFunnelPlanParam: false,
      }),
    ).toBe('/activate-plan');

    expect(
      decideFunnelGateRedirect({
        route: 'activate-plan',
        isAuthenticated: true,
        isPlatformAdmin: false,
        membership: pastDueMembership,
        hasFunnelPlanParam: true,
      }),
    ).toBeNull();
  });
});
