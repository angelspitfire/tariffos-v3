'use client';

import { useState, useCallback, useContext, createContext } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (
    message: string,
    variant?: ToastVariant,
    options?: {
      duration?: number;
      action?: { label: string; onClick: () => void };
      dismissible?: boolean;
    }
  ) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (
      message: string,
      variant: ToastVariant = 'info',
      options: {
        duration?: number;
        action?: { label: string; onClick: () => void };
        dismissible?: boolean;
      } = {}
    ) => {
      const id = crypto.randomUUID();
      const toast: Toast = {
        id,
        message,
        variant,
        duration: options.duration ?? (variant === 'loading' ? 0 : 5000),
        action: options.action,
        dismissible: options.dismissible ?? true,
      };

      setToasts((prev) => [...prev, toast]);

      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, toast.duration);
      }

      return id;
    }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { toasts: [], toast: () => {}, dismiss: () => {}, dismissAll: () => {} };
  }
  return context;
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
    loading: Loader2,
  };

  const Icon = icons[toast.variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border',
        'animate-in slide-in-from-right duration-200',
        'shadow-xl',
        'max-w-md w-full',
        'print-hide',
        'relative',
        toast.variant === 'loading' && 'animate-pulse'
      )}
      style={{
        borderColor: `var(--${toast.variant}-border)`,
        backgroundColor: `var(--${toast.variant}-subtle)`,
        color: `var(--${toast.variant}-text)`,
      }}
      role={toast.variant === 'loading' ? 'status' : 'alert'}
      aria-live={toast.variant === 'loading' ? 'polite' : 'assertive'}
    >
      <Icon
        className={cn('w-5 h-5 shrink-0 mt-0.5 flex-shrink-0', toast.variant === 'loading' && 'animate-spin')}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.message}</p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-xs font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      {toast.dismissible && (
        <button
          onClick={() => onDismiss(toast.id)}
          className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-lo)] hover:text-[var(--text-hi)] hover:bg-[var(--surface-raised)] transition-colors"
          aria-label="Cerrar"
        >
          <X size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return typeof window !== 'undefined'
    ? createPortal(
        <div
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-md"
          style={{ pointerEvents: 'none' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>,
        document.body
      )
    : null;
}
