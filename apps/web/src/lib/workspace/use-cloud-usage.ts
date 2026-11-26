'use client';

import { useEffect, useState } from 'react';
import type { ClientCurrentUsageSnapshot } from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export function useCloudUsageSnapshot(
  initial?: ClientCurrentUsageSnapshot | null,
): ClientCurrentUsageSnapshot | null {
  const [usage, setUsage] = useState<ClientCurrentUsageSnapshot | null>(initial ?? null);

  useEffect(() => {
    if (initial !== undefined || !isCloudModeEnabled()) return;
    let active = true;
    void fetch('/api/usage/current')
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { usage?: ClientCurrentUsageSnapshot } | null) => {
        if (active && json?.usage) setUsage(json.usage);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [initial]);

  return usage;
}
