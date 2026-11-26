import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: '¿Quién asume la responsabilidad legal de la clasificación sugerida?',
    a: 'TariffOS es una herramienta de soporte técnico y documental. El sistema fundamenta cada sugerencia con RGI 1–6 y Notas Legales, pero el Agente de Aduanas revisa, valida y suscribe el dictamen final con su patente.',
  },
  {
    q: '¿Con qué frecuencia actualizan el Decreto 4.944, reformas y exoneraciones?',
    a: 'Mantenemos indexado el arancel nacional vigente (VE-SENIAT) y actualizamos modificaciones arancelarias, alícuotas y regímenes legales conforme se publican en Gaceta Oficial.',
  },
  {
    q: '¿Qué pasa con la confidencialidad de las facturas y clientes de mi agencia?',
    a: 'Tus facturas, precios CIF y catálogos SKU están aislados por espacio de trabajo con cifrado en tránsito y en reposo. Nunca usamos los documentos de nuestros clientes para entrenar modelos públicos.',
  },
  {
    q: '¿En qué se diferencia TariffOS de un chat genérico con IA?',
    a: 'Un chat genérico improvisa códigos sin verificar. TariffOS exige validación pericial de atributos merceológicos, aplica RGI 1–6 contra el arancel real, calcula impuestos CIF y genera un dictamen PDF firmable.',
  },
  {
    q: '¿Cómo funciona el Piloto Operativo de $150 y la activación de planes?',
    a: 'El Piloto Operativo ($150 pago único) te da 250 clasificaciones con lotes Excel y dictámenes PDF por 30 días, y se acredita al 100% a tu primer mes del Plan Agencia ($300/mes). Pagas por Zelle, Transferencia USD/EUR, Binance Pay o Pago Móvil y activamos tu cuenta en menos de 24 horas hábiles.',
  },
  {
    q: '¿Puedo trabajar con lotes grandes y múltiples jurisdicciones?',
    a: 'Sí. Tanto el Piloto Operativo como el Plan Agencia incluyen carga masiva de archivos Excel/CSV; para operaciones multi-sucursal o multi-jurisdicción cotizamos el plan Enterprise a medida.',
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
              Activa tu Piloto Operativo por $150 (250 clasificaciones, 100% acreditables al Plan Agencia) o agenda una demo en vivo con tu propia factura.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/onboarding?plan=pilot&cycle=monthly"
                className="inline-flex items-center gap-2 min-h-[50px] rounded-full px-7 bg-accent-brand hover:bg-accent-brand-hover text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <span>Activar Piloto Operativo</span>
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
                  RGI 1–6 · VE
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
              <a href="#contacto" className="hover:text-ink-primary transition-colors">
                Contacto
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
