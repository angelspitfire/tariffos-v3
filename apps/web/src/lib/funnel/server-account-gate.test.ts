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
  resolvePostAuthCallbackRedirect,
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

  it('redirects super_admin away from /onboarding and funnel /activate-plan?plan=... to /app unless preview mode is explicitly enabled', async () => {
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

    expect(
      await resolveCloudFunnelGateRedirect({
        route: 'activate-plan',
        hasFunnelPlanParam: true,
      }),
    ).toBe('/app');
    expect(
      await resolveCloudFunnelGateRedirect({
        route: 'activate-plan',
        hasFunnelPlanParam: true,
        allowPreview: true,
      }),
    ).toBeNull();
    expect(
      await resolveCloudFunnelGateRedirect({
        route: 'activate-plan',
        hasFunnelPlanParam: false,
      }),
    ).toBeNull();
    expect(
      await resolveCloudFunnelGateRedirect({
        route: 'onboarding',
        hasFunnelPlanParam: false,
      }),
    ).toBe('/app');
    expect(
      await resolveCloudFunnelGateRedirect({
        route: 'onboarding',
        hasFunnelPlanParam: false,
        allowPreview: true,
      }),
    ).toBeNull();
    expect(
      await resolveCloudFunnelGateRedirect({
        route: 'app',
        hasFunnelPlanParam: false,
      }),
    ).toBeNull();

    expect(
      decideFunnelGateRedirect({
        route: 'app',
        isAuthenticated: true,
        isPlatformAdmin: true,
        isSuperAdmin: true,
        membership: null,
        hasFunnelPlanParam: false,
      }),
    ).toBeNull();
  });

  it('keeps non-super_admin staff gated to /onboarding when missing workspace and to /app once onboarded', () => {
    expect(
      decideFunnelGateRedirect({
        route: 'activate-plan',
        isAuthenticated: true,
        isPlatformAdmin: true,
        isSuperAdmin: false,
        membership: null,
        hasFunnelPlanParam: true,
      }),
    ).toBe('/onboarding');

    expect(
      decideFunnelGateRedirect({
        route: 'app',
        isAuthenticated: true,
        isPlatformAdmin: true,
        isSuperAdmin: false,
        membership: null,
        hasFunnelPlanParam: false,
      }),
    ).toBe('/onboarding');

    expect(
      decideFunnelGateRedirect({
        route: 'onboarding',
        isAuthenticated: true,
        isPlatformAdmin: true,
        isSuperAdmin: false,
        membership: { tenantId: 'ten-staff', isOnboarded: true, billingStatus: 'ACTIVE' },
        hasFunnelPlanParam: false,
      }),
    ).toBe('/app');
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
        route: 'onboarding',
        isAuthenticated: true,
        isPlatformAdmin: false,
        membership: pastDueMembership,
        hasFunnelPlanParam: true,
        plan: 'agencia',
        cycle: 'annual',
      }),
    ).toBe('/activate-plan?plan=agencia&cycle=annual');

    expect(
      decideFunnelGateRedirect({
        route: 'onboarding',
        isAuthenticated: false,
        isPlatformAdmin: false,
        membership: null,
        hasFunnelPlanParam: true,
        plan: 'agencia',
        cycle: 'annual',
      }),
    ).toBe('/login?next=%2Fonboarding%3Fplan%3Dagencia%26cycle%3Dannual');

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

  it('guards /app for unauthenticated or un-onboarded Google/email users while allowing onboarded PAST_DUE read-only mode', () => {
    expect(
      decideFunnelGateRedirect({
        route: 'app',
        isAuthenticated: false,
        isPlatformAdmin: false,
        membership: null,
        hasFunnelPlanParam: false,
      }),
    ).toBe('/login?next=%2Fapp');

    expect(
      decideFunnelGateRedirect({
        route: 'app',
        isAuthenticated: true,
        isPlatformAdmin: false,
        membership: null,
        hasFunnelPlanParam: false,
      }),
    ).toBe('/onboarding');

    expect(
      decideFunnelGateRedirect({
        route: 'app',
        isAuthenticated: true,
        isPlatformAdmin: false,
        membership: { tenantId: 'ten-pd', isOnboarded: true, billingStatus: 'PAST_DUE' },
        hasFunnelPlanParam: false,
      }),
    ).toBeNull();
  });

  it('routes Google/OAuth callback to /onboarding for new users without membership and to /activate-plan for PAST_DUE users', async () => {
    mocks.resolvePlatformAdminContext.mockResolvedValue({ ok: false });
    mocks.membershipFindFirst.mockResolvedValueOnce(null);

    const newGoogleUserDest = await resolvePostAuthCallbackRedirect({
      userId: 'usr-google-new',
      nextPath: '/app',
    });
    expect(newGoogleUserDest).toBe('/onboarding');

    mocks.membershipFindFirst.mockResolvedValueOnce({
      tenantId: 'ten-pd',
      tenant: { isOnboarded: true, billingStatus: 'PAST_DUE' },
    });
    const pastDueDest = await resolvePostAuthCallbackRedirect({
      userId: 'usr-google-pd',
      nextPath: '/app',
    });
    expect(pastDueDest).toBe('/activate-plan');

    mocks.membershipFindFirst.mockResolvedValueOnce({
      tenantId: 'ten-ok',
      tenant: { isOnboarded: true, billingStatus: 'ACTIVE' },
    });
    const activeDest = await resolvePostAuthCallbackRedirect({
      userId: 'usr-google-ok',
      nextPath: '/app',
    });
    expect(activeDest).toBe('/app');

    mocks.resolvePlatformAdminContext.mockResolvedValueOnce({
      ok: true,
      context: { userId: 'usr-super', userEmail: 'erickampg25@gmail.com', role: 'super_admin' },
    });
    mocks.membershipFindFirst.mockResolvedValueOnce(null);
    expect(
      await resolvePostAuthCallbackRedirect({
        userId: 'usr-super',
        userEmail: 'erickampg25@gmail.com',
        nextPath: '/onboarding?plan=pilot&cycle=monthly',
      }),
    ).toBe('/app');
    expect(mocks.resolvePlatformAdminContext).toHaveBeenLastCalledWith('admin:read', {
      authenticatedUser: { id: 'usr-super', email: 'erickampg25@gmail.com' },
    });

    mocks.resolvePlatformAdminContext.mockResolvedValueOnce({
      ok: true,
      context: { userId: 'usr-super', userEmail: 'angel.alberto.fernandez@gmail.com', role: 'super_admin' },
    });
    mocks.membershipFindFirst.mockResolvedValueOnce({
      tenantId: 'ten-internal',
      tenant: { isOnboarded: true, billingStatus: 'ACTIVE' },
    });
    expect(
      await resolvePostAuthCallbackRedirect({
        userId: 'usr-super',
        userEmail: 'angel.alberto.fernandez@gmail.com',
        nextPath: '/admin/tenants',
      }),
    ).toBe('/admin/tenants');

    // Email-registered account signing in with Google under a new userId matches existing Membership by email
    mocks.resolvePlatformAdminContext.mockResolvedValueOnce({ ok: false });
    mocks.membershipFindFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        tenantId: 'ten-email',
        tenant: { isOnboarded: true, billingStatus: 'ACTIVE' },
      });
    expect(
      await resolvePostAuthCallbackRedirect({
        userId: 'usr-google-linked',
        userEmail: 'angel.alberto.fernandez@gmail.com',
        nextPath: '/onboarding?plan=pilot&cycle=monthly',
      }),
    ).toBe('/app');
  });
});
