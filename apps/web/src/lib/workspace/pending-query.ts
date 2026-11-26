const PENDING_QUERY_KEYS = ['tariffos_pending_query', 'tariffos_pending_query_v1'] as const;

function safeGet(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeRemove(storage: Storage | undefined, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    // Ignore storage removal failures in private mode.
  }
}

/**
 * Reads and clears any pending classification query handed off from the Landing Hero.
 * Checks both `tariffos_pending_query` and `tariffos_pending_query_v1` in sessionStorage then localStorage.
 */
export function consumeWorkspacePendingQuery(): string | null {
  if (typeof window === 'undefined') return null;
  let found: string | null = null;

  for (const key of PENDING_QUERY_KEYS) {
    const val = safeGet(window.sessionStorage, key) ?? safeGet(window.localStorage, key);
    if (!found && val && val.trim().length > 0) {
      found = val.trim();
    }
    safeRemove(window.sessionStorage, key);
    safeRemove(window.localStorage, key);
  }

  return found;
}
