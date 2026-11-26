import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SAAS_PLANS } from '@tariffos/shared-types';
import { PublicMarketingShell } from '../organisms/PublicMarketingShell';
import { LandingHero } from '../organisms/LandingHero';
import { LandingCapabilities, LandingFaqSection } from '../organisms/LandingCapabilities';
import { PricingSection } from '../organisms/PricingSection';

export function LandingPageTemplate() {
  return (
    <PublicMarketingShell>
      <LandingHero />
      <LandingCapabilities />
      <PricingSection plans={SAAS_PLANS} />
      <LandingFaqSection />

      <section className="py-14 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-primary">
            Comprueba la precisión de TariffOS con tus propios expedientes
          </h2>
          <p className="text-sm text-ink-muted max-w-xl mx-auto">
            Empieza hoy con 5 clasificaciones completas sin tarjeta de crédito y escala
            cuando tu operación lo necesite.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href="/onboarding?plan=trial&cycle=monthly"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-brand hover:bg-accent-brand-hover text-white text-sm font-semibold transition-colors shadow-xs"
            >
              <span>Crear cuenta gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-5 py-2.5 rounded-xl border border-border-strong bg-surface-panel hover:bg-surface-hover text-ink-primary text-sm font-semibold transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>
    </PublicMarketingShell>
  );
}
