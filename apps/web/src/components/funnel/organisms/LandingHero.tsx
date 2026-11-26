'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, FileDown } from 'lucide-react';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { readMockSession, savePendingQuery } from '@/lib/funnel/funnel-storage';
import { LandingHeroPreview } from '../molecules/LandingHeroPreview';
import { LandingLoopHero } from './LandingLoopHero';

export interface LandingHeroProps {
  hasSession?: boolean;
  requiresAuth?: boolean;
}

export function LandingHero({ hasSession, requiresAuth }: LandingHeroProps) {
  const router = useRouter();
  const [heroPrompt, setHeroPrompt] = useState('');
  const [hasClientSession, setHasClientSession] = useState(false);

  useEffect(() => {
    setHasClientSession(Boolean(readMockSession()));
  }, []);

  const isAuthenticated =
    requiresAuth !== undefined ? !requiresAuth : Boolean(hasSession ?? hasClientSession);

  const navigateTarget = (trimmed?: string) => {
    if (trimmed) {
      savePendingQuery(trimmed);
    }

    const needsAuth =
      requiresAuth !== undefined
        ? requiresAuth
        : isCloudModeEnabled() && !(hasSession ?? Boolean(readMockSession()));

    if (needsAuth) {
      router.push(`/login?next=${encodeURIComponent('/app')}`);
      return;
    }
    router.push('/app');
  };

  const handleHeroSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = heroPrompt.trim();
    navigateTarget(trimmed || undefined);
  };

  const handlePrimaryCta = () => {
    if (isAuthenticated) {
      navigateTarget();
      return;
    }
    router.push('/onboarding?plan=trial&cycle=monthly');
  };

  return (
    <>
      <section className="pt-10 sm:pt-14 pb-12 sm:pb-20 overflow-x-clip">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 text-center space-y-6">
          <p className="font-mono text-xs tracking-[0.12em] text-ink-secondary uppercase">
            CLASIFICACIÓN ARANCELARIA PARA AGENCIAS DE ADUANAS · VENEZUELA
          </p>

          <h1 className="text-[clamp(2.4rem,4.8vw+0.8rem,4.35rem)] font-medium tracking-[-0.035em] text-ink-primary leading-[1.04] max-w-[20ch] mx-auto [text-wrap:balance]">
            Clasificación arancelaria auditable con respaldo RGI
          </h1>

          <div className="pt-2 flex flex-col items-center justify-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="group relative inline-flex items-center gap-2.5 px-7 min-h-[52px] rounded-full text-sm font-semibold text-ink-primary dark:text-white bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(219,234,254,0.95)_48%,rgba(186,230,253,0.92)_100%)] dark:bg-[linear-gradient(135deg,rgba(37,99,235,0.92)_0%,rgba(29,78,216,0.95)_55%,rgba(14,165,233,0.88)_100%)] border border-white/80 dark:border-sky-300/30 shadow-[0_12px_32px_-8px_rgba(29,78,216,0.35)] hover:shadow-[0_16px_36px_-6px_rgba(29,78,216,0.45)] transition-shadow cursor-pointer active:translate-y-px"
              >
                <span>{isAuthenticated ? 'Ir al workspace' : 'Empezar prueba gratis'}</span>
                <ArrowRight
                  className="w-4 h-4 text-accent-brand dark:text-white transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>

              <a
                href="#demo"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-ink-secondary hover:text-ink-primary underline-offset-4 hover:underline transition-colors"
              >
                Ver demo en vivo
              </a>
            </div>

            <p className="font-mono text-xs text-ink-muted">
              5 clasificaciones gratis · Sin tarjeta · Activación inmediata · Planes desde $49/mes
            </p>
          </div>

          <p className="text-base sm:text-lg text-ink-secondary max-w-[52ch] mx-auto leading-relaxed pt-1">
            TariffOS valida fichas merceológicas, clasifica lotes Excel y emite dictámenes PDF firmados con respaldo RGI.
          </p>
        </div>

        <div className="mt-4 sm:mt-6 px-2 sm:px-6">
          <LandingLoopHero />
        </div>
      </section>

      <section id="demo" className="py-16 sm:py-24">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-[clamp(2rem,3vw+0.8rem,3.25rem)] font-medium tracking-[-0.03em] text-ink-primary leading-[1.08] [text-wrap:balance] mx-auto">
              Conoce tu dictamen en segundos
            </h2>
            <p className="font-mono text-xs sm:text-sm text-ink-secondary">
              Diseñado para agentes de aduanas cansados de sistemas lentos y opacos
            </p>
          </div>

          <LandingHeroPreview
            heroPrompt={heroPrompt}
            onChangePrompt={setHeroPrompt}
            onSubmitPrompt={handleHeroSubmit}
            isAuthenticated={isAuthenticated}
          />

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="/samples/dictamen-ejemplo-tariffos.pdf"
              download="Dictamen-TariffOS-EXP-2026-0842.pdf"
              className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-full border border-black/[0.1] dark:border-white/[0.12] bg-white/80 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.1] text-xs sm:text-sm font-semibold text-ink-primary transition-colors"
            >
              <FileDown className="w-4 h-4 text-accent-ink" aria-hidden="true" />
              <span>Descargar Dictamen PDF de ejemplo</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
