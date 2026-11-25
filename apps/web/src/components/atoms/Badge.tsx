import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'cleared' | 'review' | 'disputed' | 'neutral' | 'intel';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  cleared: 'bg-[var(--success-subtle)] text-[var(--success-text)] border-[var(--success-border)]',
  review: 'bg-[var(--warning-subtle)] text-[var(--warning-text)] border-[var(--warning-border)]',
  disputed: 'bg-[var(--danger-subtle)] text-[var(--danger-text)] border-[var(--danger-border)]',
  intel: 'bg-indigo-500/10 text-[var(--purple-text)] border-[var(--purple-border)]',
  neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border font-mono-numbers tracking-tight',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
