import { useMemo, useState, useEffect } from "react";
import { TariffSearch } from "./TariffSearch";
import { TariffTree } from "./TariffTree";
import { TariffTable } from "./TariffTable";
import { TariffDetail } from "./TariffDetail";
import { TariffFilters } from "./TariffFilters";
import { TariffFavoritesHistory } from "./TariffFavoritesHistory";
import { TariffSearchSuggestions } from "./TariffSearchSuggestions";
import { useTariffReference } from "./TariffReferenceProvider";
import { type TariffSearchResult, type TariffItem } from "@/types/tariff-reference";
import { TARIFF_REF_TABS } from "./constants";
import { X } from "lucide-react";
import { MOCK_TARIFF_CHAPTERS } from '@/__mocks__';

export interface TariffReferenceViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem?: (item: TariffSearchResult) => void;
}

export function TariffReferenceView(props: TariffReferenceViewProps) {
  const { isOpen, onClose } = props;
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    filters,
    setFilters,
    selectedItem,
    selectItem,
    favorites,
    history,
  } = useTariffReference();

  const showSuggestions = searchQuery.length > 0 && searchResults.length > 0;
  const [suggestionHighlighted, setSuggestionHighlighted] = useState(-1);

  const filteredItems = useMemo(() => {
    let items = MOCK_TARIFF_CHAPTERS.flatMap((chapter) =>
      chapter.headings.flatMap((heading) =>
        heading.subheadings.flatMap((sub) =>
          sub.items.map((item) => ({
            item,
            chapter: chapter.code,
            heading: heading.code,
            subheading: sub.code,
          }))
        )
      ));

    if (filters.query) {
      const q = filters.query.toLowerCase();
      items = items.filter(
        (r) =>
          r.item.code.toLowerCase().includes(q) ||
          r.item.description.toLowerCase().includes(q) ||
          (r.item.descriptionEs ?? "").toLowerCase().includes(q)
      );
    }
    if (filters.chapter && filters.chapter.length > 0) {
      items = items.filter((r) => filters.chapter.includes(r.chapter));
    }
    if (filters.status && filters.status.length > 0) {
      items = items.filter((r) => filters.status!.includes(r.item.status));
    }
    if (filters.dutyRange) {
      items = items.filter(
        (r) =>
          r.item.dutyAdValorem >= filters.dutyRange![0] &&
          r.item.dutyAdValorem <= filters.dutyRange![1]
      );
    }
    return items;
  }, [filters]);

  const allItemsMap = useMemo(() => {
    const map = new Map<string, TariffItem>();
    MOCK_TARIFF_CHAPTERS.forEach((c) => {
      c.headings.forEach((h) => {
        h.subheadings.forEach((s) => {
          s.items.forEach((item) => {
            map.set(item.code, item);
          });
        });
      });
    });
    return map;
  }, []);

  const codeCount = useMemo(() => {
    let count = 0;
    MOCK_TARIFF_CHAPTERS.forEach((c) => {
      c.headings.forEach((h) => {
        h.subheadings.forEach((s) => {
          count += s.items.length;
        });
      });
    });
    return count;
  }, []);

  const codeCountText = codeCount.toString() + " codigos";

  if (!isOpen) return null;

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchResultSelect = (result: TariffSearchResult) => {
    selectItem(result.item);
    setSearchResults([]);
  };

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement && !e.target.closest('[role="dialog"]')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  
  return (
    <div className="fixed inset-0 z-50 flex flex-col" role="dialog" aria-label="Arancel Oficial SENIAT">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} aria-hidden="true" />

      <aside role="dialog" aria-label="Arancel Oficial SENIAT" className="w-full max-w-4xl flex flex-col shadow-2xl animate-in slide-in-from-right duration-300" style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)" }}>
        <header className="h-12 shrink-0 flex items-center justify-between px-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-zinc-100">Arancel Oficial SENIAT</h2>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--purple-subtle)] text-[var(--purple-text)]">
              {codeCountText}
            </span>
          </div>
          <button onClick={onClose} aria-label="Cerrar arancel" className="w-7 h-7 rounded flex items-center justify-center transition-colors" style={{ color: "var(--text-lo)" }}>
            <X size={18} />
          </button>
        </header>

        <nav className="h-10 shrink-0 flex items-center gap-1 px-2" style={{ borderBottom: "1px solid var(--border)" }}>
          {TARIFF_REF_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={"flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors " + (activeTab === tab.id ? "bg-white/5 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50")}>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-auto">
          {activeTab === "buscar" && (
            <div className="p-4 space-y-4">
              <TariffSearch value={searchQuery} onChange={handleSearchChange} onSelect={handleSearchResultSelect} items={filteredItems.map((f) => ({ ...f.item, item: f.item, chapter: f.chapter, heading: f.heading, subheading: f.subheading }))} placeholder="Buscar por codigo o descripcion..." />
              {showSuggestions && <TariffSearchSuggestions items={searchResults} query={searchQuery} highlighted={suggestionHighlighted} onSelect={handleSearchResultSelect} onItemHover={setSuggestionHighlighted} />}
              <TariffTable items={filteredItems.map((f) => f.item)} selectedCode={selectedItem?.code} onSelect={selectItem} sortConfig={null} onSort={() => undefined} />
            </div>
          )}

          {activeTab === "explorar" && (
            <div className="flex h-full">
              <TariffTree chapters={MOCK_TARIFF_CHAPTERS} selectedCode={selectedItem?.code ?? null} onSelectItem={(item) => selectItem(item)} />
              <div className="flex-1 border-l" style={{ borderColor: "var(--border)" }}>
                {selectedItem ? (
                  <TariffDetail item={selectedItem} isFavorite={favorites.some((f) => f.code === selectedItem.code)} onFavoriteToggle={() => undefined} onExport={() => undefined} />
                ) : (
                  <div className="flex h-full items-center justify-center p-8 text-center">
                    <p className="text-zinc-400">Seleccione un codigo para ver detalles</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "favoritos" && (
            <TariffFavoritesHistory favorites={favorites} history={[]} allItems={allItemsMap} onSelect={(code) => { const item = allItemsMap.get(code); if (item) selectItem(item); }} onRemoveFavorite={() => undefined} onClearHistory={() => undefined} activeTab="favorites" onTabChange={() => undefined} />
          )}

          {activeTab === "historial" && (
            <TariffFavoritesHistory favorites={[]} history={history} allItems={allItemsMap} onSelect={(code) => { const item = allItemsMap.get(code); if (item) selectItem(item); }} onRemoveFavorite={() => undefined} onClearHistory={() => undefined} activeTab="history" onTabChange={() => undefined} />
          )}
        </div>

        <TariffFilters filters={filters} onChange={setFilters} chapters={MOCK_TARIFF_CHAPTERS.map((c) => ({ code: c.code, title: c.title }))} units={[]} clearAll={() => undefined} />
      </aside>
    </div>


);
}

