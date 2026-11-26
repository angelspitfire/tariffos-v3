import type { SubscriptionBillingCycle } from '@tariffos/shared-types';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  readMockProfile,
  readSelectedPlan,
  saveFunnelSession,
} from './funnel-storage';

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
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(params.destination)}`;
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

export async function executeEmailAuth(params: {
  isCloud: boolean;
  tab: AuthTab;
  email: string;
  password: string;
  fullName: string;
}): Promise<{ error: string | null }> {
  const cleanEmail = params.email.trim();
  if (params.isCloud) {
    const supabase = createSupabaseBrowserClient();
    if (params.tab === 'signup') {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: { data: { full_name: params.fullName.trim() } },
      });
      return { error: error ? error.message : null };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: params.password,
    });
    return { error: error ? error.message : null };
  }

  saveFunnelSession({
    userId: `local-${cleanEmail}`,
    email: cleanEmail,
    fullName: params.fullName.trim() || cleanEmail.split('@')[0] || 'Operador',
    provider: 'email',
  });
  return { error: null };
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
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) return { error: error.message, info: null };
  }
  return {
    error: null,
    info: 'Enviamos instrucciones de recuperación a tu correo.',
  };
}
