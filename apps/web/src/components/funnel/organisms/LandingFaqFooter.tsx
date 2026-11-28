import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  GLOBAL_LANDING_CONFIG,
  type LandingEditionConfig,
} from '@/lib/funnel/country-landings';
import { isCountrySwitcherEnabled } from '@/lib/runtime-config';
import { CountryEditionSwitcher } from '../molecules/CountryEditionSwitcher';

export function LandingFaqFooter({
  config = GLOBAL_LANDING_CONFIG,
  showCountrySwitcher,
}: {
  config?: LandingEditionConfig;
  showCountrySwitcher?: boolean;
}) {
  const faqItems = config.faqItems;
  const showSwitcher = showCountrySwitcher ?? isCountrySwitcherEnabled();

  return (
    <>
      <section id="faq" className="py-20 sm:py-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-[clamp(2rem,3vw+0.8rem,3.25rem)] font-medium tracking-[-0.03em] text-ink-primary leading-[1.08] [text-wrap:balance] mx-auto">
              Todo lo que necesitas saber antes de activar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqItems.map((item) => (
              <div
                key={item.q}
                className="rounded-[24px] border border-border-subtle bg-surface-panel p-6 space-y-2.5 tos-card-lift"
              >
                <h3 className="text-base font-semibold text-ink-primary leading-snug">
                  {item.q}
                </h3>
                <p className="text-sm text-ink-secondary leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden pt-20 pb-12 border-t border-border-subtle bg-surface-panel tos-ambient-glow">
        <div className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-5">
            <h2 className="text-[clamp(2rem,3.4vw+0.8rem,3.5rem)] font-medium tracking-[-0.03em] text-ink-primary leading-[1.06] [text-wrap:balance] mx-auto">
              Comprueba la precisión de TariffOS con tus propios expedientes
            </h2>
            <p className="text-base text-ink-secondary leading-relaxed">
              Activa tu Piloto Operativo por $150 (250 clasificaciones, 100% acreditables al Plan Agencia) o agenda una demo en vivo con tu propia factura.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href={config.onboardingHref}
                className="inline-flex items-center gap-2 min-h-[50px] rounded-full px-7 bg-accent-brand hover:bg-accent-brand-hover text-white text-sm font-semibold whitespace-nowrap tos-btn-glow"
              >
                <span>Activar Piloto Operativo</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center min-h-[50px] rounded-full px-6 border border-border-strong bg-surface-muted hover:bg-surface-hover text-ink-primary text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-8 border-t border-border-hairline">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3">
                <span className="h-9 px-3 rounded-full bg-ink-primary text-ink-on-inverted inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span className="w-2 h-2 rounded-full bg-accent-brand" />
                </span>
                <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-primary">
                  TariffOS
                </span>
                <span className="px-2.5 py-1 rounded-md border border-border-subtle font-mono text-xs text-ink-muted whitespace-nowrap shrink-0">
                  {config.footerTag}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs text-ink-secondary">
                  Inteligencia Arancelaria y Comercio Exterior
                </p>
                {showSwitcher ? <CountryEditionSwitcher activeSlug={config.slug} /> : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 font-mono text-xs text-ink-secondary">
              <a href="#demo" className="hover:text-ink-primary transition-colors">
                Demo
              </a>
              <a href="#capacidades" className="hover:text-ink-primary transition-colors">
                Capacidades
              </a>
              <a href="#como-funciona" className="hover:text-ink-primary transition-colors">
                Flujo
              </a>
              <a href="#planes" className="hover:text-ink-primary transition-colors">
                Planes
              </a>
              <a href="#contacto" className="hover:text-ink-primary transition-colors">
                Contacto
              </a>
              <Link href="/privacidad" className="hover:text-ink-primary transition-colors">
                Privacidad y Seguridad
              </Link>
              <Link href="/activate-plan" className="hover:text-ink-primary transition-colors">
                Activar plan
              </Link>
              <span className="text-ink-muted">© 2026 TariffOS</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
