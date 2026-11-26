'use client';

import { motion } from 'framer-motion';
import type { A2UICanvasComponent, CanvasTabType } from '@tariffos/shared-types';
import { resolveConsolidatedTabs } from '@/lib/workspace/canvas-tabs';
import { cn } from '@/lib/utils';

export interface ConsolidatedTabStripProps {
  components: readonly A2UICanvasComponent[];
  activeTab: CanvasTabType;
  unreadAlertsCount: number;
  onSelectTab: (tab: CanvasTabType) => void;
}

export function ConsolidatedTabStrip({
  components,
  activeTab,
  unreadAlertsCount,
  onSelectTab,
}: ConsolidatedTabStripProps) {
  const { tabs, showCompareShortcut, showRegulatoryShortcut } = resolveConsolidatedTabs({
    components,
    activeTab,
    unreadAlertsCount,
  });

  return (
    <div className="no-print flex items-center justify-between gap-2 border-b border-border-subtle bg-surface-panel px-3">
      <div role="tablist" className="flex items-center gap-1 overflow-x-auto">
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
                'relative flex cursor-pointer items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-xs font-medium transition-colors',
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
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
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
            className="cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary"
          >
            + Comparar
          </button>
        ) : null}
        {showRegulatoryShortcut ? (
          <button
            type="button"
            onClick={() => onSelectTab('regulatory_diff')}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary"
          >
            <span>+ Normativa</span>
            {unreadAlertsCount > 0 ? (
              <span className="rounded-full bg-amber-500/20 px-1.5 font-mono text-[10px] text-amber-700 dark:text-amber-300">
                {unreadAlertsCount}
              </span>
            ) : null}
          </button>
        ) : null}
      </div>
    </div>
  );
}
