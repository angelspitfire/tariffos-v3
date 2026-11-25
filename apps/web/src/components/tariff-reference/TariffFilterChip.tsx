'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TariffFilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

export function TariffFilterChip({
  label,
  value,
  onRemove,
}: TariffFilterChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium',
        'border-[var(--border-brand)] bg-[rgba(99,102,241,0.10)] text-[var(--brand-accent)]'
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-1 p-0.5 rounded hover:bg-zinc-700 text-text-lo"
        aria-label={`Eliminar filtro ${value}`}
      >
        <X size={12} />
      </button>
    </span>
  );
}
