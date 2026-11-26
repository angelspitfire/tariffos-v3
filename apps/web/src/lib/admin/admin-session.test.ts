import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn<() => Promise<{ id: string; email?: string } | null>>(),
  userProfileFindUnique: vi.fn<() => Promise<{ role?: string | null } | null>>(),
}));

vi.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    userProfile: { findUnique: mocks.userProfileFindUnique },
  },
}));

import { resolvePlatformAdminContext } from './admin-session';

describe('resolvePlatformAdminContext', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const originalAdminEmails = process.env.PLATFORM_ADMIN_EMAILS;

  afterEach(() => {
    vi.clearAllMocks();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    if (originalAdminEmails === undefined) delete process.env.PLATFORM_ADMIN_EMAILS;
    else process.env.PLATFORM_ADMIN_EMAILS = originalAdminEmails;
  });

  it('returns deterministic super_admin context in offline mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const res = await resolvePlatformAdminContext('plans:manage');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.context.role).toBe('super_admin');
    }
  });

  it('returns 401 in cloud mode when unauthenticated', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.getAuthenticatedUser.mockResolvedValue(null);

    const res = await resolvePlatformAdminContext('admin:read');
    expect(res).toEqual({ ok: false, status: 401, error: 'Authentication required' });
  });

  it('returns 403 for non-admin user profiles', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'u-1', email: 'client@agency.com' });
    mocks.userProfileFindUnique.mockResolvedValue({ role: 'user' });

    const res = await resolvePlatformAdminContext('admin:read');
    expect(res).toEqual({
      ok: false,
      status: 403,
      error: 'Platform administrator privileges required',
    });
  });

  it('enforces granular permissions per platform role', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'u-ops', email: 'ops@tariffos.app' });
    mocks.userProfileFindUnique.mockResolvedValue({ role: 'ops_billing' });

    const billingRes = await resolvePlatformAdminContext('billing:approve');
    expect(billingRes.ok).toBe(true);

    const planRes = await resolvePlatformAdminContext('plans:manage');
    expect(planRes).toEqual({
      ok: false,
      status: 403,
      error: 'Insufficient permissions for plans:manage',
    });
  });

  it('supports PLATFORM_ADMIN_EMAILS bootstrap for initial super_admin access', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.PLATFORM_ADMIN_EMAILS = 'founder@tariffos.app, ops@tariffos.app';
    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'u-founder', email: 'founder@tariffos.app' });
    mocks.userProfileFindUnique.mockResolvedValue({ role: 'user' });

    const res = await resolvePlatformAdminContext('plans:manage');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.context.role).toBe('super_admin');
    }
  });
});
