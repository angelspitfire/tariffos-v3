'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Globe, Sparkles } from 'lucide-react';
import { isCloudModeEnabled, isGoogleOAuthEnabled } from '@/lib/runtime-config';
import { readPendingQuery, saveSelectedPlan } from '@/lib/funnel/funnel-storage';
import {
  executeEmailAuth, executeGoogleAuth, executePasswordReset,
  parseBillingCycle, resolvePostLoginDestination, resolveSafeNext,
  type AuthTab,
} from '@/lib/funnel/login-actions';
import { validateSignupCredentials } from '@/lib/funnel/password-policy';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelButton } from '../atoms/FunnelButton';
import { FunnelCard } from '../atoms/FunnelCard';
import { LoginCardFooter } from '../molecules/LoginCardFooter';
import { LoginEmailForm } from '../molecules/LoginEmailForm';

export interface LoginCardProps {
  cloudMode?: boolean;
  googleOAuthEnabled?: boolean;
  initialMode?: AuthTab;
  nextPath?: string;
}

const AUTH_TABS = [
  { id: 'signin', label: 'Iniciar sesión' },
  { id: 'signup', label: 'Crear cuenta' },
] as const;

export function LoginCard({ cloudMode, googleOAuthEnabled, initialMode = 'signin', nextPath }: LoginCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCloud = cloudMode ?? isCloudModeEnabled();
  const showGoogleAuth = googleOAuthEnabled ?? isGoogleOAuthEnabled(isCloud);

  const [tab, setTab] = useState<AuthTab>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const urlNext = resolveSafeNext(nextPath ?? searchParams.get('next'));
  const urlPlan = searchParams.get('plan');
  const urlCycle = parseBillingCycle(searchParams.get('cycle'));
  const callbackError = searchParams.get('error');

  useEffect(() => {
    setPendingQuery(readPendingQuery());
    if (urlPlan) saveSelectedPlan(urlPlan, urlCycle);
    if (callbackError === 'auth_callback_failed') {
      setError('El enlace de verificación expiró o no es válido. Solicita uno nuevo o inicia sesión.');
    }
  }, [urlPlan, urlCycle, callbackError]);

  const destination = resolvePostLoginDestination({
    urlNext, urlPlan, urlCycle, isNewUser: tab === 'signup',
  });

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfo(null);
    setIsLoading(true);
    try {
      const result = await executeGoogleAuth({ isCloud, destination });
      if (result.error) setError(result.error);
      else if (result.shouldNavigate) router.push(destination);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setInfo(null);

    if (tab === 'signup') {
      const signupError = validateSignupCredentials({ fullName, email, password, confirmPassword });
      if (signupError) return setError(signupError);
    } else if (!email.trim().includes('@') || password.length === 0) {
      return setError('Ingresa tu correo electrónico y tu contraseña.');
    }

    setError(null);
    setIsLoading(true);
    try {
      const result = await executeEmailAuth({ isCloud, tab, email, password, fullName, destination });
      if (result.error) {
        setError(result.error);
      } else if (result.requiresEmailConfirmation) {
        setPassword('');
        setConfirmPassword('');
        setInfo(
          `Te enviamos un enlace de confirmación a ${email.trim()}. Confirma tu correo para activar tu cuenta y continuar.`,
        );
      } else {
        router.push(destination);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setInfo(null);
    setIsLoading(true);
    try {
      const result = await executePasswordReset({ isCloud, email });
      if (result.error) setError(result.error);
      if (result.info) setInfo(result.info);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FunnelCard padding="p-6" className="space-y-5 shadow-xs">
        <div className="space-y-1.5">
          <FunnelBadge variant="accent">
            {isCloud ? 'Acceso seguro · Supabase Auth' : 'Acceso rápido · Modo local'}
          </FunnelBadge>
          <h1 className="text-xl font-bold tracking-tight text-ink-primary">
            {tab === 'signin' ? 'Inicia sesión en TariffOS' : 'Crea tu cuenta en TariffOS'}
          </h1>
          <p className="text-xs text-ink-muted">
            Accede a tu estación arancelaria, expedientes y dictámenes técnicos RGI.
          </p>
        </div>

        {pendingQuery ? (
          <div className="p-3 rounded-xl border border-accent-border bg-accent-soft/50 text-xs text-ink-secondary flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-accent-ink shrink-0 mt-0.5" />
            <span>
              Tu consulta pendiente se abrirá automáticamente: <strong className="text-ink-primary">{pendingQuery}</strong>
            </span>
          </div>
        ) : null}

        <div role="tablist" aria-label="Modo de acceso" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-subtle">
          {AUTH_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => { setTab(item.id); setError(null); setInfo(null); }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                tab === item.id ? 'bg-surface-panel text-ink-primary shadow-xs' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {showGoogleAuth ? (
          <>
            <FunnelButton type="button" variant="outline" size="lg" className="w-full" isLoading={isLoading} leftIcon={<Globe className="w-4 h-4" />} onClick={handleGoogleSignIn}>
              Continuar con Google
            </FunnelButton>
            <div className="relative flex items-center">
              <div className="flex-1 border-t border-border-subtle" />
              <span className="px-3 text-[11px] text-ink-muted">o con tu correo</span>
              <div className="flex-1 border-t border-border-subtle" />
            </div>
          </>
        ) : null}

        <LoginEmailForm
          tab={tab}
          fullName={fullName}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          isLoading={isLoading}
          error={error}
          info={info}
          onFullNameChange={setFullName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleEmailSubmit}
          onPasswordReset={handlePasswordReset}
        />
      </FunnelCard>

      <LoginCardFooter isCloud={isCloud} onLocalTrial={() => router.push('/app')} />
    </div>
  );
}
