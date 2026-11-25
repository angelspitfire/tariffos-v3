'use client';

import * as React from 'react';
import { type TariffSearchResult } from '@/types/tariff-reference';
import { cn } from '@/lib/utils';
import { Search, X, Loader2 } from 'lucide-react';
import { TariffSearchSuggestions } from './TariffSearchSuggestions';
import { DEBOUNCE_MS, filterItems } from './tariff-search-utils';

interface TariffSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: TariffSearchResult) => void;
  items: TariffSearchResult[];
  placeholder?: string;
  disabled?: boolean;
}

export function TariffSearch({
  value,
  onChange,
  onSelect,
  items,
  placeholder = 'Buscar arancel...',
  disabled = false,
}: TariffSearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = React.useState(false);
  const [highlighted, setHighlighted] = React.useState(-1);
  const [isSearching, setIsSearching] = React.useState(false);
  const [filtered, setFiltered] = React.useState<TariffSearchResult[]>([]);

  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced filtering (300ms)
  React.useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const q = value.trim();
    if (q.length === 0) {
      setFiltered([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    timeoutRef.current = setTimeout(() => {
      setFiltered(filterItems(items, q));
      setIsSearching(false);
      setExpanded(true);
    }, DEBOUNCE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, items]);

  // Click outside to close dropdown
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setExpanded(true);
    setHighlighted(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setExpanded(false);
      setHighlighted(-1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((p) => (p >= filtered.length - 1 ? 0 : p + 1));
      setExpanded(true);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((p) => (p <= 0 ? filtered.length - 1 : p - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted >= 0 && filtered[highlighted]) {
        onSelect(filtered[highlighted]);
        setExpanded(false);
      }
      return;
    }
  };

  const handleItemClick = (item: TariffSearchResult) => {
    onSelect(item);
    setExpanded(false);
    setHighlighted(-1);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setFiltered([]);
    setExpanded(false);
    setHighlighted(-1);
    setIsSearching(false);
    inputRef.current?.focus();
  };

  const hasContent = value.trim().length > 0;
  return (
    <div ref={containerRef} className="relative w-full inline-block">
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={expanded && hasContent}
          aria-controls="tariff-search-listbox"
          aria-activedescendant={
            highlighted >= 0 ? `tariff-search-option-${highlighted}` : undefined
          }
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setExpanded(hasContent)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border border-solid transition-all focus-visible:outline-none focus-visible:ring-1',
            'bg-[var(--surface)] text-[var(--text-hi)] placeholder-[var(--text-placeholder)]',
            'border-[var(--border)] focus-visible:border-[var(--brand)] focus-visible:ring-[var(--brand-glow)]',
            'pl-10 pr-10 py-3 text-sm',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          style={{ borderColor: 'var(--border)' }}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-[var(--text-lo)]">
          <Search data-testid="search-icon" className="w-4 h-4" />
        </div>
        {hasContent && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpiar busqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--surface-active)] rounded-md text-[var(--text-lo)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 data-testid="loading-spinner" className="w-4 h-4 animate-spin text-[var(--brand)]" />
          </div>
        )}
      </div>

      {expanded && hasContent && !disabled && (
        <TariffSearchSuggestions
          items={filtered}
          query={value}
          highlighted={highlighted}
          onSelect={handleItemClick}
          onItemHover={setHighlighted}
          disabled={disabled}
        />
      )}
    </div>
  );
}
