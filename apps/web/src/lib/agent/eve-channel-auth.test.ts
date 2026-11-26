import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetUser, mockCreateServerClient, mockCreateClient } = vi.hoisted(() => {
  const getUser = vi.fn();
  return {
    mockGetUser: getUser,
    mockCreateServerClient: vi.fn(() => ({
      auth: { getUser },
    })),
    mockCreateClient: vi.fn(() => ({
      auth: { getUser },
    })),
  };
});

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

import {
  createSupabaseChannelAuth,
  parseCookieHeader,
} from '../../../../../agent/lib/supabase-auth';

describe('parseCookieHeader', () => {
  it('parses Cookie header pairs and preserves values containing =', () => {
    expect(parseCookieHeader('sb-token=abc=123==; theme=dark; empty=')).toEqual([
      { name: 'sb-token', value: 'abc=123==' },
      { name: 'theme', value: 'dark' },
      { name: 'empty', value: '' },
    ]);
  });

  it('returns an empty array for null or blank cookie headers', () => {
    expect(parseCookieHeader(null)).toEqual([]);
    expect(parseCookieHeader('   ')).toEqual([]);
  });
});

describe('createSupabaseChannelAuth', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns null when Supabase env vars are missing without throwing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_URL;
    const auth = createSupabaseChannelAuth();
    const req = new Request('https://tariffos-v3.vercel.app/eve/v1/session', {
      headers: { cookie: 'sb-access-token=abc' },
    });

    await expect(auth(req)).resolves.toBeNull();
    expect(mockCreateServerClient).not.toHaveBeenCalled();
  });

  it('returns null when neither cookie nor bearer token is present', async () => {
    const auth = createSupabaseChannelAuth();
    const req = new Request('https://tariffos-v3.vercel.app/eve/v1/session');

    await expect(auth(req)).resolves.toBeNull();
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('authenticates via Supabase cookies and returns SessionAuthContext', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123', email: 'broker@tariffos.ve' } },
      error: null,
    });

    const auth = createSupabaseChannelAuth();
    const req = new Request('https://tariffos-v3.vercel.app/eve/v1/session', {
      headers: { cookie: 'sb-proj-auth-token=jwt-value; other=1' },
    });

    const result = await auth(req);
    expect(mockCreateServerClient).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      authenticator: 'supabase',
      principalId: 'user-123',
      principalType: 'user',
      attributes: { email: 'broker@tariffos.ve' },
    });
  });

  it('authenticates via Authorization Bearer token when cookies are absent', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-bearer-456', email: 'ops@tariffos.ve' } },
      error: null,
    });

    const auth = createSupabaseChannelAuth();
    const req = new Request('https://tariffos-v3.vercel.app/eve/v1/session', {
      headers: { authorization: 'Bearer my-supabase-jwt' },
    });

    const result = await auth(req);
    expect(mockCreateClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key-123', {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    expect(mockGetUser).toHaveBeenCalledWith('my-supabase-jwt');
    expect(result).toEqual({
      authenticator: 'supabase',
      principalId: 'user-bearer-456',
      principalType: 'user',
      attributes: { email: 'ops@tariffos.ve' },
    });
  });

  it('returns null when Supabase rejects or returns no user so walk falls through', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid JWT' },
    });

    const auth = createSupabaseChannelAuth();
    const req = new Request('https://tariffos-v3.vercel.app/eve/v1/session', {
      headers: { cookie: 'sb-proj-auth-token=stale' },
    });

    await expect(auth(req)).resolves.toBeNull();
  });
});
