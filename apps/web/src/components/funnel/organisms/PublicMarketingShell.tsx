import type { ReactNode } from 'react';
import Link from 'next/link';
import { BrandMark } from '../atoms/BrandMark';

export interface PublicMarketingShellProps {
  children: ReactNode;
}

export function PublicMarketingShell({ children }: PublicMarketingShellProps) {
  return (
    <div className="min-h-screen bg-surface-app text-ink-primary flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface-panel/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <BrandMark />

          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-6 text-xs font-medium text-ink-secondary"
          >
            <a href="#capacidades" className="hover:text-ink-primary transition-colors">
              Capacidades
            </a>
            <a href="#planes" className="hover:text-ink-primary transition-colors">
              Planes
            </a>
            <a href="#recomendador" className="hover:text-ink-primary transition-colors">
              Recomendador
            </a>
            <a href="#faq" className="hover:text-ink-primary transition-colors">
              Preguntas
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-ink-secondary hover:bg-surface-subtle hover:text-ink-primary transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/onboarding?plan=trial&cycle=monthly"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent-brand hover:bg-accent-brand-hover text-white transition-colors shadow-xs"
            >
              Probar gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border-subtle bg-surface-panel py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-surface-inverted text-ink-on-inverted text-[10px] font-bold flex items-center justify-center">
              T
            </span>
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
    </div>
  );
}
