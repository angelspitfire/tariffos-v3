'use client';

interface ConfidenceBadgeProps {
  label?: string;
  pct?: number;
  className?: string;
}

const HIGH_THRESHOLD = 85;
const MEDIUM_THRESHOLD = 65;

function resolveTone(label?: string, pct?: number): string {
  const normalized = (label ?? '').toLowerCase();
  if (typeof pct === 'number') {
    if (pct >= HIGH_THRESHOLD) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25';
    if (pct >= MEDIUM_THRESHOLD) return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25';
    return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25';
  }
  if (normalized.includes('alt')) {
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25';
  }
  if (normalized.includes('med')) {
    return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25';
  }
  return 'bg-surface-subtle text-ink-secondary border-border-subtle';
}

export function ConfidenceBadge({ label, pct, className = '' }: ConfidenceBadgeProps) {
  const display =
    label && typeof pct === 'number' && !label.includes('%')
      ? `${label} (${Math.round(pct)}%)`
      : label ?? (typeof pct === 'number' ? `${Math.round(pct)}%` : 'Confianza');

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums ${resolveTone(label, pct)} ${className}`}
    >
      {display}
    </span>
  );
}
