'use client';

import { Search as SearchIcon } from 'lucide-react';

interface TariffUnitSelectorProps {
  units: string[];
  selected: string[];
  onToggle: (code: string, checked: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function TariffUnitSelector({
  units,
  selected,
  onToggle,
  search,
  onSearchChange,
}: TariffUnitSelectorProps) {
  const selectedUnits = new Set(selected);
  const filtered = units.filter((u) =>
    u.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <SearchIcon
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lo"
        />
        <input
          type="text"
          placeholder="Buscar unidad..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded border border-zinc-700 bg-zinc-900/50 text-xs text-text-hi placeholder-text-placeholder focus:border-brand focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-3 gap-1">
        {filtered.map((u) => (
          <label
            key={u}
            className="flex items-center justify-center px-2 py-1.5 rounded hover:bg-zinc-800/50 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selectedUnits.has(u)}
              onChange={(e) => onToggle(u, e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-900 text-brand focus:ring-brand"
            />
            <span className="ml-1.5 text-sm font-mono text-text-hi">{u}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
