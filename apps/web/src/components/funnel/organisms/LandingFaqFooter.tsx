import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: '¿En qué se diferencia TariffOS de un chat genérico con IA?',
    a: 'TariffOS ejecuta un flujo estructurado de clasificación aduanera: valida atributos merceológicos (HITL), aplica las Reglas Generales de Interpretación (RGI), cruza decretos oficiales y entrega cálculo tributario más dictamen técnico firmable.',
  },
  {
    q: '¿Cómo funciona la facturación manual?',
    a: 'Puedes empezar con el Trial gratuito al instante. Al elegir un plan comercial, realizas el pago por Zelle, transferencia, Binance Pay o Pago Móvil, reportas la referencia desde la plataforma y activamos tu cuenta en menos de 24 horas hábiles.',
  },
  {
    q: '¿Puedo trabajar con lotes grandes de productos?',
    a: 'Sí. Desde el plan Pro puedes cargar archivos Excel/CSV con múltiples mercancías, obtener triage de confianza automático y exportar el manifiesto clasificado.',
  },
  {
    q: '¿Sirve para varias jurisdicciones o solo un país?',
    a: 'TariffOS está diseñado con adaptador multi-legislación para operar decretos, alícuotas y regímenes legales por país según la jurisdicción configurada en tu espacio de trabajo.',
  },
] as const;

export function LandingFaqFooter() {
  return (
    <>
      <section id="faq" className="py-20 sm:py-28">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-[clamp(2rem,3vw+0.8rem,3.25rem)] font-medium tracking-[-0.03em] text-ink-primary leading-[1.08] [text-wrap:balance] mx-auto">
              Todo lo que necesitas saber antes de activar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                className="rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.04] backdrop-blur-md p-6 space-y-2.5"
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

      <footer className="relative overflow-hidden pt-20 pb-12 border-t border-black/[0.06] dark:border-white/[0.08]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_105%,rgba(37,99,235,0.22),rgba(56,189,248,0.14)_45%,transparent_75%)] dark:bg-[radial-gradient(ellipse_75%_65%_at_50%_105%,rgba(37,99,235,0.32),rgba(14,165,233,0.12)_45%,transparent_75%)]"
        />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-5">
            <h2 className="text-[clamp(2rem,3.4vw+0.8rem,3.5rem)] font-medium tracking-[-0.03em] text-ink-primary leading-[1.06] [text-wrap:balance] mx-auto">
              Comprueba la precisión de TariffOS con tus propios expedientes
            </h2>
            <p className="text-base text-ink-secondary leading-relaxed">
              Empieza hoy con 5 clasificaciones completas sin tarjeta de crédito y escala cuando tu operación lo necesite.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/onboarding?plan=trial&cycle=monthly"
                className="inline-flex items-center gap-2 min-h-[50px] rounded-full px-7 bg-accent-brand hover:bg-accent-brand-hover text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <span>Crear cuenta gratis</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center min-h-[50px] rounded-full px-6 border border-border-strong bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.1] text-ink-primary text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-8 border-t border-black/[0.07] dark:border-white/[0.08]">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-3">
                <span className="h-9 px-3 rounded-full bg-ink-primary text-ink-on-inverted inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span className="w-2 h-2 rounded-full bg-accent-brand dark:bg-sky-400" />
                </span>
                <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-primary">
                  TariffOS
                </span>
                <span className="px-2.5 py-1 rounded-md border border-black/[0.14] dark:border-white/[0.16] font-mono text-xs text-ink-muted whitespace-nowrap shrink-0">
                  RGI + HITL
                </span>
              </div>
              <p className="text-xs text-ink-secondary">
                Inteligencia Arancelaria y Comercio Exterior
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-ink-secondary">
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
