import type { PlatformRole } from '@tariffos/shared-types';

const ROLE_STYLES: Record<PlatformRole, { label: string; className: string }> = {
  super_admin: {
    label: 'Super Admin',
    className: 'bg-accent-soft text-accent-ink border-accent-border',
  },
  ops_billing: {
    label: 'Ops & Billing',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  },
  support: {
    label: 'Soporte',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  },
  user: {
    label: 'Cliente',
    className: 'bg-surface-subtle text-ink-muted border-border-subtle',
  },
};

export function AdminRoleBadge({ role }: { role: PlatformRole }) {
  const cfg = ROLE_STYLES[role] ?? ROLE_STYLES.user;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
