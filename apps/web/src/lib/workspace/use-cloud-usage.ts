'use client';

import { useEffect, useState } from 'react';
import type { ClientCurrentUsageSnapshot } from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';

const USAGE_CACHE_TTL_MS = 15_000;

let sharedUsageCache: { value: ClientCurrentUsageSnapshot | null; expiresAt: number } | null = null;
let sharedUsageInFlight: Promise<ClientCurrentUsageSnapshot | null> | null = null;

/** Clears the shared usage fetch cache (intended for deterministic tests). */
export function resetCloudUsageCacheForTests(): void {
  sharedUsageCache = null;
  sharedUsageInFlight = null;
}

async function fetchSharedCloudUsage(): Promise<ClientCurrentUsageSnapshot | null> {
  const now = Date.now();
  if (sharedUsageCache && sharedUsageCache.expiresAt > now) {
    return sharedUsageCache.value;
  }
  if (sharedUsageInFlight) {
    return sharedUsageInFlight;
  }

  sharedUsageInFlight = fetch('/api/usage/current')
    .then(async (res) => {
      if (!res.ok) return null;
      const json = (await res.json()) as { usage?: ClientCurrentUsageSnapshot } | null;
      return json?.usage ?? null;
    })
    .catch(() => null)
    .then((usage) => {
      sharedUsageCache = { value: usage, expiresAt: Date.now() + USAGE_CACHE_TTL_MS };
      return usage;
    })
    .finally(() => {
      sharedUsageInFlight = null;
    });

  return sharedUsageInFlight;
}

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
    void fetchSharedCloudUsage()
      .then((nextUsage) => {
        if (active && nextUsage) setUsage(nextUsage);
      })
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
