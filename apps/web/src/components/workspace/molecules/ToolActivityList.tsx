'use client';

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { getEveToolActivity } from '@/lib/workspace/eve-message-mapper';

export interface ToolActivityItem {
  toolCallId: string;
  toolName: string;
  args?: unknown;
  completed: boolean;
  isError?: boolean;
  preliminaryPhase?: string;
}

export function ToolActivityList({ items }: { items: readonly ToolActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5" aria-live="polite">
      {items.map((item) => {
        const { label, detail } = getEveToolActivity(
          item.toolName,
          item.completed,
          item.args,
          item.preliminaryPhase,
        );
        return (
          <div
            key={item.toolCallId}
            className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              item.isError
                ? 'border-[var(--color-error-border)] bg-[var(--color-error-soft)] text-[var(--color-error)]'
                : item.completed
                  ? 'border-border-subtle bg-surface-muted/80 text-ink-secondary'
                  : 'border-accent-border bg-accent-soft/60 text-accent-ink'
            }`}
          >
            {item.isError ? (
              <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
            ) : item.completed ? (
              <CheckCircle2
                className="h-3 w-3 shrink-0 text-[var(--color-success)]"
                aria-hidden="true"
              />
            ) : (
              <Loader2
                className="h-3 w-3 shrink-0 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            )}
            <span className="truncate">{label}</span>
            {detail ? (
              <span className="max-w-36 truncate font-mono text-[10px] text-ink-muted">
                {detail}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
