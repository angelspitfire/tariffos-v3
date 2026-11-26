import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FunnelCardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: string;
  children: ReactNode;
}

export function FunnelCard({
  padding = 'p-5',
  className,
  children,
  ...rest
}: FunnelCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-subtle bg-surface-panel',
        padding,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
