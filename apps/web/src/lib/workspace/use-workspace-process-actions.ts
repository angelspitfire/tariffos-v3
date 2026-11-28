'use client';

import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { IPersistence } from './persistence';
import type { WorkspaceThread, WorkspaceToast } from './types';

export interface UseWorkspaceProcessActionsParams {
  persistence: IPersistence;
  threadsRef: MutableRefObject<WorkspaceThread[]>;
  activeThreadIdRef: MutableRefObject<string | null>;
  setThreads: Dispatch<SetStateAction<WorkspaceThread[]>>;
  setActiveThreadId: Dispatch<SetStateAction<string | null>>;
  setSelectedCanvasMsgId: Dispatch<SetStateAction<string | null>>;
  pushToast: (title: string, variant?: WorkspaceToast['variant']) => void;
}

export function useWorkspaceProcessActions({
  persistence,
  threadsRef,
  activeThreadIdRef,
  setThreads,
  setActiveThreadId,
  setSelectedCanvasMsgId,
  pushToast,
}: UseWorkspaceProcessActionsParams) {
  const selectThread = useCallback(
    async (threadId: string) => {
      activeThreadIdRef.current = threadId;
      setActiveThreadId(threadId);
      setSelectedCanvasMsgId(null);

      const target = threadsRef.current.find((t) => t.id === threadId);
      if (target && target.messagesLoaded === false && persistence.loadThreadDetail) {
        const full = await persistence.loadThreadDetail(threadId).catch(() => null);
        if (full) {
          const nextList = threadsRef.current.map((t) => (t.id === threadId ? full : t));
          threadsRef.current = nextList;
          setThreads(nextList);
        }
      }
    },
    [activeThreadIdRef, persistence, setActiveThreadId, setSelectedCanvasMsgId, setThreads, threadsRef],
  );

  const updateThreadClientRef = useCallback(
    (threadId: string, clientRef: string | null) => {
      const clean = clientRef?.trim() ? clientRef.trim() : null;
      const nextList = threadsRef.current.map((t) =>
        t.id === threadId ? { ...t, clientRef: clean, updatedAt: new Date().toISOString() } : t,
      );
      threadsRef.current = nextList;
      setThreads(nextList);
      void persistence.patchThreadMeta?.(threadId, { clientRef: clean });
      pushToast(clean ? `Cliente / Ref: ${clean}` : 'Etiqueta de cliente removida.', 'info');
    },
    [persistence, pushToast, setThreads, threadsRef],
  );

  const archiveThread = useCallback(
    (threadId: string) => {
      const nextList = threadsRef.current.map((t) =>
        t.id === threadId
          ? { ...t, status: 'archived' as const, operationalStatus: 'archived' as const }
          : t,
      );
      threadsRef.current = nextList;
      setThreads(nextList);
      if (activeThreadIdRef.current === threadId) {
        activeThreadIdRef.current = null;
        setActiveThreadId(null);
        setSelectedCanvasMsgId(null);
      }
      void persistence.patchThreadMeta?.(threadId, {
        status: 'archived',
        operationalStatus: 'archived',
      });
      pushToast('Proceso archivado.', 'info');
    },
    [activeThreadIdRef, persistence, pushToast, setActiveThreadId, setSelectedCanvasMsgId, setThreads, threadsRef],
  );

  const searchCloudThreads = useCallback(
    async (query: string) => {
      if (!persistence.searchThreads) return;
      const result = await persistence.searchThreads({ query, limit: 30 }).catch(() => null);
      if (!result?.threads.length) return;
      const existingById = new Map(threadsRef.current.map((t) => [t.id, t]));
      for (const item of result.threads) {
        const local = existingById.get(item.id);
        if (local && local.messages.length > 0 && item.messagesLoaded === false) {
          existingById.set(item.id, { ...item, messages: local.messages, messagesLoaded: true });
        } else if (!local) {
          existingById.set(item.id, item);
        }
      }
      const merged = Array.from(existingById.values()).sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      );
      threadsRef.current = merged;
      setThreads(merged);
    },
    [persistence, setThreads, threadsRef],
  );

  return { selectThread, updateThreadClientRef, archiveThread, searchCloudThreads };
}
