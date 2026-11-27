'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, CreditCard, Lock } from 'lucide-react';
import { readPendingQuery } from '@/lib/funnel/funnel-storage';

export interface WorkspaceReadOnlyBarProps {
  reason: string;
  pendingQuery?: string | null;
  isPendingVerification?: boolean;
}

/** Replaces the interactive composer when a cloud account is locked pending payment or at quota. */
export function WorkspaceReadOnlyBar({
  reason,
  pendingQuery,
  isPendingVerification,
}: WorkspaceReadOnlyBarProps) {
  const [storedQuery, setStoredQuery] = useState<string | null>(null);

  useEffect(() => {
    if (pendingQuery === undefined) {
      setStoredQuery(readPendingQuery());
    }
  }, [pendingQuery]);

  const effectiveQuery = pendingQuery ?? storedQuery;
  const verifying = isPendingVerification ?? /^Pago en verificación/i.test(reason);

  return (
    <div
      role="status"
      className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 rounded-surface border border-amber-500/35 bg-surface-panel/95 px-4 py-3 text-xs shadow-elev-2 backdrop-blur-xl"
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
          {verifying ? (
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 space-y-0.5">
          <div className="font-semibold text-ink-primary">
            {verifying ? 'Activación en verificación' : 'Espacio en modo lectura'}
          </div>
          <p className="text-ink-secondary leading-relaxed">{reason}</p>
          {effectiveQuery ? (
            <p className="text-[11px] text-ink-muted">
              Consulta guardada:{' '}
              <strong className="text-ink-primary">«{effectiveQuery}»</strong>
            </p>
          ) : null}
        </div>
      </div>

      <Link
        href={verifying ? '/activate-plan' : '/activate-plan?plan=pilot'}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-brand px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-brand-hover"
      >
        <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
        {verifying ? 'Ver estado del pago' : 'Activar plan'}
      </Link>
    </div>
  );
}