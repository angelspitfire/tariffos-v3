'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getEveToolActivity } from '@/lib/workspace/eve-message-mapper';

export interface ToolActivityItem {
  toolCallId: string;
  toolName: string;
  args?: unknown;
  completed: boolean;
  isError?: boolean;
  preliminaryPhase?: string;
}

const INTERNAL_SKILL_TOOLS = new Set([
  'eve__skill',
  've-rgi-classification',
  'cif-duty-liquidation',
  'chat-manifest-analysis',
  'oga-compliance-review',
]);

export function ToolActivityList({ items }: { items: readonly ToolActivityItem[] }) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const hasDomainTools = items.some((item) => !INTERNAL_SKILL_TOOLS.has(item.toolName));
  const visible = items.filter((item) => {
    if (item.isError) return true;
    if (!INTERNAL_SKILL_TOOLS.has(item.toolName)) return true;
    return !item.completed && !hasDomainTools;
  });

  if (visible.length === 0) return null;

  const errorItems = visible.filter((item) => item.isError);
  const runningItems = visible.filter((item) => !item.completed && !item.isError);
  const completedItems = visible.filter((item) => item.completed && !item.isError);
  const activeItem = runningItems[runningItems.length - 1];

  return (
    <div className="space-y-1.5" aria-live="polite">
      {activeItem ? (
        <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-accent-border bg-accent-soft/60 px-2.5 py-1 text-[11px] font-medium text-accent-ink">
          <Loader2 className="h-3 w-3 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <span className="truncate">
            {getEveToolActivity(activeItem.toolName, false, activeItem.args, activeItem.preliminaryPhase).label}
          </span>
        </div>
      ) : null}

      {errorItems.map((item) => {
        const { label, detail } = getEveToolActivity(item.toolName, true, item.args, item.preliminaryPhase, true);
        return (
          <div
            key={item.toolCallId}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--color-error-border)] bg-[var(--color-error-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-error)]"
          >
            <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
            {detail ? <span className="max-w-36 truncate font-mono text-[10px] opacity-80">{detail}</span> : null}
          </div>
        );
      })}

      {!activeItem && errorItems.length === 0 && completedItems.length === 1 ? (
        (() => {
          const single = completedItems[0]!;
          const { label, detail } = getEveToolActivity(single.toolName, true, single.args, single.preliminaryPhase);
          return (
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted/80 px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
              <span className="truncate">{label}</span>
              {detail ? <span className="max-w-36 truncate font-mono text-[10px] text-ink-muted">{detail}</span> : null}
            </div>
          );
        })()
      ) : null}

      {!activeItem && errorItems.length === 0 && completedItems.length > 1 ? (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted/80 px-2.5 py-1 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <CheckCircle2 className="h-3 w-3 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
            <span>Completado · {completedItems.length} pasos</span>
            {expanded ? <ChevronUp className="h-3 w-3 opacity-70" aria-hidden="true" /> : <ChevronDown className="h-3 w-3 opacity-70" aria-hidden="true" />}
          </button>
          {expanded ? (
            <div className="flex flex-wrap gap-1.5">
              {completedItems.map((item) => {
                const { label, detail } = getEveToolActivity(item.toolName, true, item.args, item.preliminaryPhase);
                return (
                  <div
                    key={item.toolCallId}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted/60 px-2.5 py-1 text-[11px] text-ink-secondary"
                  >
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
                    <span className="truncate">{label}</span>
                    {detail ? <span className="max-w-36 truncate font-mono text-[10px] text-ink-muted">{detail}</span> : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
