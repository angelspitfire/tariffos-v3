import type { ReactNode } from 'react';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';

export interface AdminKpiTileProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'brand' | 'amber' | 'emerald' | 'rose';
  icon?: ReactNode;
}

const TONE_CLASS: Record<NonNullable<AdminKpiTileProps['tone']>, string> = {
  default: 'text-ink-primary',
  brand: 'text-accent-ink',
  amber: 'text-amber-700 dark:text-amber-400',
  emerald: 'text-emerald-700 dark:text-emerald-400',
  rose: 'text-rose-700 dark:text-rose-400',
};

export function AdminKpiTile({
  label,
  value,
  hint,
  tone = 'default',
  icon,
}: AdminKpiTileProps) {
  return (
    <FunnelCard padding="p-4" className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-ink-muted">
        <span>{label}</span>
        {icon}
      </div>
      <div className={`text-2xl font-bold font-mono tabular-nums ${TONE_CLASS[tone]}`}>
        {value}
      </div>
      {hint && <div className="text-[11px] text-ink-subtle">{hint}</div>}
    </FunnelCard>
  );
}
