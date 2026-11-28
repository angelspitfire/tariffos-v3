'use client';

import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import { canSealDossier, type AgencyRole, type UserProfileSettings } from '@tariffos/shared-types';
import type { IPersistence } from './persistence';
import { appendProcessEventToThread, updateDossierInThread } from './thread-mutations';
import type { WorkspaceThread, WorkspaceToast } from './types';

export interface UseWorkspaceProcessActionsParams {
  persistence: IPersistence;
  threadsRef: MutableRefObject<WorkspaceThread[]>;
  activeThreadIdRef: MutableRefObject<string | null>;
  selectedCanvasMsgId: string | null;
  profile: UserProfileSettings;
  currentUser?: { userId?: string; fullName?: string; role?: AgencyRole } | null;
  setThreads: Dispatch<SetStateAction<WorkspaceThread[]>>;
  setActiveThreadId: Dispatch<SetStateAction<string | null>>;
  setSelectedCanvasMsgId: Dispatch<SetStateAction<string | null>>;
  persistThread: (thread: WorkspaceThread) => void;
  pushToast: (title: string, variant?: WorkspaceToast['variant']) => void;
}

export function useWorkspaceProcessActions({
  persistence, threadsRef, activeThreadIdRef, selectedCanvasMsgId, profile, currentUser,
  setThreads, setActiveThreadId, setSelectedCanvasMsgId, persistThread, pushToast,
}: UseWorkspaceProcessActionsParams) {
  const actorName = currentUser?.fullName || profile.fullName;

  const selectThread = useCallback(async (threadId: string) => {
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
  }, [activeThreadIdRef, persistence, setActiveThreadId, setSelectedCanvasMsgId, setThreads, threadsRef]);

  const updateThreadClientRef = useCallback((threadId: string, clientRef: string | null) => {
    const clean = clientRef?.trim() ? clientRef.trim() : null;
    const nextList = threadsRef.current.map((t) => (t.id === threadId ? { ...t, clientRef: clean, updatedAt: new Date().toISOString() } : t));
    threadsRef.current = nextList;
    setThreads(nextList);
    void persistence.patchThreadMeta?.(threadId, { clientRef: clean });
    pushToast(clean ? `Cliente / Ref: ${clean}` : 'Etiqueta de cliente removida.', 'info');
  }, [persistence, pushToast, setThreads, threadsRef]);

  const assignThreadReviewer = useCallback(
    (threadId: string, assignedToUserId: string | null, note?: string, targetName?: string, actorOverride?: string) => {
      const actor = actorOverride ?? actorName;
      const nextList = threadsRef.current.map((t) =>
        t.id === threadId
          ? appendProcessEventToThread(
              { ...t, assignedToUserId, updatedAt: new Date().toISOString() },
              { action: 'assigned', actorName: actor, ...(targetName ? { targetName } : {}), ...(note ? { note } : {}) },
            )
          : t,
      );
      threadsRef.current = nextList;
      setThreads(nextList);
      void persistence.patchThreadMeta?.(threadId, {
        assignedToUserId, actorName: actor, ...(note ? { note } : {}), ...(targetName ? { targetName } : {}),
      });
      pushToast(targetName ? `Asignado a ${targetName}.` : 'Reasignado a cola técnica.', 'info');
    },
    [actorName, persistence, pushToast, setThreads, threadsRef],
  );

  const approveActiveDossier = useCallback((roleOverride?: AgencyRole) => {
    const activeThread = threadsRef.current.find((t) => t.id === activeThreadIdRef.current);
    if (!activeThread) return;
    const effectiveRole = roleOverride ?? currentUser?.role ?? 'OWNER';
    if (!canSealDossier(effectiveRole, profile.approvalWorkflowMode)) {
      pushToast('Solo un revisor o dueño puede sellar en modo Revisión obligatoria.', 'warning');
      return;
    }
    const updated = updateDossierInThread(activeThread, selectedCanvasMsgId, (d) => ({
      ...d, reviewStatus: 'approved', approvalMeta: { status: 'approved', updatedAt: new Date().toISOString(), approvedBy: actorName, brokerLicense: profile.brokerLicense },
    }));
    persistThread(appendProcessEventToThread(updated, { action: 'approved', actorName, actorUserId: currentUser?.userId }));
    void persistence.patchThreadMeta?.(activeThread.id, { operationalStatus: 'approved', workflowMode: profile.approvalWorkflowMode, actorName });
    pushToast('Dictamen aprobado y sellado — disponible en Procesos.', 'success');
  }, [activeThreadIdRef, actorName, currentUser?.role, currentUser?.userId, persistence, persistThread, profile.approvalWorkflowMode, profile.brokerLicense, pushToast, selectedCanvasMsgId, threadsRef]);

  const requestDossierReview = useCallback((note: string, assignedToUserId?: string | null, targetName?: string) => {
    const activeThread = threadsRef.current.find((t) => t.id === activeThreadIdRef.current);
    if (!activeThread) return;
    const updated = updateDossierInThread(activeThread, selectedCanvasMsgId, (d) => ({
      ...d, reviewStatus: 'in_review', approvalMeta: { status: 'in_review', updatedAt: new Date().toISOString(), complianceNotes: note },
    }));
    const withAssignee = assignedToUserId !== undefined ? { ...updated, assignedToUserId } : updated;
    persistThread(appendProcessEventToThread(withAssignee, { action: 'review_requested', actorName, targetName, note }));
    void persistence.patchThreadMeta?.(activeThread.id, {
      operationalStatus: 'in_review', ...(assignedToUserId !== undefined ? { assignedToUserId } : {}), ...(targetName ? { targetName } : {}), note, actorName,
    });
    pushToast(targetName ? `Enviado a revisión con ${targetName}.` : 'Dictamen marcado en revisión técnica.', 'info');
  }, [activeThreadIdRef, actorName, persistence, persistThread, pushToast, selectedCanvasMsgId, threadsRef]);

  const archiveThread = useCallback((threadId: string) => {
    const nextList = threadsRef.current.map((t) =>
      t.id === threadId
        ? appendProcessEventToThread({ ...t, status: 'archived' as const, operationalStatus: 'archived' as const }, { action: 'archived', actorName })
        : t,
    );
    threadsRef.current = nextList;
    setThreads(nextList);
    if (activeThreadIdRef.current === threadId) {
      activeThreadIdRef.current = null;
      setActiveThreadId(null);
      setSelectedCanvasMsgId(null);
    }
    void persistence.patchThreadMeta?.(threadId, { status: 'archived', operationalStatus: 'archived', actorName });
    pushToast('Proceso archivado.', 'info');
  }, [activeThreadIdRef, actorName, persistence, pushToast, setActiveThreadId, setSelectedCanvasMsgId, setThreads, threadsRef]);

  const searchCloudThreads = useCallback(async (query: string) => {
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
    const merged = Array.from(existingById.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    threadsRef.current = merged;
    setThreads(merged);
  }, [persistence, setThreads, threadsRef]);

  return { selectThread, updateThreadClientRef, assignThreadReviewer, approveActiveDossier, requestDossierReview, archiveThread, searchCloudThreads };
}
