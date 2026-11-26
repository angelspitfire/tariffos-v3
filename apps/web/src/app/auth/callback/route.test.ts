import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const mockExchangeCodeForSession = vi.fn();
const mockVerifyOtp = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
      verifyOtp: mockVerifyOtp,
    },
  }),
}));

describe('GET /auth/callback', () => {
  beforeEach(() => {
    mockExchangeCodeForSession.mockReset();
    mockVerifyOtp.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exchanges PKCE code and redirects to public x-forwarded-host instead of internal localhost', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ data: {}, error: null });

    const req = new Request(
      'http://localhost:3000/auth/callback?code=pkce-123&next=%2Fonboarding%3Fplan%3Dpilot',
      {
        headers: {
          'x-forwarded-host': 'tariffos.app',
          'x-forwarded-proto': 'https',
        },
      },
    );

    const res = await GET(req);
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('pkce-123');
    expect(res.headers.get('location')).toBe('https://tariffos.app/onboarding?plan=pilot');
  });

  it('verifies token_hash + type=signup for email confirmation templates and redirects to public origin', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://tariffos.app');
    mockVerifyOtp.mockResolvedValue({ data: {}, error: null });

    const req = new Request(
      'http://localhost:3000/auth/callback?token_hash=th_abc&type=signup&next=%2Fonboarding',
    );

    const res = await GET(req);
    expect(mockVerifyOtp).toHaveBeenCalledWith({
      token_hash: 'th_abc',
      type: 'signup',
    });
    expect(res.headers.get('location')).toBe('https://tariffos.app/onboarding');
  });
});
