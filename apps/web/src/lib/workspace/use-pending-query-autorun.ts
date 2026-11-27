'use client';

import { useEffect, useRef, useState } from 'react';
import { consumePendingQuery, readPendingQuery } from '@/lib/funnel/funnel-storage';

export interface UsePendingQueryAutorunParams {
  cloudMode: boolean;
  usageLoaded: boolean;
  readOnlyReason: string | null;
  onRunQuery: (query: string) => void;
}

/**
 * Keeps any landing-captured query intact while an account is locked or loading,
 * and triggers it exactly once through the guarded workspace flow when active.
 */
export function usePendingQueryAutorun({
  cloudMode,
  usageLoaded,
  readOnlyReason,
  onRunQuery,
}: UsePendingQueryAutorunParams): string | null {
  const [savedPendingQuery, setSavedPendingQuery] = useState<string | null>(null);
  const consumedRef = useRef(false);
  const onRunRef = useRef(onRunQuery);
  onRunRef.current = onRunQuery;

  useEffect(() => {
    setSavedPendingQuery(readPendingQuery());
  }, []);

  useEffect(() => {
    if (consumedRef.current) return;
    if (cloudMode && !usageLoaded) return;
    if (readOnlyReason) return;

    const query = consumePendingQuery();
    consumedRef.current = true;
    setSavedPendingQuery(null);
    if (query) {
      onRunRef.current(query);
    }
  }, [cloudMode, usageLoaded, readOnlyReason]);

  return savedPendingQuery;
}
