'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OfficialScheduleAuditBarProps {
  hsCode: string;
  verified: boolean;
  jurisdictionName: string;
  discrepancyDetail?: string;
}

export function OfficialScheduleAuditBar({
  hsCode,
  verified,
  jurisdictionName,
  discrepancyDetail,
}: OfficialScheduleAuditBarProps) {
  const [expanded, setExpanded] = useState(!verified);

  useEffect(() => {
    setExpanded(!verified);
  }, [verified]);

  return (
    <div
      className={cn(
        'rounded-xl border px-3.5 py-2 text-xs',
        verified
          ? 'border-emerald-300/70 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20'
          : 'border-amber-300 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/25',
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          {verified ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          )}
          <span className="font-medium text-ink-primary">
            {verified
              ? `Arancel oficial verificado · ${hsCode}`
              : `Discrepancia detectada en arancel oficial (${hsCode})`}
          </span>
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
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
