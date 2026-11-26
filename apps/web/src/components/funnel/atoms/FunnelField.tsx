import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

const BASE_CONTROL_CLASSES =
  'w-full rounded-xl border border-border-subtle bg-surface-input px-3 py-2 text-xs sm:text-sm text-ink-primary placeholder:text-ink-subtle focus:border-accent-brand focus:outline-none focus:ring-2 focus:ring-accent-soft transition-colors';

export interface FunnelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  leftIcon?: ReactNode;
  containerClassName?: string;
}

export function FunnelInput({
  label,
  leftIcon,
  containerClassName,
  className,
  id,
  ...rest
}: FunnelInputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      <label
        htmlFor={fieldId}
        className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 text-ink-subtle">
            {leftIcon}
          </span>
        ) : null}
        <input
          id={fieldId}
          className={cn(BASE_CONTROL_CLASSES, leftIcon ? 'pl-9' : '', className)}
          {...rest}
        />
      </div>
    </div>
  );
}

export interface FunnelSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  containerClassName?: string;
}

export function FunnelSelect({
  label,
  containerClassName,
  className,
  id,
  children,
  ...rest
}: FunnelSelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      <label
        htmlFor={fieldId}
        className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted"
      >
        {label}
      </label>
      <select id={fieldId} className={cn(BASE_CONTROL_CLASSES, className)} {...rest}>
        {children}
      </select>
    </div>
  );
}

export interface FunnelTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  containerClassName?: string;
}

export function FunnelTextarea({
  label,
  containerClassName,
  className,
  id,
  ...rest
}: FunnelTextareaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      <label
        htmlFor={fieldId}
        className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted"
      >
        {label}
      </label>
      <textarea id={fieldId} className={cn(BASE_CONTROL_CLASSES, className)} {...rest} />
    </div>
  );
}
