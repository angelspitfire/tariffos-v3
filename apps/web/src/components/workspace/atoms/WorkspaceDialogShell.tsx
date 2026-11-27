'use client';

import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export interface WorkspaceDialogShellProps {
  open: boolean;
  onClose: () => void;
  label: string;
  variant?: 'modal' | 'drawer';
  maxWidthClassName?: string;
  contentClassName?: string;
  children: ReactNode;
}

/**
 * Accessible modal & right-hand drawer primitive built on Radix UI Dialog.
 * Provides focus trapping, Escape/backdrop dismissal, overscroll containment,
 * and a `data-workspace-dialog="open"` marker used by global shortcut guards.
 */
export function WorkspaceDialogShell({
  open,
  onClose,
  label,
  variant = 'modal',
  maxWidthClassName,
  contentClassName,
  children,
}: WorkspaceDialogShellProps) {
  const isDrawer = variant === 'drawer';

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'no-print fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[1px]',
            isDrawer ? 'bg-slate-950/40' : 'bg-slate-950/50',
          )}
        />
        <Dialog.Content
          data-workspace-dialog="open"
          aria-modal="true"
          aria-label={label}
          aria-describedby={undefined}
          onPointerDownOutside={(event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest?.('[data-workspace-toast="true"]')) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest?.('[data-workspace-toast="true"]')) {
              event.preventDefault();
            }
          }}
          className={cn(
            'no-print fixed z-50 flex flex-col overflow-hidden overscroll-contain border-border-subtle bg-surface-panel text-ink-primary shadow-elev-2 focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none',
            isDrawer
              ? 'inset-y-0 right-0 h-full w-full max-w-md border-l'
              : 'top-1/2 left-1/2 max-h-[88vh] w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-surface border',
            maxWidthClassName,
            contentClassName,
          )}
        >
          <Dialog.Title className="sr-only">{label}</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
