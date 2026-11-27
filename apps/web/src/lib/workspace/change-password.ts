import { evaluatePasswordPolicy } from '@/lib/funnel/password-policy';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export interface PasswordChangeResult {
  ok: boolean;
  message?: string;
  error?: string;
}

/** Validates policy & confirmation, then updates the authenticated Supabase user's password. */
export async function executePasswordChange(params: {
  newPassword: string;
  confirmPassword: string;
  isCloud?: boolean;
}): Promise<PasswordChangeResult> {
  const policy = evaluatePasswordPolicy(params.newPassword);
  if (!policy.isValid) {
    return {
      ok: false,
      error: policy.errorMessage ?? 'La contraseña no cumple con la política de seguridad.',
    };
  }
  if (params.newPassword !== params.confirmPassword) {
    return { ok: false, error: 'Las contraseñas no coinciden.' };
  }

  const cloud = params.isCloud ?? isCloudModeEnabled();
  if (!cloud) {
    return {
      ok: true,
      message: 'Modo local activo: la contraseña solo aplica en sesiones cloud con Supabase.',
    };
  }

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.updateUser({
    password: params.newPassword,
    data: { must_change_password: false },
  });
  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, message: 'Contraseña actualizada correctamente.' };
}

/** Checks whether the signed-in user was provisioned with a temporary password. */
export async function checkMustChangePassword(isCloud?: boolean): Promise<boolean> {
  const cloud = isCloud ?? isCloudModeEnabled();
  if (!cloud) return false;
  try {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    return Boolean(data?.user?.user_metadata?.must_change_password);
  } catch {
    return false;
  }
}
