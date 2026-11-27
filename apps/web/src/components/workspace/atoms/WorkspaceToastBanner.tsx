'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { WorkspaceToast } from '@/lib/workspace/types';

export interface WorkspaceToastState extends WorkspaceToast {
  actionLabel?: string;
  onAction?: () => void;
}

export interface WorkspaceToastBannerProps {
  toast: WorkspaceToastState | null;
}

/**
 * Floating status toast rendered via `document.body` portal at `--z-toast` (500)
 * with `pointer-events-auto` so Undo actions stay clickable even over open Radix modals.
 */
export function WorkspaceToastBanner({ toast }: WorkspaceToastBannerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!toast) return null;

  const content = (
    <output
      aria-live="polite"
      data-workspace-toast="true"
      style={{ pointerEvents: 'auto' }}
      className="no-print pointer-events-auto fixed right-4 bottom-[max(3.75rem,env(safe-area-inset-bottom))] z-[500] flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-inverted px-3.5 py-2 text-xs font-medium text-ink-on-inverted shadow-lg lg:bottom-4"
    >
      <span>{toast.title}</span>
      {toast.actionLabel && toast.onAction ? (
        <button
          type="button"
          onClick={toast.onAction}
          className="cursor-pointer rounded-md bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-ink-on-inverted transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        >
          {toast.actionLabel}
        </button>
      ) : null}
    </output>
  );

  return mounted && typeof document !== 'undefined' ? createPortal(content, document.body) : content;
}
