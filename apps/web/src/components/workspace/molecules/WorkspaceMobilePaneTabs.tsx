'use client';

import { FileText, MessageSquare } from 'lucide-react';

export interface WorkspaceMobilePaneTabsProps {
  activePane: 'chat' | 'canvas';
  canvasLabel?: 'Dictamen' | 'Lote';
  onSelectPane: (pane: 'chat' | 'canvas') => void;
}

/** Mobile bottom tab switcher between Chat and Dictamen/Lote Canvas. */
export function WorkspaceMobilePaneTabs({
  activePane,
  canvasLabel = 'Dictamen',
  onSelectPane,
}: WorkspaceMobilePaneTabsProps) {
  return (
    <nav
      aria-label="Cambiar vista móvil"
      className="no-print z-30 grid shrink-0 grid-cols-2 border-t border-line-frost bg-surface-frost pb-[max(0.625rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      {(
        [
          { id: 'chat', label: 'Chat', Icon: MessageSquare },
          { id: 'canvas', label: canvasLabel, Icon: FileText },
        ] as const
      ).map(({ id, label, Icon }) => {
        const isActive = activePane === id;
        return (
          <button
            key={id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelectPane(id)}
            className={`flex cursor-pointer items-center justify-center gap-1.5 pt-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${
              isActive ? 'text-accent-ink' : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" /> {label}
          </button>
        );
      })}
    </nav>
  );
}