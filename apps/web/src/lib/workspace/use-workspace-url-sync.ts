'use client';

import { useEffect, useRef } from 'react';
import type { CanvasTabType } from '@tariffos/shared-types';

const VALID_TABS = new Set<string>([
  'dossier',
  'calculator',
  'batch_manifest',
  'rgi_comparator',
  'regulatory_diff',
  'sku_catalog',
  'tariff_schedule',
  'customs_forms',
]);

export interface UseWorkspaceUrlSyncParams {
  activeThreadId: string | null;
  activeTab: CanvasTabType;
  analyticsOpen: boolean;
  hasCanvas: boolean;
  onHydrateThread: (threadId: string) => void;
  onHydrateTab: (tab: CanvasTabType) => void;
  onHydrateAnalytics: (open: boolean) => void;
}

/**
 * Bidirectional URL query-parameter sync (`?thread=&tab=&view=analytics`).
 * Hydrates initial workspace state once on mount and keeps the URL updated
 * via `history.replaceState` without creating noisy history entries.
 */
export function useWorkspaceUrlSync({
  activeThreadId,
  activeTab,
  analyticsOpen,
  hasCanvas,
  onHydrateThread,
  onHydrateTab,
  onHydrateAnalytics,
}: UseWorkspaceUrlSyncParams): void {
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current || typeof window === 'undefined') return;
    hydratedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const threadParam = params.get('thread');
    const tabParam = params.get('tab');
    const viewParam = params.get('view');

    if (threadParam) onHydrateThread(threadParam);
    if (tabParam && VALID_TABS.has(tabParam)) onHydrateTab(tabParam as CanvasTabType);
    if (viewParam === 'analytics') onHydrateAnalytics(true);
  }, [onHydrateAnalytics, onHydrateTab, onHydrateThread]);

  useEffect(() => {
    if (!hydratedRef.current || typeof window === 'undefined') return;

    const next = new URLSearchParams();
    if (analyticsOpen) {
      next.set('view', 'analytics');
    } else {
      if (activeThreadId) next.set('thread', activeThreadId);
      if (hasCanvas && activeTab) next.set('tab', activeTab);
    }

    const query = next.toString();
    const nextSearch = query ? `?${query}` : '';
    if (window.location.search === nextSearch) return;

    const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
    window.history.replaceState(null, '', nextUrl);
  }, [activeTab, activeThreadId, analyticsOpen, hasCanvas]);
}
