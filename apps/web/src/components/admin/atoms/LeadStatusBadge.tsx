import type { LeadStatus } from '@tariffos/shared-types';

const LEAD_STYLES: Record<LeadStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pendiente',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  },
  CONTACTED: {
    label: 'Contactado',
    className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30',
  },
  CONVERTED: {
    label: 'Convertido',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  },
  DISCARDED: {
    label: 'Descartado',
    className: 'bg-surface-subtle text-ink-muted border-border-subtle',
  },
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const cfg = LEAD_STYLES[status] ?? LEAD_STYLES.PENDING;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
