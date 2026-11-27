'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OfficialScheduleAuditBarProps {
  hsCode: string;
  verified: boolean;
  jurisdictionName: string;
  discrepancyDetail?: string;
  embedded?: boolean;
}

export function OfficialScheduleAuditBar({
  hsCode,
  verified,
  jurisdictionName,
  discrepancyDetail,
  embedded = false,
}: OfficialScheduleAuditBarProps) {
  const [expanded, setExpanded] = useState(!verified);

  useEffect(() => {
    setExpanded(!verified);
  }, [verified]);

  return (
    <div
      className={cn(
        'text-xs',
        embedded
          ? verified
            ? 'bg-emerald-500/[0.03] px-5 py-2.5'
            : 'border-l-2 border-l-amber-500 bg-amber-500/[0.06] px-5 py-2.5'
          : verified
            ? 'rounded-xl border border-emerald-300/70 bg-emerald-50/60 px-3.5 py-2 dark:border-emerald-900/50 dark:bg-emerald-950/20'
            : 'rounded-xl border border-amber-300 bg-amber-50/80 px-3.5 py-2 dark:border-amber-900/60 dark:bg-amber-950/25',
      )}
    >
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md text-left focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
      >
        <span className="flex min-w-0 items-center gap-2">
          {verified ? (
            <CheckCircle2
              className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          ) : (
            <AlertTriangle
              className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
          )}
          <span className="font-medium text-ink-primary">
            {verified ? 'Arancel oficial verificado · ' : 'Discrepancia detectada en arancel oficial ('}
            <span translate="no" className="font-mono">
              {hsCode}
            </span>
            {verified ? '' : ')'}
          </span>
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
        )}
      </button>

      {expanded ? (
        <div className="mt-2 space-y-1 border-t border-border-hairline pt-2 text-[11px] text-ink-secondary">
          <div>
            <span className="font-semibold text-ink-primary">Autoridad:</span> {jurisdictionName}
          </div>
          {discrepancyDetail ? (
            <div className="font-medium text-amber-900 dark:text-amber-200">
              {discrepancyDetail}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
