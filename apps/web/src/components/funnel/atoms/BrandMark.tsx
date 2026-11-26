import Link from 'next/link';

export interface BrandMarkProps {
  href?: string;
  showBadge?: boolean;
}

export function BrandMark({ href = '/', showBadge = true }: BrandMarkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 text-ink-primary whitespace-nowrap shrink-0 focus:outline-none"
    >
      <span className="h-7 px-2.5 rounded-full bg-surface-inverted text-ink-on-inverted inline-flex items-center gap-1 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent-brand dark:bg-sky-400" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-ink-primary">
        TariffOS
      </span>
      {showBadge ? (
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md border border-border-subtle font-mono text-[10px] text-ink-muted">
          RGI + HITL
        </span>
      ) : null}
    </Link>
  );
}
