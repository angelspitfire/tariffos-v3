'use client';

import { useCallback, useState } from 'react';
import type { TariffChapter, TariffHeading, TariffSubheading, TariffItem } from '@/types/tariff-reference';
import { ChevronRight, ChevronDown, BookOpen } from 'lucide-react';
import { MOCK_TARIFF_CHAPTERS } from '@/__mocks__';

interface TariffTreeProps {
  chapters: readonly TariffChapter[];
  onSelectItem: (item: TariffItem) => void;
  selectedCode: string | null;
}

function renderItem(item: TariffItem, selectedCode: string | null, onSelectItem: (item: TariffItem) => void) {
  return (
    <div
      key={item.code}
      onClick={() => onSelectItem(item)}
      className="flex items-center gap-2 px-3 py-1.5 text-[10px] rounded-lg cursor-pointer transition-colors hover:bg-white/5"
      style={{
        color: 'var(--text-mid)',
        background: selectedCode === item.code ? 'var(--surface-active)' : 'transparent',
      }}
    >
      <span className="font-mono text-[var(--brand)]">{item.code}</span>
      <span className="truncate min-w-0">{item.descriptionEs || item.description}</span>
      <span className="ml-auto tabular text-[9px] font-medium" style={{ color: 'var(--text-lo)' }}>
        {item.dutyAdValorem}%
      </span>
    </div>
  );
}

function renderSubheading(
  subheading: TariffSubheading,
  open: Set<string>,
  selectedCode: string | null,
  toggle: (code: string) => void,
  onSelectItem: (item: TariffItem) => void
) {
  return (
    <div key={subheading.code} className="space-y-1 ml-2 border-l border-white/5 pl-2">
      <div
        onClick={() => toggle(subheading.code)}
        className="flex items-center gap-2 px-2 py-1.5 text-[10px] rounded-lg cursor-pointer transition-colors"
        style={{
          background: selectedCode === subheading.code ? 'var(--surface-active)' : 'transparent',
          color: selectedCode === subheading.code ? 'var(--text-hi)' : 'var(--text-mid)',
        }}
      >
        {open.has(subheading.code) ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <span className="truncate min-w-0">{subheading.descriptionEs || subheading.description}</span>
        <span className="ml-auto tabular text-[9px] font-medium" style={{ color: 'var(--text-lo)' }}>
          {subheading.code}
        </span>
      </div>
      {open.has(subheading.code) && subheading.items.map((item) => renderItem(item, selectedCode, onSelectItem))}
    </div>
  );
}

function renderHeading(
  heading: TariffHeading,
  open: Set<string>,
  selectedCode: string | null,
  toggle: (code: string) => void,
  onSelectItem: (item: TariffItem) => void
) {
  return (
    <div key={heading.code} className="space-y-1 ml-2 border-l border-white/5 pl-2">
      <div
        onClick={() => toggle(heading.code)}
        className="flex items-center gap-2 px-2 py-1.5 text-[10px] rounded-lg cursor-pointer transition-colors"
        style={{
          background: selectedCode === heading.code ? 'var(--surface-active)' : 'transparent',
          color: selectedCode === heading.code ? 'var(--text-hi)' : 'var(--text-mid)',
        }}
      >
        {open.has(heading.code) ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <span className="truncate min-w-0">{heading.descriptionEs || heading.description}</span>
        <span className="ml-auto tabular text-[9px] font-medium" style={{ color: 'var(--text-lo)' }}>
          {heading.code}
        </span>
      </div>
      {open.has(heading.code) && heading.subheadings.map((subheading) =>
        renderSubheading(subheading, open, selectedCode, toggle, onSelectItem)
      )}
    </div>
  );
}

function renderChapter(
  chapter: TariffChapter,
  open: Set<string>,
  selectedCode: string | null,
  toggle: (code: string) => void,
  onSelectItem: (item: TariffItem) => void
) {
  return (
    <div key={chapter.code} className="space-y-1">
      <div
        onClick={() => toggle(chapter.code)}
        className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold rounded-lg cursor-pointer transition-colors"
        style={{
          background: selectedCode === chapter.code ? 'var(--surface-active)' : 'transparent',
          color: selectedCode === chapter.code ? 'var(--text-hi)' : 'var(--text-mid)',
        }}
      >
        {open.has(chapter.code) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="truncate min-w-0">{chapter.descriptionEs || chapter.title}</span>
        <span className="ml-auto tabular text-[9px] font-medium" style={{ color: 'var(--text-lo)' }}>
          {chapter.code}
        </span>
      </div>
      {open.has(chapter.code) && chapter.headings.map((heading) =>
        renderHeading(heading, open, selectedCode, toggle, onSelectItem)
      )}
    </div>
  );
}

export function TariffTree({
  chapters,
  onSelectItem,
  selectedCode,
}: TariffTreeProps) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = useCallback((code: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  if (!chapters.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-lo)' }} />
          <p className="text-[var(--text-lo)]">Seleccione un capitulo para explorar</p>
          <p className="text-xs text-[var(--text-lo)] mt-2">El arancel tiene {MOCK_TARIFF_CHAPTERS.length} capitulos</p>
        </div>
      </div>
    );
  }

  return (
    <nav className="flex flex-col h-full min-h-0" aria-label="Arbol arancelario">
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chapters.map((chapter) => renderChapter(chapter, open, selectedCode, toggle, onSelectItem))}
      </div>
    </nav>
  );
}
