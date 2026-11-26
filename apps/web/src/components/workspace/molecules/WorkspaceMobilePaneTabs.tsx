'use client';

import { FileText, MessageSquare } from 'lucide-react';

export interface WorkspaceMobilePaneTabsProps {
  activePane: 'chat' | 'canvas';
  onSelectPane: (pane: 'chat' | 'canvas') => void;
}

/** Mobile bottom tab switcher between Chat and Dictamen Canvas. */
export function WorkspaceMobilePaneTabs({
  activePane,
  onSelectPane,
}: WorkspaceMobilePaneTabsProps) {
  return (
    <nav
      aria-label="Cambiar vista móvil"
      className="no-print grid grid-cols-2 border-t border-line-frost bg-surface-frost lg:hidden"
    >
      {(
        [
          { id: 'chat', label: 'Chat', Icon: MessageSquare },
          { id: 'canvas', label: 'Dictamen', Icon: FileText },
        ] as const
      ).map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelectPane(id)}
          className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium ${
            activePane === id ? 'text-accent-ink' : 'text-ink-muted'
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" /> {label}
        </button>
      ))}
    </nav>
  );
}