'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Globe, Lock, Mail, ShieldCheck, Sparkles, User } from 'lucide-react';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { readPendingQuery, saveSelectedPlan } from '@/lib/funnel/funnel-storage';
import {
  executeEmailAuth,
  executeGoogleAuth,
  executePasswordReset,
  parseBillingCycle,
  resolvePostLoginDestination,
  resolveSafeNext,
  type AuthTab,
} from '@/lib/funnel/login-actions';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelButton } from '../atoms/FunnelButton';
import { FunnelCard } from '../atoms/FunnelCard';
import { FunnelInput } from '../atoms/FunnelField';

export interface LoginCardProps {
  cloudMode?: boolean;
  initialMode?: AuthTab;
  nextPath?: string;
}

const AUTH_TABS = [
  { id: 'signin', label: 'Iniciar sesión' },
  { id: 'signup', label: 'Crear cuenta' },
] as const;

export function LoginCard({ cloudMode, initialMode = 'signin', nextPath }: LoginCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCloud = cloudMode ?? isCloudModeEnabled();

  const [tab, setTab] = useState<AuthTab>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const urlNext = resolveSafeNext(nextPath ?? searchParams.get('next'));
  const urlPlan = searchParams.get('plan');
  const urlCycle = parseBillingCycle(searchParams.get('cycle'));

  useEffect(() => {
    setPendingQuery(readPendingQuery());
    if (urlPlan) saveSelectedPlan(urlPlan, urlCycle);
  }, [urlPlan, urlCycle]);

  const destination = resolvePostLoginDestination({
    urlNext,
    urlPlan,
    urlCycle,
    isNewUser: tab === 'signup',
  });

  const handleGoogleSignIn = async () => {
    setError(null);
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
    if (!email.trim().includes('@') || password.length < 6) {
      setError('Ingresa un correo válido y una contraseña de al menos 6 caracteres.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const result = await executeEmailAuth({ isCloud, tab, email, password, fullName });
      if (result.error) setError(result.error);
      else router.push(destination);
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
            Tu consulta pendiente se abrirá automáticamente:{' '}
            <strong className="text-ink-primary">{pendingQuery}</strong>
          </span>
        </div>
      ) : null}

      <div
        role="tablist"
        aria-label="Modo de acceso"
        className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-subtle"
      >
        {AUTH_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => {
              setTab(item.id);
              setError(null);
            }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tab === item.id
                ? 'bg-surface-panel text-ink-primary shadow-xs'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <FunnelButton type="button" variant="outline" size="lg" className="w-full" isLoading={isLoading} leftIcon={<Globe className="w-4 h-4" />} onClick={handleGoogleSignIn}>
        Continuar con Google
      </FunnelButton>

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-border-subtle" />
        <span className="px-3 text-[11px] text-ink-muted">o con tu correo</span>
        <div className="flex-1 border-t border-border-subtle" />
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-3.5">
        {tab === 'signup' ? (
          <FunnelInput
            label="Nombre completo"
            placeholder="Ej. María González"
            leftIcon={<User className="w-4 h-4" />}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        ) : null}
        <FunnelInput
          label="Correo electrónico"
          type="email"
          placeholder="agente@tuagencia.com"
          leftIcon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FunnelInput
          label="Contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          leftIcon={<Lock className="w-4 h-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {tab === 'signin' ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handlePasswordReset}
              className="text-[11px] font-medium text-accent-ink hover:underline cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        ) : null}

        {error ? <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p> : null}
        {info ? <p className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/35 p-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">{info}</p> : null}

        <FunnelButton type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
          {tab === 'signin' ? 'Ingresar con correo' : 'Crear cuenta gratis'}
        </FunnelButton>
      </form>
    </FunnelCard>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-ink" aria-hidden="true" />
          Sesión segura y aislamiento por organización
        </span>
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-1 font-medium text-ink-secondary hover:text-ink-primary">
            <ArrowLeft className="w-3 h-3" aria-hidden="true" />
            Volver al inicio
          </Link>
          {!isCloud ? (
            <button
              type="button"
              onClick={() => router.push('/app')}
              className="font-medium text-ink-secondary hover:text-ink-primary underline cursor-pointer"
            >
              Probar sin cuenta
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
