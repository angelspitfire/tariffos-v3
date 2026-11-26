import type { TenantBillingStatus } from '@tariffos/shared-types';

const STATUS_STYLES: Record<TenantBillingStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Activo',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  },
  TRIALING: {
    label: 'Trial',
    className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30',
  },
  PAST_DUE: {
    label: 'Mora',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  },
  CANCELED: {
    label: 'De baja',
    className: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
  },
};

export function TenantStatusBadge({ status }: { status: TenantBillingStatus }) {
  const cfg = STATUS_STYLES[status] ?? STATUS_STYLES.TRIALING;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
