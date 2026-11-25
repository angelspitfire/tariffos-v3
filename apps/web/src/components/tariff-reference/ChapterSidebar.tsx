'use client';

import { useMemo } from 'react';
import { Scale, Search } from 'lucide-react';
import { TariffChapter } from '@/types/tariff-reference';

interface ChapterSidebarProps {
  chapters: readonly TariffChapter[];
  selectedChapterCode: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ChapterSidebar({ 
  chapters, 
  selectedChapterCode,
  searchQuery,
  onSearchChange 
}: ChapterSidebarProps) {
  const filteredChapters = useMemo(() => {
    if (!searchQuery) return chapters;
    const q = searchQuery.toLowerCase();
    return chapters.filter(ch => 
      ch.code.toLowerCase().includes(q) ||
      ch.title.toLowerCase().includes(q) ||
      (ch.descriptionEs || '').toLowerCase().includes(q)
    );
  }, [chapters, searchQuery]);

  const getBorderStyle = (active: boolean) => {
    return active ? '2px solid var(--brand)' : '2px solid transparent';
  };

  const getClassName = (active: boolean) => {
    const base = 'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full text-left';
    const activeClass = 'bg-[var(--surface-active)] text-[var(--text-hi)] border-l-2 border-l-[var(--brand)]';
    const inactiveClass = 'text-[var(--text-mid)] hover:bg-white/5 hover:text-[var(--text-hi)]';
    return base + ' ' + (active ? activeClass : inactiveClass);
  };

  const renderChapter = (chapter: TariffChapter) => {
    const active = selectedChapterCode === chapter.code;
    const className = getClassName(active);
    const borderStyle = getBorderStyle(active);
    
    return (
      <button
        key={chapter.code}
        onClick={() => window.dispatchEvent(new CustomEvent('tariff:select-chapter', { detail: chapter.code }))}
        className={className}
        style={{ borderLeft: borderStyle }}
      >
        <span className="font-mono text-xs text-[var(--brand)]">{chapter.code}</span>
        <span className="text-sm font-medium truncate">{chapter.descriptionEs || chapter.title}</span>
      </button>
    );
  };

  const renderChapters = () => {
    return filteredChapters.map((chapter) => renderChapter(chapter));
  };

  return (
    <aside className="flex flex-col h-full w-64 min-w-[280px] max-w-[320px]" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-5 h-5 text-[var(--brand)]" />
          <h2 className="text-sm font-semibold text-[var(--text-hi)]">Arancel SENIAT</h2>
        </div>
        <p className="text-xs text-[var(--text-lo)] mb-3">Marco Legal Arancelario Venezolano</p>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-lo)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar capítulo..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border bg-[var(--surface-raised)] text-white placeholder:text-[var(--text-lo)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            style={{ borderColor: 'var(--border)' }}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Capítulos del Arancel">
        {filteredChapters.length === 0 ? (
          <p className="text-center text-xs text-[var(--text-lo)] py-8">No se encontraron capítulos</p>
        ) : (
          renderChapters()
        )}
      </nav>

      <div className="p-3 border-t text-xs text-[var(--text-lo)]" style={{ borderColor: 'var(--border)' }}>
        <p className="font-medium">Arancel Oficial SENIAT</p>
        <p className="mt-1">Venezuela • Vigente 2024</p>
        <p className="mt-2 text-[var(--brand)]">Capítulos: {chapters.length}</p>
      </div>
    </aside>
  );
}
