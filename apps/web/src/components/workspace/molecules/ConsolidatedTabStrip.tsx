'use client';

import { GitCompareArrows, Maximize2, Minimize2, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { A2UICanvasComponent, CanvasTabType } from '@tariffos/shared-types';
import { resolveConsolidatedTabs } from '@/lib/workspace/canvas-tabs';
import { cn } from '@/lib/utils';

export interface ConsolidatedTabStripProps {
  components: readonly A2UICanvasComponent[];
  activeTab: CanvasTabType;
  unreadAlertsCount: number;
  versionsCount?: number;
  isFullscreen?: boolean;
  onSelectTab: (tab: CanvasTabType) => void;
  onOpenTimeline?: () => void;
  onToggleFullscreen?: () => void;
  onCloseCanvas?: () => void;
}

export function ConsolidatedTabStrip({
  components,
  activeTab,
  unreadAlertsCount,
  versionsCount = 0,
  isFullscreen = false,
  onSelectTab,
  onOpenTimeline,
  onToggleFullscreen,
  onCloseCanvas,
}: ConsolidatedTabStripProps) {
  const { tabs, showCompareShortcut, showRegulatoryShortcut } = resolveConsolidatedTabs({
    components,
    activeTab,
    unreadAlertsCount,
  });
  const reduceMotion = useReducedMotion();

  return (
    <div className="no-print flex items-center justify-between gap-2 border-b border-border-subtle bg-surface-panel px-3 min-w-0">
      <div role="tablist" className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.matchesTabs.includes(activeTab);
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectTab(tab.targetTab)}
              className={cn(
                'relative flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap px-2.5 py-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none',
                isActive ? 'text-accent-ink' : 'text-ink-muted hover:text-ink-primary',
              )}
            >
              <span>{tab.label}</span>
              {tab.badgeCount && tab.badgeCount > 0 ? (
                <span className="rounded-full bg-amber-500/15 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  {tab.badgeCount}
                </span>
              ) : null}
              {isActive ? (
                <motion.span
                  layoutId="canvas-active-tab-underline"
                  transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute right-2 bottom-0 left-2 h-0.5 rounded-full bg-accent-brand"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 py-1.5">
        {showCompareShortcut ? (
          <button
            type="button"
            onClick={() => onSelectTab('rgi_comparator')}
            className="cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            + Comparar
          </button>
        ) : null}
        {showRegulatoryShortcut ? (
          <button
            type="button"
            onClick={() => onSelectTab('regulatory_diff')}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <span>+ Normativa</span>
            {unreadAlertsCount > 0 ? (
              <span className="rounded-full bg-amber-500/20 px-1.5 font-mono text-[10px] text-amber-700 dark:text-amber-300">
                {unreadAlertsCount}
              </span>
            ) : null}
          </button>
        ) : null}
        {versionsCount >= 2 && onOpenTimeline ? (
          <button
            type="button"
            onClick={onOpenTimeline}
            aria-label="Historial y comparador de versiones"
            className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-border-subtle bg-surface-muted px-2 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <GitCompareArrows className="h-3 w-3 text-accent-ink" aria-hidden="true" />
            <span>v{versionsCount}</span>
          </button>
        ) : null}
        {onToggleFullscreen ? (
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Restaurar tamaño del Canvas' : 'Expandir Canvas'}
            title={isFullscreen ? 'Restaurar' : 'Expandir'}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        ) : null}
        {onCloseCanvas ? (
          <button
            type="button"
            onClick={onCloseCanvas}
            aria-label="Cerrar panel de dictamen"
            title="Cerrar panel (Esc)"
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
