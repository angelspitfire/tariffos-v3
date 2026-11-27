'use client';

import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import type { createWorkspacePersistence } from './persistence';
import type { WorkspaceThread } from './types';

export interface UseWorkspaceHydrationParams {
  persistence: ReturnType<typeof createWorkspacePersistence>;
  threadsRef: MutableRefObject<WorkspaceThread[]>;
  activeThreadIdRef: MutableRefObject<string | null>;
  setThreads: Dispatch<SetStateAction<WorkspaceThread[]>>;
  setThreadsLoading: Dispatch<SetStateAction<boolean>>;
  setActiveThreadId: Dispatch<SetStateAction<string | null>>;
  setSkuPrecedents: Dispatch<SetStateAction<SkuPrecedent[]>>;
  setProfile: Dispatch<SetStateAction<UserProfileSettings>>;
}

/** Hydrates local cache immediately and reconciles with cloud persistence in parallel. */
export function useWorkspaceHydration({
  persistence,
  threadsRef,
  activeThreadIdRef,
  setThreads,
  setThreadsLoading,
  setActiveThreadId,
  setSkuPrecedents,
  setProfile,
}: UseWorkspaceHydrationParams): void {
  useEffect(() => {
    let active = true;
    let threadsSyncedFromCloud = false;
    let skusSyncedFromCloud = false;
    let profileSyncedFromCloud = false;

    const hydrateLocal = persistence.loadLocalBootstrap?.();
    if (hydrateLocal) {
      void hydrateLocal.then(({ threads: localThreads, skuPrecedents: localSkus, profile: localProfile }) => {
        if (!active) return;
        if (!threadsSyncedFromCloud && localThreads.length > 0) {
          if (threadsRef.current.length === 0) {
            threadsRef.current = localThreads;
            setThreads(localThreads);
          }
          setThreadsLoading(false);
        }
        if (!skusSyncedFromCloud && localSkus.length > 0) setSkuPrecedents(localSkus);
        if (!profileSyncedFromCloud && localProfile) setProfile(localProfile);
      });
    }

    void persistence
      .loadThreads()
      .then((loadedThreads) => {
        if (!active) return;
        threadsSyncedFromCloud = true;
        const activeId = activeThreadIdRef.current;
        const localActive = activeId
          ? threadsRef.current.find((t) => t.id === activeId && !loadedThreads.some((r) => r.id === t.id))
          : undefined;
        const mergedThreads = localActive ? [localActive, ...loadedThreads] : loadedThreads;
        threadsRef.current = mergedThreads;
        setThreads(mergedThreads);
        if (activeId && !mergedThreads.some((t) => t.id === activeId)) {
          activeThreadIdRef.current = null;
          setActiveThreadId(null);
        }
        setThreadsLoading(false);
      })
      .catch(() => {
        if (active) setThreadsLoading(false);
      });

    void persistence.loadSkuPrecedents().then((loadedSkus) => {
      if (!active) return;
      skusSyncedFromCloud = true;
      setSkuPrecedents(loadedSkus);
    });

    void persistence.loadUserProfile().then((loadedProfile) => {
      if (!active) return;
      profileSyncedFromCloud = true;
      if (loadedProfile) setProfile(loadedProfile);
    });

    return () => {
      active = false;
    };
  }, [
    activeThreadIdRef,
    persistence,
    setActiveThreadId,
    setProfile,
    setSkuPrecedents,
    setThreads,
    setThreadsLoading,
    threadsRef,
  ]);
}
