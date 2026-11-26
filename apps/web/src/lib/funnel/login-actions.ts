import type { SubscriptionBillingCycle } from '@tariffos/shared-types';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  buildAuthCallbackUrl,
  resolveBrowserAuthOrigin,
  sanitizeNextPath,
} from './auth-origin';
import {
  readMockProfile,
  readSelectedPlan,
  saveFunnelSession,
} from './funnel-storage';
import { validateSignupCredentials } from './password-policy';

export type AuthTab = 'signin' | 'signup';

export function resolveSafeNext(raw: string | null): string | null {
  if (!raw) return null;
  return raw.startsWith('/') && !raw.startsWith('//') ? raw : null;
}

export function parseBillingCycle(raw: string | null): SubscriptionBillingCycle {
  return raw === 'annual' ? 'annual' : 'monthly';
}

export function resolvePostLoginDestination(params: {
  urlNext: string | null;
  urlPlan: string | null;
  urlCycle: SubscriptionBillingCycle;
  isNewUser: boolean;
}): string {
  if (params.urlNext) return params.urlNext;
  const storedPlan = params.urlPlan
    ? { planId: params.urlPlan, billingCycle: params.urlCycle }
    : readSelectedPlan();

  if (params.isNewUser || !readMockProfile()?.onboardingCompleted) {
    if (storedPlan) {
      return `/onboarding?plan=${encodeURIComponent(storedPlan.planId)}&cycle=${storedPlan.billingCycle}`;
    }
    return '/onboarding';
  }
  return '/app';
}

export async function executeGoogleAuth(params: {
  isCloud: boolean;
  destination: string;
}): Promise<{ error: string | null; shouldNavigate: boolean }> {
  if (params.isCloud) {
    const supabase = createSupabaseBrowserClient();
    const redirectTo = buildAuthCallbackUrl(resolveBrowserAuthOrigin(), params.destination);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    return { error: error ? error.message : null, shouldNavigate: false };
  }

  saveFunnelSession({
    userId: 'local-google-user',
    email: 'demo.google@tariffos.app',
    fullName: 'Agente Demo',
    provider: 'google',
  });
  return { error: null, shouldNavigate: true };
}

export interface EmailAuthResult {
  error: string | null;
  requiresEmailConfirmation?: boolean;
}

export async function executeEmailAuth(params: {
  isCloud: boolean;
  tab: AuthTab;
  email: string;
  password: string;
  fullName: string;
  destination?: string;
}): Promise<EmailAuthResult> {
  const cleanEmail = params.email.trim();
  if (params.tab === 'signup') {
    const validationError = validateSignupCredentials({
      fullName: params.fullName,
      email: cleanEmail,
      password: params.password,
    });
    if (validationError) {
      return { error: validationError, requiresEmailConfirmation: false };
    }
  }

  if (params.isCloud) {
    const supabase = createSupabaseBrowserClient();
    if (params.tab === 'signup') {
      const targetNext = sanitizeNextPath(params.destination, '/onboarding');
      const emailRedirectTo = buildAuthCallbackUrl(resolveBrowserAuthOrigin(), targetNext);
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          emailRedirectTo,
          data: { full_name: params.fullName.trim() },
        },
      });
      if (error) {
        return { error: error.message };
      }
      if (Array.isArray(data.user?.identities) && data.user.identities.length === 0) {
        return {
          error: 'Este correo ya está registrado. Inicia sesión o recupera tu contraseña.',
        };
      }
      return {
        error: null,
        requiresEmailConfirmation: !data.session,
      };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: params.password,
    });
    return { error: error ? error.message : null, requiresEmailConfirmation: false };
  }

  saveFunnelSession({
    userId: `local-${cleanEmail}`,
    email: cleanEmail,
    fullName: params.fullName.trim() || cleanEmail.split('@')[0] || 'Operador',
    provider: 'email',
  });
  return { error: null, requiresEmailConfirmation: false };
}

export async function executePasswordReset(params: {
  isCloud: boolean;
  email: string;
}): Promise<{ error: string | null; info: string | null }> {
  const cleanEmail = params.email.trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      error: 'Escribe tu correo primero para enviarte el enlace de recuperación.',
      info: null,
    };
  }
  if (params.isCloud) {
    const supabase = createSupabaseBrowserClient();
    const redirectTo = buildAuthCallbackUrl(resolveBrowserAuthOrigin(), '/login');
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });
    if (error) return { error: error.message, info: null };
  }
  return {
    error: null,
    info: 'Enviamos instrucciones de recuperación a tu correo.',
  };
}
