'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { BrandMark } from '../atoms/BrandMark';

export interface PublicMarketingShellProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function PublicMarketingShell({
  children,
  hideFooter = false,
}: PublicMarketingShellProps) {
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
    <div className="min-h-screen bg-[#E4E6EB] dark:bg-[#0B0F19] text-ink-primary flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[500] focus:px-4 focus:py-2 focus:rounded-full focus:bg-ink-primary focus:text-ink-on-inverted focus:text-sm focus:font-medium"
      >
        Ir al contenido
      </a>

      <header className="sticky top-0 z-[300] px-4 sm:px-8 pt-4 pb-2 pointer-events-none">
        <div
          className={`pointer-events-auto mx-auto flex items-center justify-between gap-4 rounded-full px-4 sm:px-5 h-14 backdrop-blur-xl transition-colors duration-200 ${
            isScrolled
              ? 'max-w-4xl bg-white/88 dark:bg-[#111827]/90 border border-black/[0.08] dark:border-white/[0.12] shadow-[0_10px_30px_-14px_rgba(15,23,42,0.22)]'
              : 'max-w-[1280px] bg-white/70 dark:bg-[#111827]/75 border border-black/[0.06] dark:border-white/[0.08]'
          }`}
        >
          <BrandMark />

          <nav
            aria-label="Navegación principal"
            className="hidden lg:flex items-center gap-5 text-xs font-medium text-ink-secondary"
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

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="w-9 h-9 inline-flex items-center justify-center rounded-full text-ink-secondary hover:text-ink-primary hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-ink-secondary hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-ink-primary transition-colors whitespace-nowrap"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/onboarding?plan=trial&cycle=monthly"
              className="px-4 min-h-[38px] inline-flex items-center rounded-full text-xs font-semibold bg-accent-brand hover:bg-accent-brand-hover text-white transition-colors whitespace-nowrap"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      {!hideFooter ? (
        <footer className="border-t border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#111827]/75 backdrop-blur-md py-6">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink-primary">TariffOS</span>
              <span>· Inteligencia Arancelaria y Comercio Exterior</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/activate-plan" className="hover:text-ink-primary transition-colors">
                Activar plan
              </Link>
              <Link href="/admin/billing" className="hover:text-ink-primary transition-colors">
                Admin pagos
              </Link>
              <span>© 2026 TariffOS</span>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
