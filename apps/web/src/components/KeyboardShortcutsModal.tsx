'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

import { shortcuts, categoryLabels } from './KeyboardShortcutsConstants';

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  onToggle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Use shared hook for global keyboard listener — ? toggles the modal
  useKeyboardShortcuts({ onToggleModal: onToggle ?? onClose });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredShortcuts = useMemo(() =>
    shortcuts.filter((s) =>
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [searchTerm]
  );

  return (
    <div
      className="fixed inset-0 z-50 hidden items-center justify-center"
      id="keyboard-shortcuts-modal"
    >
      {isOpen && (
        <div
          className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-modal-title"
        >
          <h2 id="shortcuts-modal-title" className="text-lg font-semibold text-[var(--text-hi)] mb-4">
            Keyboard Shortcuts
          </h2>

          <div className="space-y-4">
            {/* Search/filter at top */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[var(--text-lo)]" />
                <input
                  type="text"
                  placeholder="Search shortcuts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-[var(--input)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            {categoryLabels.navigation && (
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--text-lo)] mb-2">Navigation</p>
                <div className="space-y-1">
                  {filteredShortcuts
                    .filter((s) => s.category === 'navigation')
                    .map((s) => (
                      <div
                        key={s.key}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--surface-raised)] transition-colors"
                      >
                        <span className="font-medium text-mono w-16">{s.key}</span>
                        <span>{s.description}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {categoryLabels.edition && (
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--text-lo)] mb-2">Edition</p>
                <div className="space-y-1">
                  {filteredShortcuts
                    .filter((s) => s.category === 'edition')
                    .map((s) => (
                      <div
                        key={s.key}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--surface-raised)] transition-colors"
                      >
                        <span className="font-medium text-mono w-16">{s.key}</span>
                        <span>{s.description}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {categoryLabels.actions && (
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--text-lo)] mb-2">Actions</p>
                <div className="space-y-1">
                  {filteredShortcuts
                    .filter((s) => s.category === 'actions')
                    .map((s) => (
                      <div
                        key={s.key}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--surface-raised)] transition-colors"
                      >
                        <span className="font-medium text-mono w-16">{s.key}</span>
                        <span>{s.description}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {categoryLabels.ai && (
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--text-lo)] mb-2">AI/Chat</p>
                <div className="space-y-1">
                  {filteredShortcuts
                    .filter((s) => s.category === 'ai')
                    .map((s) => (
                      <div
                        key={s.key}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--surface-raised)] transition-colors"
                      >
                        <span className="font-medium text-mono w-16">{s.key}</span>
                        <span>{s.description}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Always visible trigger hint at bottom */}
      <div
        className="fixed bottom-4 left-4 right-4 flex justify-center pt-2"
        style={{ pointerEvents: 'auto' }}
      >
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors hover:bg-[var(--brand)]"
          aria-label="Close"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          <span>Ready</span>
        </button>
      </div>
    </div>
  );
}
