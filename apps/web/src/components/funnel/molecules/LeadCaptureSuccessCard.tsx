import { CheckCircle2 } from 'lucide-react';
import type { LeadInquiryIntent } from '@/lib/funnel/lead-form-validation';

export interface LeadCaptureSuccessCardProps {
  submittedEmail: string;
  intents: readonly LeadInquiryIntent[];
  onReset: () => void;
}

export function LeadCaptureSuccessCard({
  submittedEmail,
  intents,
  onReset,
}: LeadCaptureSuccessCardProps) {
  const summaryLabel =
    intents.includes('enterprise') && intents.includes('demo')
      ? 'demo guiada y cotización Enterprise'
      : intents.includes('enterprise')
        ? 'cotización Enterprise'
        : 'demo guiada';

  return (
    <div className="py-4 space-y-4 text-center sm:text-left">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-success-soft)] text-[var(--color-success)]">
        <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-ink-primary">Solicitud recibida</h3>
        <p className="text-sm text-ink-secondary leading-relaxed">
          Registramos tu contacto (
          <span className="font-semibold text-ink-primary">{submittedEmail}</span>). Nuestro equipo
          te escribirá en menos de 24 horas hábiles para coordinar tu {summaryLabel}.
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="px-4 min-h-[40px] rounded-full border border-border-strong text-xs font-semibold text-ink-primary hover:bg-surface-hover cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-accent-brand focus-visible:outline-offset-2 active:translate-y-px"
      >
        Enviar otra consulta
      </button>
    </div>
  );
}
