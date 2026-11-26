export interface QuotaProgressBarProps {
  used: number;
  limit: number;
  showNumbers?: boolean;
}

export function QuotaProgressBar({ used, limit, showNumbers = true }: QuotaProgressBarProps) {
  const safeLimit = limit > 0 ? limit : 1;
  const pct = Math.min(100, Math.round((used / safeLimit) * 100));
  const barColor =
    pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-accent-brand';

  return (
    <div className="space-y-1 min-w-[120px]">
      {showNumbers && (
        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
          <span className="text-ink-primary font-semibold">
            {used.toLocaleString('en-US')} / {limit.toLocaleString('en-US')}
          </span>
          <span className="text-ink-muted">{pct}%</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-surface-subtle overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
