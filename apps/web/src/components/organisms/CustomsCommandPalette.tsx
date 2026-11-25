'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Command, ArrowRight } from 'lucide-react';

export interface CommandPaletteAction {
  id: string;
  category: 'Trámites' | 'Vistas' | 'Acciones';
  title: string;
  subtitle?: string;
  shortcut?: string;
  perform: () => void;
}

export interface CustomsCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: CommandPaletteAction[];
}

export function CustomsCommandPalette({ isOpen, onClose, actions }: CustomsCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = actions.filter((a) => {
    const q = query.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      (a.subtitle?.toLowerCase().includes(q) ?? false) ||
      a.category.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  const handleSelect = (action: CommandPaletteAction) => {
    action.perform();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800 bg-zinc-950/60">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Escribe un comando o busca un trámite..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-400">
            <Command className="w-3 h-3" /> K
          </kbd>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((action, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={action.id}
                  onClick={() => handleSelect(action)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-600/20 text-white border border-indigo-500/40' : 'text-zinc-300 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-medium truncate">{action.title}</span>
                    {action.subtitle && (
                      <span className="text-[10px] text-zinc-500 truncate">{action.subtitle}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      {action.category}
                    </span>
                    <ArrowRight className="w-3 h-3 text-zinc-500" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500">
              No se encontraron comandos para &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Usa <kbd className="text-zinc-400">↑↓</kbd> para navegar</span>
          <span><kbd className="text-zinc-400">Enter</kbd> para ejecutar · <kbd className="text-zinc-400">Esc</kbd> para cerrar</span>
        </div>
      </div>
    </div>
  );
}
