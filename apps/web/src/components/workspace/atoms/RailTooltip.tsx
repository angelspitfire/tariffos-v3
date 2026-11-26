import type { ReactNode } from 'react';

export interface RailTooltipProps {
  label: string;
  children: ReactNode;
}

/** Hover/focus tooltip shown to the right of a collapsed-rail control. */
export function RailTooltip({ label, children }: RailTooltipProps) {
  return (
    <div className="group relative">
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-full border border-border-subtle bg-surface-tooltip px-2.5 py-1 text-[11px] font-medium text-ink-tooltip opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}
