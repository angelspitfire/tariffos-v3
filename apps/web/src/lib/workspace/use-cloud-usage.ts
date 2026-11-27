'use client';

import { useEffect, useState } from 'react';
import type { ClientCurrentUsageSnapshot } from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export interface CloudUsageState {
  usage: ClientCurrentUsageSnapshot | null;
  loaded: boolean;
}

export function useCloudUsageState(
  initial?: ClientCurrentUsageSnapshot | null,
): CloudUsageState {
  const cloudEnabled = isCloudModeEnabled();
  const [usage, setUsage] = useState<ClientCurrentUsageSnapshot | null>(initial ?? null);
  const [loaded, setLoaded] = useState(initial !== undefined || !cloudEnabled);

  useEffect(() => {
    if (initial !== undefined || !cloudEnabled) return;
    let active = true;
    void fetch('/api/usage/current')
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { usage?: ClientCurrentUsageSnapshot } | null) => {
        if (active && json?.usage) setUsage(json.usage);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [cloudEnabled, initial]);

  return { usage, loaded };
}

export function useCloudUsageSnapshot(
  initial?: ClientCurrentUsageSnapshot | null,
): ClientCurrentUsageSnapshot | null {
  return useCloudUsageState(initial).usage;
}
