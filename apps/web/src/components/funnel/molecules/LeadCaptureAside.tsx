import { Clock, FileCheck2, Mail, ShieldCheck } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: FileCheck2,
    title: 'Auditoría en vivo con tu factura (15 min)',
    detail: 'Evaluamos un expediente real de tu operación y te mostramos el dictamen PDF y el cálculo CIF al instante.',
  },
  {
    icon: Clock,
    title: 'Respuesta técnica en menos de 24h hábiles',
    detail: 'Te atiende el equipo de producto e ingeniería para dimensionar volumen, usuarios y carga inicial de catálogo SKU.',
  },
  {
    icon: ShieldCheck,
    title: 'Confidencialidad desde el primer contacto',
    detail: 'Tus facturas, precios CIF y proveedores nunca se comparten ni se usan para entrenar modelos públicos.',
  },
] as const;

export function LeadCaptureAside() {
  return (
    <div className="lg:col-span-5 flex flex-col justify-between gap-8">
      <div className="space-y-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent-soft text-accent-ink font-mono text-[11px] font-semibold">
          Demo en vivo · Plan Enterprise
        </span>

        <h2 className="text-[clamp(1.75rem,2.6vw+0.6rem,2.5rem)] font-medium tracking-[-0.03em] text-ink-primary leading-[1.1] [text-wrap:balance]">
          ¿Necesitas una demo guiada o un plan a medida para tu agencia?
        </h2>

        <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
          Déjanos tus datos para agendar una prueba en vivo con una factura real o cotizar un despliegue Enterprise multi-sucursal.
        </p>

        <ul className="space-y-4 pt-3">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent-brand/12 text-accent-ink flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs sm:text-sm font-semibold text-ink-primary">
                    {item.title}
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">{item.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center gap-2 text-xs text-ink-muted">
        <Mail className="w-3.5 h-3.5 text-accent-ink shrink-0" aria-hidden="true" />
        <span>
          ¿Prefieres escribirnos directo?{' '}
          <a
            href="mailto:soporte@tariffos.com"
            className="font-semibold text-ink-primary hover:text-accent-ink underline-offset-4 hover:underline"
          >
            soporte@tariffos.com
          </a>
        </span>
      </div>
    </div>
  );
}
