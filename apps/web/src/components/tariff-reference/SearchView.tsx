import { Search } from 'lucide-react';
import { TariffSearchResult } from '@/types/tariff-reference';

interface SearchViewProps {
  searchQuery: string;
  searchResults: TariffSearchResult[];
  onSelect: (item: TariffSearchResult) => void;
}

export function SearchView({ searchQuery, searchResults, onSelect }: SearchViewProps) {
  if (!searchQuery) return null;

  if (searchResults.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-lo)]">
        <Search className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-lo)' }} />
        <p>No se encontraron resultados para "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
        {searchResults.length} resultado(s) para "{searchQuery}"
      </h3>
      <div className="space-y-2">
        {searchResults.slice(0, 50).map((result) => (
          <button
            key={result.code}
            onClick={() => onSelect(result)}
            className="w-full p-3 rounded-lg text-left transition-colors hover:bg-[var(--surface-raised)] border"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            aria-label={`Seleccionar ${result.code}: ${result.descriptionEs || result.description}`}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[var(--brand)]">{result.code}</span>
              <span className="text-sm truncate">{result.descriptionEs || result.description}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-lo)] mt-1">
              <span className="font-mono">{result.chapter}</span>
              <span>•</span>
              <span>{result.heading}</span>
            </div>
          </button>
        ))}
        {searchResults.length > 50 && (
          <div className="text-center text-xs text-[var(--text-lo)] mt-2">
            +{searchResults.length - 50} resultados más
          </div>
        )}
      </div>
    </div>
  );
}
