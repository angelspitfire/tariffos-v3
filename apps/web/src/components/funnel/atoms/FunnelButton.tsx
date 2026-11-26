import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FunnelButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
export type FunnelButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<FunnelButtonVariant, string> = {
  primary:
    'bg-accent-brand hover:bg-accent-brand-hover text-white border-transparent shadow-xs',
  outline:
    'bg-surface-panel hover:bg-surface-hover text-ink-primary border-border-strong',
  ghost: 'bg-transparent hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary border-transparent',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white border-transparent',
};

const SIZE_CLASSES: Record<FunnelButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-xs sm:text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-sm rounded-xl',
};

export interface FunnelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FunnelButtonVariant;
  size?: FunnelButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function FunnelButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  type = 'button',
  children,
  ...rest
}: FunnelButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 border font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : leftIcon}
      <span>{children}</span>
      {!isLoading ? rightIcon : null}
    </button>
  );
}
