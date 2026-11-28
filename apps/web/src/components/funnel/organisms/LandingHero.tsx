'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, FileDown } from 'lucide-react';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import {
  GLOBAL_LANDING_CONFIG,
  type LandingEditionConfig,
} from '@/lib/funnel/country-landings';
import { readMockSession, savePendingQuery } from '@/lib/funnel/funnel-storage';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { LandingHeroPreview } from '../molecules/LandingHeroPreview';
import { SELECT_LEAD_INTENT_EVENT } from './LandingLeadCaptureSection';
import { LandingLoopHero } from './LandingLoopHero';

export interface LandingHeroProps {
  hasSession?: boolean;
  requiresAuth?: boolean;
  config?: LandingEditionConfig;
}

export function LandingHero({
  hasSession,
  requiresAuth,
  config = GLOBAL_LANDING_CONFIG,
}: LandingHeroProps) {
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
      router.push(config.onboardingHref);
      return;
    }
    router.push('/app');
  };

  const handleRequestGuidedDemo = () => {
    window.dispatchEvent(
      new CustomEvent(SELECT_LEAD_INTENT_EVENT, {
        detail: {
          intent: 'demo',
          notes: heroPrompt.trim() ? `Mercancía de prueba: ${heroPrompt.trim()}` : undefined,
        },
      }),
    );
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
    router.push(config.onboardingHref);
  };

  return (
    <>
      <section className="relative pt-10 sm:pt-14 pb-12 sm:pb-20 overflow-x-clip tos-hero-aura">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 text-center space-y-6">
          {config.normativeBadge ? (
            <div className="flex justify-center tos-rise tos-stagger-1">
              <FunnelBadge variant="neutral">
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-accent-brand tos-live-dot"
                />
                <span>{config.normativeBadge}</span>
              </FunnelBadge>
            </div>
          ) : null}

          <h1 className="tos-rise tos-stagger-2 text-[clamp(2.4rem,4.8vw+0.8rem,4.35rem)] font-medium tracking-[-0.035em] text-ink-primary leading-[1.04] max-w-[20ch] mx-auto [text-wrap:balance]">
            {config.heroHeading}
          </h1>

          <p className="tos-rise tos-stagger-3 text-base sm:text-lg text-ink-secondary max-w-[54ch] mx-auto leading-relaxed">
            {config.heroSubtitle}
          </p>

          <div className="tos-rise tos-stagger-4 pt-1 flex flex-col items-center justify-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="group inline-flex items-center gap-2.5 px-7 min-h-[50px] rounded-full text-sm font-semibold text-white bg-accent-brand hover:bg-accent-brand-hover cursor-pointer active:translate-y-px tos-btn-glow"
              >
                <span>{isAuthenticated ? 'Ir al workspace' : 'Activar Piloto Operativo'}</span>
                <ArrowRight
                  className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  aria-hidden="true"
                />
              </button>

              <a
                href="#contacto"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent(SELECT_LEAD_INTENT_EVENT, { detail: 'demo' }));
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-ink-secondary hover:text-ink-primary underline-offset-4 hover:underline transition-colors"
              >
                Solicitar demo con tu factura
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-muted">
              <span>Piloto Operativo $150 (250 clasif. acreditables)</span>
              <span aria-hidden="true" className="hidden sm:inline-block h-3 w-px bg-border-strong" />
              <span>Plan Agencia desde $300/mes</span>
              <span aria-hidden="true" className="hidden sm:inline-block h-3 w-px bg-border-strong" />
              <span>Enterprise a medida</span>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 px-2 sm:px-6">
          <LandingLoopHero />
        </div>
      </section>

      <section id="demo" className="relative py-16 sm:py-24 tos-ambient-glow">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-[clamp(2rem,3vw+0.8rem,3.25rem)] font-medium tracking-[-0.03em] text-ink-primary leading-[1.08] [text-wrap:balance] mx-auto">
              {config.demoHeading}
            </h2>
            <p className="font-mono text-xs sm:text-sm text-ink-secondary">
              {config.demoSubheading}
            </p>
          </div>

          <LandingHeroPreview
            heroPrompt={heroPrompt}
            onChangePrompt={setHeroPrompt}
            onSubmitPrompt={handleHeroSubmit}
            onRequestGuidedDemo={handleRequestGuidedDemo}
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
