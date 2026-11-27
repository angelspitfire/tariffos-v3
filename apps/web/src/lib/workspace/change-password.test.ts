import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  updateUser: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  getUser: vi.fn<() => Promise<unknown>>(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      updateUser: mocks.updateUser,
      getUser: mocks.getUser,
    },
  }),
}));

import { checkMustChangePassword, executePasswordChange } from './change-password';

describe('change-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects weak passwords using the shared password policy', async () => {
    const res = await executePasswordChange({
      newPassword: 'weak',
      confirmPassword: 'weak',
      isCloud: true,
    });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/política de seguridad/i);
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it('rejects mismatched password confirmation', async () => {
    const res = await executePasswordChange({
      newPassword: 'Segura!2026',
      confirmPassword: 'Otra!2026',
      isCloud: true,
    });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/no coinciden/i);
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it('calls supabase.auth.updateUser in cloud mode and clears must_change_password', async () => {
    mocks.updateUser.mockResolvedValue({ error: null });

    const res = await executePasswordChange({
      newPassword: 'Segura!2026',
      confirmPassword: 'Segura!2026',
      isCloud: true,
    });

    expect(res.ok).toBe(true);
    expect(mocks.updateUser).toHaveBeenCalledWith({
      password: 'Segura!2026',
      data: { must_change_password: false },
    });
  });

  it('surfaces Supabase updateUser errors cleanly and handles offline mode', async () => {
    mocks.updateUser.mockResolvedValue({ error: { message: 'Same password' } });
    const failed = await executePasswordChange({
      newPassword: 'Segura!2026',
      confirmPassword: 'Segura!2026',
      isCloud: true,
    });
    expect(failed.ok).toBe(false);
    expect(failed.error).toBe('Same password');

    const offline = await executePasswordChange({
      newPassword: 'Segura!2026',
      confirmPassword: 'Segura!2026',
      isCloud: false,
    });
    expect(offline.ok).toBe(true);
    expect(offline.message).toMatch(/local/i);
  });

  it('reads must_change_password flag from Supabase user metadata in cloud mode', async () => {
    expect(await checkMustChangePassword(false)).toBe(false);
    mocks.getUser.mockResolvedValue({
      data: { user: { user_metadata: { must_change_password: true } } },
    });
    expect(await checkMustChangePassword(true)).toBe(true);
  });
});
