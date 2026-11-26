'use client';

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { getEveToolLabel } from '@/lib/workspace/eve-message-mapper';

export interface EveToolStatusPillProps {
  toolName: string;
  completed: boolean;
  isError?: boolean;
}

export function EveToolStatusPill({
  toolName,
  completed,
  isError = false,
}: EveToolStatusPillProps) {
  const label = getEveToolLabel(toolName, completed);
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        isError
          ? 'border-[var(--color-error-border)] bg-[var(--color-error-soft)] text-[var(--color-error)]'
          : completed
            ? 'border-border-subtle bg-surface-muted/70 text-ink-secondary'
            : 'border-accent-brand/30 bg-accent-soft/50 text-accent-ink'
      }`}
    >
      {isError ? (
        <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      ) : completed ? (
        <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      ) : (
        <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden="true" />
      )}
      <span>{label}</span>
    </div>
  );
}
