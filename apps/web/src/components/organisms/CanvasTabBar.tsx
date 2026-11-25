'use client';

import {
  type A2UIArtifact,
} from '@/types/domain';
import {
  Maximize2,
  Minimize2,
  X,
  Sparkles,
} from 'lucide-react';
import { TAB_ICONS, TAB_STATUS_COLORS, ACTIVE_TAB_BORDER_COLOR } from '@/__mocks__';

export interface CanvasTabBarProps {
  openArtifacts: A2UIArtifact[];
  activeArtifactId: string | null;
  fullscreen: boolean;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onToggleFullscreen: () => void;
  onCloseCanvas?: () => void;
}

function getTabIcon(type: A2UIArtifact['type']) {
  return TAB_ICONS[type] ?? Sparkles;
}

function getStatusColor(type: A2UIArtifact['type']) {
  return TAB_STATUS_COLORS[type] ?? '#6366f1';
}

export function CanvasTabBar({
  openArtifacts,
  activeArtifactId,
  fullscreen,
  onSelectTab,
  onCloseTab,
  onToggleFullscreen,
  onCloseCanvas,
}: CanvasTabBarProps) {
  return (
    <div
      className="shrink-0 h-10 flex items-center justify-between px-2 gap-1.5 overflow-x-auto"
      style={{
        background: 'var(--surface-raised)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Tabs Strip */}
      <div className="flex items-center gap-1 overflow-x-auto min-w-0 py-0.5">
        {openArtifacts.map((art) => {
          const Icon = getTabIcon(art.type);
          const isSelected = art.id === activeArtifactId;
          const dotColor = getStatusColor(art.type);

          return (
            <div
              key={art.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectTab(art.id)}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-t-md text-xs cursor-pointer select-none transition-all border-b-2"
              style={{
                background: isSelected ? 'var(--surface)' : 'transparent',
                borderColor: isSelected ? ACTIVE_TAB_BORDER_COLOR : 'transparent',
                color: isSelected ? 'var(--text-hi)' : 'var(--text-lo)',
                fontWeight: isSelected ? 500 : 400,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
              <Icon size={12} className="shrink-0" />
              <span className="truncate max-w-[110px]">{art.badge}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(art.id);
                }}
                aria-label={`Cerrar pestaña ${art.badge}`}
                className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-zinc-700/50 transition-opacity ml-0.5"
                style={{ color: 'var(--text-lo)' }}
              >
                <X size={10} />
              </button>
            </div>
          );
        })}

        {openArtifacts.length === 0 && (
          <div className="flex items-center gap-1 text-xs px-2" style={{ color: 'var(--text-lo)' }}>
            <Sparkles size={12} />
            <span>Sin pestañas abiertas</span>
          </div>
        )}
      </div>

      {/* Right Toolbar Controls */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullscreen}
          aria-label={fullscreen ? 'Restaurar tamaño' : 'Pantalla completa'}
          className="w-7 h-7 rounded flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-lo)' }}
        >
          {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>

        {/* Close canvas */}
        {onCloseCanvas && (
          <button
            onClick={onCloseCanvas}
            aria-label="Cerrar lienzo"
            className="w-7 h-7 rounded flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-lo)' }}
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
