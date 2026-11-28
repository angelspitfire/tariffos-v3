'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { readMockSession } from '@/lib/funnel/funnel-storage';
import { BrandMark } from '../atoms/BrandMark';
import { CountryEditionSwitcher } from '../molecules/CountryEditionSwitcher';

export interface PublicMarketingShellProps {
  children: ReactNode;
  hideFooter?: boolean;
  activeEditionSlug?: 'global' | 've';
}

export function PublicMarketingShell({
  children,
  hideFooter = false,
  activeEditionSlug = 'global',
}: PublicMarketingShellProps) {
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(Boolean(readMockSession()));
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const nextDark = !root.classList.contains('dark');
    root.classList.toggle('dark', nextDark);
    setIsDark(nextDark);
  };

  return (
    <div className="min-h-screen bg-surface-app text-ink-primary flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[500] focus:px-4 focus:py-2 focus:rounded-full focus:bg-ink-primary focus:text-ink-on-inverted focus:text-sm focus:font-medium"
      >
        Ir al contenido
      </a>

      <header className="sticky top-0 z-[300] px-3 sm:px-8 pt-4 pb-2 pointer-events-none">
        <div
          className={`pointer-events-auto mx-auto flex items-center justify-between gap-2 sm:gap-4 rounded-full px-3 sm:px-5 min-h-14 py-1.5 transition-colors duration-200 ${
            isScrolled
              ? 'max-w-5xl bg-surface-panel border border-border-strong shadow-card'
              : 'max-w-[1280px] bg-surface-panel border border-border-subtle'
          }`}
        >
          <BrandMark badgeText={activeEditionSlug === 've' ? 'RGI 1–6 · VE' : 'RGI 1–6'} />

          <nav
            aria-label="Navegación principal"
            className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-medium text-ink-secondary"
          >
            <a href="#demo" className="hover:text-ink-primary transition-colors whitespace-nowrap py-2">
              Demo en vivo
            </a>
            <a href="#capacidades" className="hover:text-ink-primary transition-colors whitespace-nowrap py-2">
              Capacidades
            </a>
            <a href="#como-funciona" className="hover:text-ink-primary transition-colors whitespace-nowrap py-2">
              Cómo funciona
            </a>
            <a href="#planes" className="hover:text-ink-primary transition-colors whitespace-nowrap py-2">
              Planes
            </a>
            <a href="#faq" className="hover:text-ink-primary transition-colors whitespace-nowrap py-2">
              Preguntas
            </a>
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <div className="hidden md:block">
              <CountryEditionSwitcher activeSlug={activeEditionSlug} compact />
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-full text-ink-secondary hover:text-ink-primary hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            {hasSession ? (
              <Link
                href="/app"
                className="px-3.5 sm:px-4 min-h-[36px] sm:min-h-[38px] inline-flex items-center gap-1.5 rounded-full text-xs font-semibold bg-accent-brand hover:bg-accent-brand-hover text-white transition-colors whitespace-nowrap"
              >
                <span>Ir al workspace</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold text-ink-secondary hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-ink-primary transition-colors whitespace-nowrap"
                >
                  <span className="sm:hidden">Entrar</span>
                  <span className="hidden sm:inline">Iniciar sesión</span>
                </Link>
                <Link
                  href="/onboarding?plan=pilot&cycle=monthly"
                  className="px-3 sm:px-4 min-h-[36px] sm:min-h-[38px] inline-flex items-center rounded-full text-xs font-semibold bg-accent-brand hover:bg-accent-brand-hover text-white transition-colors whitespace-nowrap"
                >
                  Activar Piloto
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      {!hideFooter ? (
        <footer className="border-t border-border-subtle bg-surface-panel py-6">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink-primary">TariffOS</span>
              <span>· Inteligencia Arancelaria y Comercio Exterior</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacidad" className="hover:text-ink-primary transition-colors">
                Privacidad y Seguridad
              </Link>
              <Link href="/activate-plan" className="hover:text-ink-primary transition-colors">
                Activar plan
              </Link>
              <span>© 2026 TariffOS</span>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
