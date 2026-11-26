import Link from 'next/link';

export interface BrandMarkProps {
  subtitle?: string;
  href?: string;
}

export function BrandMark({ subtitle = 'Inteligencia Arancelaria', href = '/' }: BrandMarkProps) {
  const content = (
    <>
      <span className="w-8 h-8 rounded-lg bg-surface-inverted text-ink-on-inverted text-xs font-bold flex items-center justify-center shrink-0">
        T
      </span>
      <div className="leading-tight">
        <span className="text-sm font-bold tracking-tight text-ink-primary block">
          TariffOS
        </span>
        {subtitle ? (
          <span className="text-[10px] text-ink-muted hidden sm:block">{subtitle}</span>
        ) : null}
      </div>
    </>
  );

  return (
    <Link href={href} className="inline-flex items-center gap-2.5 shrink-0">
      {content}
    </Link>
  );
}
