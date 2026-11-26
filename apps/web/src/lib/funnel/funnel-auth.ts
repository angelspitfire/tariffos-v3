import { isCloudModeEnabled } from '@/lib/runtime-config';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { saveMockSession } from './funnel-storage';

export async function authenticateWithEmail(params: {
  mode: 'signin' | 'signup';
  email: string;
  password: string;
  fullName: string;
  cloudMode?: boolean;
}): Promise<void> {
  const resolvedCloud = params.cloudMode ?? isCloudModeEnabled();
  if (resolvedCloud) {
    const supabase = createSupabaseBrowserClient();
    const result =
      params.mode === 'signup'
        ? await supabase.auth.signUp({
            email: params.email,
            password: params.password,
            options: { data: { full_name: params.fullName } },
          })
        : await supabase.auth.signInWithPassword({
            email: params.email,
            password: params.password,
          });
    if (result.error) throw result.error;
    return;
  }

  saveMockSession({
    userId: `local-${Date.now()}`,
    email: params.email,
    fullName: params.fullName || params.email.split('@')[0] || 'Operador',
    provider: 'email',
  });
}

export async function authenticateWithGoogle(params: {
  destination: string;
  cloudMode?: boolean;
}): Promise<boolean> {
  const resolvedCloud = params.cloudMode ?? isCloudModeEnabled();
  if (resolvedCloud) {
    const supabase = createSupabaseBrowserClient();
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}${params.destination}`
        : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) throw error;
    return true;
  }

  saveMockSession({
    userId: `google-local-${Date.now()}`,
    email: 'operador.google@tariffos.local',
    fullName: 'Operador Demo',
    provider: 'google',
  });
  return false;
}
