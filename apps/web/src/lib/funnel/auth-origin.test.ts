import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildAuthCallbackUrl,
  isLoopbackOrigin,
  resolveBrowserAuthOrigin,
  resolveServerAuthOrigin,
} from './auth-origin';

describe('auth-origin', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('identifies loopback origins accurately', () => {
    expect(isLoopbackOrigin('http://localhost:3000')).toBe(true);
    expect(isLoopbackOrigin('http://127.0.0.1:3000')).toBe(true);
    expect(isLoopbackOrigin('http://[::1]:3000')).toBe(true);
    expect(isLoopbackOrigin('https://tariffos.app')).toBe(false);
  });

  it('preserves non-loopback browser origin even if NEXT_PUBLIC_SITE_URL was misconfigured to localhost', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
    expect(resolveBrowserAuthOrigin('https://tariffos.app')).toBe('https://tariffos.app');
  });

  it('uses configured NEXT_PUBLIC_SITE_URL when browser origin is loopback or unavailable', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://tariffos.app/');
    expect(resolveBrowserAuthOrigin('http://localhost:3000')).toBe('https://tariffos.app');
    expect(resolveBrowserAuthOrigin(undefined)).toBe('https://tariffos.app');
  });

  it('normalizes bare Vercel hostnames to https when NEXT_PUBLIC_SITE_URL is unset', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', 'tariffos-v3-preview.vercel.app');
    expect(resolveBrowserAuthOrigin(undefined)).toBe('https://tariffos-v3-preview.vercel.app');
  });

  it('resolves server request origin from x-forwarded-host when request.url is internal localhost', () => {
    const req = new Request('http://localhost:3000/auth/callback?code=abc', {
      headers: {
        'x-forwarded-host': 'tariffos.app',
        'x-forwarded-proto': 'https',
      },
    });
    expect(resolveServerAuthOrigin(req)).toBe('https://tariffos.app');
  });

  it('falls back to NEXT_PUBLIC_SITE_URL on server when request.url is localhost without forwarded headers', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://tariffos.app');
    const req = new Request('http://localhost:3000/api/admin/tenants/onboard');
    expect(resolveServerAuthOrigin(req)).toBe('https://tariffos.app');
  });

  it('builds safe /auth/callback URLs and blocks protocol-relative open redirects', () => {
    expect(buildAuthCallbackUrl('https://tariffos.app', '/onboarding?plan=pilot&cycle=monthly')).toBe(
      'https://tariffos.app/auth/callback?next=%2Fonboarding%3Fplan%3Dpilot%26cycle%3Dmonthly',
    );
    expect(buildAuthCallbackUrl('https://tariffos.app', '//evil.example')).toBe(
      'https://tariffos.app/auth/callback?next=%2Fapp',
    );
  });

  it('keeps local loopback origin in development even if NEXT_PUBLIC_SITE_URL points to production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://tariffos.app');

    expect(resolveBrowserAuthOrigin('http://localhost:3003')).toBe('http://localhost:3003');
    const req = new Request('http://localhost:3003/auth/callback?code=abc');
    expect(resolveServerAuthOrigin(req)).toBe('http://localhost:3003');
  });
});
