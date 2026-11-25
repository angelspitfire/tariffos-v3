'use client';

import { useState } from 'react';
import type { TariffChapter, TariffHeading, TariffSubheading, TariffItem } from '@/types/tariff-reference';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface TariffTreeNodeProps {
  node: { code: string; description: string; descriptionEs?: string };
  depth: number;
  onSelect: (code: string) => void;
  isLeaf: boolean;
  selectedCode: string | null;
}

function TariffTreeNode({ node, depth, onSelect, isLeaf, selectedCode }: TariffTreeNodeProps) {
  const isSelected = selectedCode === node.code;
  return (
    <div
      onClick={() => onSelect(node.code)}
      className="flex items-center gap-2 px-3 py-2 text-[11px] rounded-lg cursor-pointer transition-colors select-none group"
      style={{
        paddingLeft: `${12 + depth * 16}px`,
        background: isSelected ? 'var(--surface-active)' : 'transparent',
        color: isSelected ? 'var(--text-hi)' : 'var(--text-mid)',
        border: isSelected ? '1px solid var(--border-brand)' : 'none',
      }}
    >
      {!isLeaf && (
        <span className="shrink-0 text-[9px]" style={{ color: 'var(--text-lo)' }}>
          ▸
        </span>
      )}
      <span className="truncate min-w-0">{node.descriptionEs || node.description}</span>
      <span
        className="ml-auto shrink-0 tabular text-[9px] font-medium"
        style={{ color: 'var(--text-lo)' }}
      >
        {node.code}
      </span>
    </div>
  );
}

interface TariffTreeProps {
  chapters: readonly TariffChapter[];
  onSelectItem: (item: TariffItem) => void;
  selectedCode: string | null;
}

export function TariffTree({
  chapters,
  onSelectItem,
  selectedCode,
}: TariffTreeProps) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (code: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  return (
    <nav className="flex flex-col h-full min-h-0" aria-label="Arbol arancelario">
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chapters.map((chapter: TariffChapter) => {
          const chapterOpen = open.has(chapter.code);
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
                {chapterOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span className="truncate min-w-0">{chapter.descriptionEs || chapter.title}</span>
                <span className="ml-auto tabular text-[9px] font-medium" style={{ color: 'var(--text-lo)' }}>
                  {chapter.code}
                </span>
              </div>
              {chapterOpen &&
                chapter.headings.map((heading: TariffHeading) => {
                  const headingOpen = open.has(heading.code);
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
                        {headingOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                        <span className="truncate min-w-0">{heading.descriptionEs || heading.description}</span>
                        <span className="ml-auto tabular text-[9px] font-medium" style={{ color: 'var(--text-lo)' }}>
                          {heading.code}
                        </span>
                      </div>
                      {headingOpen &&
                        heading.subheadings.map((subheading: TariffSubheading) => {
                          const subOpen = open.has(subheading.code);
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
                                {subOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                <span className="truncate min-w-0">{subheading.descriptionEs || subheading.description}</span>
                                <span className="ml-auto tabular text-[9px] font-medium" style={{ color: 'var(--text-lo)' }}>
                                  {subheading.code}
                                </span>
                              </div>
                              {subOpen &&
                                subheading.items.map((item) => (
                                  <TariffTreeNode
                                    key={item.code}
                                    node={{ code: item.code, description: item.description, descriptionEs: item.descriptionEs ?? '' }}
                                    depth={3}
                                    onSelect={(code) => {
                                      const it = subheading.items.find((i) => i.code === code);
                                      if (it) onSelectItem(it);
                                    }}
                                    isLeaf
                                    selectedCode={selectedCode}
                                  />
                                ))}
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
