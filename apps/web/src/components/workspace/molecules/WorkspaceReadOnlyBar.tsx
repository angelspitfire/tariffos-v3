'use client';

import Link from 'next/link';
import { CreditCard, Lock } from 'lucide-react';

export interface WorkspaceReadOnlyBarProps {
  reason: string;
}

/** Replaces the interactive composer when a cloud account is locked pending payment or at quota. */
export function WorkspaceReadOnlyBar({ reason }: WorkspaceReadOnlyBarProps) {
  return (
    <div
      role="status"
      className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 rounded-[22px] border border-amber-500/35 bg-surface-panel/95 px-4 py-3 text-xs shadow-[0_14px_36px_-18px_rgba(15,23,42,0.18)] backdrop-blur-xl"
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <div className="font-semibold text-ink-primary">Espacio en modo lectura</div>
          <p className="text-ink-secondary leading-relaxed">{reason}</p>
        </div>
      </div>

      <Link
        href="/activate-plan?plan=pilot"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-brand px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-brand-hover"
      >
        <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
        Activar plan
      </Link>
    </div>
  );
}