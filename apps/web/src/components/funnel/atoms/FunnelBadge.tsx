import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type FunnelBadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

const VARIANT_CLASSES: Record<FunnelBadgeVariant, string> = {
  neutral: 'bg-surface-subtle text-ink-secondary border-border-subtle',
  accent: 'bg-accent-soft text-accent-ink border-accent-border',
  success:
    'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
  warning: 'bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-500/25',
  danger: 'bg-rose-500/12 text-rose-700 dark:text-rose-400 border-rose-500/25',
};

export interface FunnelBadgeProps {
  variant?: FunnelBadgeVariant;
  className?: string;
  children: ReactNode;
}

export function FunnelBadge({
  variant = 'neutral',
  className,
  children,
}: FunnelBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold tracking-tight',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
