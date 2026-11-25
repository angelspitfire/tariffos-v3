import { type TariffSearchResult } from '@/types/tariff-reference';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { matchIndices, highlight } from './tariff-search-utils';

// ─── Types ───
interface TariffSearchSuggestionsProps {
  items: TariffSearchResult[];
  query: string;
  highlighted: number;
  onSelect: (item: TariffSearchResult) => void;
  onItemHover: (index: number) => void;
  disabled?: boolean;
}

// ─── Component ───
export function TariffSearchSuggestions({
  items,
  query,
  highlighted,
  onSelect,
  onItemHover,
  disabled = false,
}: TariffSearchSuggestionsProps) {
  const handleItemClick = (item: TariffSearchResult) => {
    onSelect(item);
  };

  if (disabled) {
    return null;
  }

  return (
    <ul
      id="tariff-search-listbox"
      role="listbox"
      aria-label="Sugerencias de arancel"
      className={cn(
        'absolute z-20 w-full mt-1 rounded-xl border border-solid border-[var(--border)] bg-[var(--surface)] shadow-xl',
        'max-h-64 overflow-y-auto',
      )}
    >
      {items.length === 0 ? (
        <li role="none" className="px-4 py-2 text-[11px] text-[var(--text-mid)]">
          No se encontraron resultados
        </li>
      ) : (
        items.map((item, i) => {
          const codeIndices = matchIndices(item.code, query);
          const descIndices = matchIndices(item.description, query);
          const active = i === highlighted;
          return (
            <li
              key={item.code}
              role="option"
              id={`tariff-search-option-${i}`}
              aria-selected={active}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => onItemHover(i)}
              className={cn(
                'flex items-center justify-between px-4 py-3 cursor-pointer transition-colors',
                active
                  ? 'bg-[var(--brand)] text-[var(--text-hi)]'
                  : 'text-[var(--text-mid)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-hi)]',
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono-numbers text-xs font-semibold tabular">
                    {highlight(item.code, codeIndices)}
                  </span>
                </div>
                <p className="text-[11px] leading-tight">{highlight(item.description, descIndices)}</p>
              </div>
              <ChevronDown
                className={`w-3 h-3 ${active ? 'text-[var(--text-hi)]' : 'text-[var(--text-lo)]'}`}
              />
            </li>
          );
        }))
      }
    </ul>
  );
}
