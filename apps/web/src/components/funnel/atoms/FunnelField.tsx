import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

const BASE_CONTROL_CLASSES =
  'w-full rounded-xl border border-border-subtle bg-surface-input px-3 py-2 text-xs sm:text-sm text-ink-primary placeholder:text-ink-subtle focus:border-accent-brand focus:outline-none focus:ring-2 focus:ring-accent-soft transition-colors';

export interface FunnelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  error?: string | null;
  ref?: Ref<HTMLInputElement>;
  containerClassName?: string;
}

export function FunnelInput({
  label,
  leftIcon,
  rightSlot,
  error,
  ref,
  containerClassName,
  className,
  id,
  ...rest
}: FunnelInputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  const hasError = Boolean(error);

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
          ref={ref}
          id={fieldId}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(
            BASE_CONTROL_CLASSES,
            hasError ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : '',
            leftIcon ? 'pl-9' : '',
            rightSlot ? 'pr-9' : '',
            className,
          )}
          {...rest}
        />
        {rightSlot ? (
          <div className="absolute right-2.5 flex items-center">{rightSlot}</div>
        ) : null}
      </div>
      {hasError ? (
        <p id={errorId} role="alert" className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : null}
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
