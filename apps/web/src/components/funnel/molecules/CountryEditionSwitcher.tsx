import Link from 'next/link';
import { Globe } from 'lucide-react';

export interface CountryEditionSwitcherProps {
  activeSlug?: 'global' | 've';
  compact?: boolean;
}

export function CountryEditionSwitcher({
  activeSlug = 'global',
  compact = false,
}: CountryEditionSwitcherProps) {
  return (
    <nav
      aria-label="Edición por jurisdicción"
      className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-muted/80 p-0.5 text-[11px] font-medium"
    >
      <Link
        href="/"
        aria-current={activeSlug === 'global' ? 'page' : undefined}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors whitespace-nowrap ${
          activeSlug === 'global'
            ? 'bg-surface-panel font-semibold text-ink-primary shadow-2xs'
            : 'text-ink-secondary hover:text-ink-primary'
        }`}
      >
        <Globe className="h-3 w-3" aria-hidden="true" />
        <span>Global</span>
      </Link>
      <Link
        href="/ve"
        aria-current={activeSlug === 've' ? 'page' : undefined}
        className={`inline-flex items-center rounded-full px-2.5 py-1 transition-colors whitespace-nowrap ${
          activeSlug === 've'
            ? 'bg-surface-panel font-semibold text-ink-primary shadow-2xs'
            : 'text-ink-secondary hover:text-ink-primary'
        }`}
      >
        <span>{compact ? 'VE' : 'Venezuela (VE)'}</span>
      </Link>
    </nav>
  );
}
