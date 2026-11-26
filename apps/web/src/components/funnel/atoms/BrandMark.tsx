import Link from 'next/link';

export interface BrandMarkProps {
  href?: string;
  showBadge?: boolean;
  size?: 'sm' | 'md';
}

const PILL_SIZE = {
  sm: 'h-6 px-2',
  md: 'h-7 px-2.5',
} as const;

const WORDMARK_SIZE = {
  sm: 'text-sm',
  md: 'text-[15px]',
} as const;

/** TariffOS logo: dark pill with a white and a brand-blue dot, plus the wordmark. */
export function BrandMark({ href = '/', showBadge = true, size = 'md' }: BrandMarkProps) {
  return (
    <Link
      href={href}
      aria-label="TariffOS, ir al inicio"
      className="inline-flex items-center gap-2 text-ink-primary whitespace-nowrap shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand"
    >
      <span
        className={`${PILL_SIZE[size]} rounded-full bg-surface-inverted text-ink-on-inverted inline-flex items-center gap-1 shrink-0`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent-brand dark:bg-sky-400" />
      </span>
      <span className={`${WORDMARK_SIZE[size]} font-semibold tracking-tight text-ink-primary`}>
        TariffOS
      </span>
      {showBadge ? (
        <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-md border border-border-subtle font-mono text-[10px] text-ink-muted">
          RGI 1–6 · VE
        </span>
      ) : null}
    </Link>
  );
}
