'use client';

export type WorkspacePillVariant =
  | 'draft_ai'
  | 'in_review'
  | 'approved'
  | 'classified'
  | 'needs_review'
  | 'info'
  | 'warning'
  | 'restricted';

interface StatusPillProps {
  variant: WorkspacePillVariant;
  label?: string;
  className?: string;
}

const PILL_STYLES: Record<WorkspacePillVariant, { defaultLabel: string; tone: string }> = {
  draft_ai: {
    defaultLabel: 'Borrador IA',
    tone: 'bg-surface-subtle text-ink-secondary border-border-subtle',
  },
  in_review: {
    defaultLabel: 'En revisión',
    tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  approved: {
    defaultLabel: 'Aprobado y sellado',
    tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  classified: {
    defaultLabel: 'Clasificado',
    tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  needs_review: {
    defaultLabel: 'Requiere revisión',
    tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  info: {
    defaultLabel: 'Informativo',
    tone: 'bg-accent-soft text-accent-ink border-accent-border',
  },
  warning: {
    defaultLabel: 'Atención OGA',
    tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  restricted: {
    defaultLabel: 'Restringido',
    tone: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
  },
};

export function StatusPill({ variant, label, className = '' }: StatusPillProps) {
  const style = PILL_STYLES[variant];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.tone} ${className}`}
    >
      {label ?? style.defaultLabel}
    </span>
  );
}
