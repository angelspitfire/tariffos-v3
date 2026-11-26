import { describe, expect, it } from 'vitest';
import {
  isProtectedPath,
  isPublicPath,
  resolveProxyAction,
} from './route-gate';

describe('Next.js 16 proxy route gate', () => {
  it('marks /app, /onboarding, /activate-plan, and /admin as protected', () => {
    expect(isProtectedPath('/app')).toBe(true);
    expect(isProtectedPath('/app/workspace')).toBe(true);
    expect(isProtectedPath('/onboarding')).toBe(true);
    expect(isProtectedPath('/activate-plan')).toBe(true);
    expect(isProtectedPath('/admin')).toBe(true);
    expect(isProtectedPath('/admin/billing')).toBe(true);
  });

  it('keeps /, /login, and /api/inngest public', () => {
    expect(isPublicPath('/')).toBe(true);
    expect(isPublicPath('/login')).toBe(true);
    expect(isPublicPath('/api/inngest')).toBe(true);
    expect(isProtectedPath('/')).toBe(false);
    expect(isProtectedPath('/login')).toBe(false);
    expect(isProtectedPath('/api/inngest')).toBe(false);
  });

  it('redirects unauthenticated requests on protected routes in cloud mode', () => {
    const action = resolveProxyAction({
      pathname: '/app',
      search: '?q=inversor',
      hasSession: false,
      cloudMode: true,
    });
    expect(action).toEqual({
      kind: 'redirect',
      destination: '/login?next=%2Fapp%3Fq%3Dinversor',
    });
  });

  it('allows protected routes when authenticated or in offline mock mode', () => {
    expect(
      resolveProxyAction({
        pathname: '/app',
        search: '',
        hasSession: true,
        cloudMode: true,
      }),
    ).toEqual({ kind: 'allow' });

    expect(
      resolveProxyAction({
        pathname: '/app',
        search: '',
        hasSession: false,
        cloudMode: false,
      }),
    ).toEqual({ kind: 'allow' });
  });
});
