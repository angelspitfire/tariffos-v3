import { Clock, FileCheck2, Mail, ShieldCheck } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: FileCheck2, label: 'Auditoría en vivo (15 min) con una factura real de tu operación' },
  { icon: Clock, label: 'Respuesta técnica directa en menos de 24 horas hábiles' },
  { icon: ShieldCheck, label: 'Confidencialidad total: tus datos nunca entrenan modelos públicos' },
] as const;

export function LeadCaptureAside() {
  return (
    <div className="lg:col-span-5 flex flex-col justify-between gap-5">
      <div className="space-y-3">
        <h2 className="text-2xl sm:text-[1.75rem] font-medium tracking-[-0.025em] text-ink-primary leading-[1.15] [text-wrap:balance]">
          ¿Necesitas una demo guiada o un plan a medida para tu agencia?
        </h2>

        <p className="text-sm text-ink-secondary leading-relaxed">
          Agendamos una prueba con tu propia factura o cotizamos un despliegue Enterprise multi-sucursal.
        </p>

        <ul className="space-y-2.5 pt-2">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label} className="flex items-start gap-2.5 text-xs text-ink-secondary leading-snug">
                <Icon className="w-4 h-4 text-accent-ink shrink-0 mt-0.5" aria-hidden="true" />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pt-3 border-t border-border-hairline flex items-center gap-2 text-xs text-ink-muted">
        <Mail className="w-3.5 h-3.5 text-accent-ink shrink-0" aria-hidden="true" />
        <span>
          O escríbenos directo a{' '}
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
