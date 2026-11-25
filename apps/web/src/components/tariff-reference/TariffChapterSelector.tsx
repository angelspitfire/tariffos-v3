'use client';

import { Search as SearchIcon } from 'lucide-react';

interface TariffChapterSelectorProps {
  chapters: { code: string; title: string }[];
  selected: string[];
  onToggle: (code: string, checked: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function TariffChapterSelector({
  chapters,
  selected,
  onToggle,
  search,
  onSearchChange,
}: TariffChapterSelectorProps) {
  const selectedCodes = new Set(selected);
  const filtered = chapters.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
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
          placeholder="Buscar capitulo..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded border border-zinc-700 bg-zinc-900/50 text-xs text-text-hi placeholder-text-placeholder focus:border-brand focus:outline-none"
        />
      </div>
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filtered.length === 0 ? (
          <p className="text-[11px] text-text-lo">Sin capitulos que coincidan</p>
        ) : (
          filtered.map((c) => (
            <label
              key={c.code}
              className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-zinc-800/50 cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCodes.has(c.code)}
                  onChange={(e) => onToggle(c.code, e.target.checked)}
                  className="rounded border-zinc-600 bg-zinc-900 text-brand focus:ring-brand"
                />
                <span className="text-sm text-text-hi">{c.title}</span>
                <span className="text-[10px] font-mono text-text-lo">{c.code}</span>
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
