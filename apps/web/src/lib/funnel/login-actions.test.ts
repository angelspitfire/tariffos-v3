import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { executeEmailAuth, executePasswordReset } from './login-actions';

const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockResetPasswordForEmail = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

describe('login-actions cloud redirects', () => {
  beforeEach(() => {
    mockSignUp.mockReset();
    mockSignInWithPassword.mockReset();
    mockResetPasswordForEmail.mockReset();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://tariffos.app');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('passes non-localhost emailRedirectTo to supabase.auth.signUp and flags pending email confirmation', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: 'usr-1', identities: [{ id: 'id-1' }] },
        session: null,
      },
      error: null,
    });

    const result = await executeEmailAuth({
      isCloud: true,
      tab: 'signup',
      email: 'agente@agencia.ve',
      password: 'ClaveSegura!2026',
      fullName: 'María González',
      destination: '/onboarding?plan=pilot&cycle=monthly',
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'agente@agencia.ve',
      password: 'ClaveSegura!2026',
      options: {
        emailRedirectTo:
          'https://tariffos.app/auth/callback?next=%2Fonboarding%3Fplan%3Dpilot%26cycle%3Dmonthly',
        data: { full_name: 'María González' },
      },
    });
    expect(result).toEqual({
      error: null,
      requiresEmailConfirmation: true,
    });
  });

  it('returns error when Supabase returns an obfuscated duplicate user on signup (empty identities)', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: 'usr-existing', identities: [] },
        session: null,
      },
      error: null,
    });

    const result = await executeEmailAuth({
      isCloud: true,
      tab: 'signup',
      email: 'existente@agencia.ve',
      password: 'ClaveSegura!2026',
      fullName: 'María González',
      destination: '/onboarding',
    });

    expect(result.error).toMatch(/ya está registrado/i);
  });

  it('sends password reset redirect through public origin callback instead of localhost', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    const result = await executePasswordReset({
      isCloud: true,
      email: 'agente@agencia.ve',
    });

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith('agente@agencia.ve', {
      redirectTo: 'https://tariffos.app/auth/callback?next=%2Flogin',
    });
    expect(result.error).toBeNull();
  });
});
