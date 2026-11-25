'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';

interface TariffFiltersSectionProps {
  label: string;
  icon: React.ReactNode;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function TariffFiltersSection({
  label,
  icon,
  count,
  expanded,
  onToggle,
  children,
}: TariffFiltersSectionProps) {
  return (
    <div className="border border-border rounded-xl bg-surface overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-hi transition-colors hover:bg-zinc-800/50"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
          {count != null && count > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-text-mid">
              {count}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expanded && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}
