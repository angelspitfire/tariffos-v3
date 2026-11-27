'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ApprovalWorkflowMode, CanvasTabType, SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import { resolveDefaultCanvasTab } from './canvas-tabs';
import { getJurisdictionById } from './jurisdictions';
import { createWorkspacePersistence } from './persistence';
import {
  attachEveSessionToThread,
  buildSkuPrecedentFromMessage,
  buildThreadWithExternalMessage,
  getLatestCanvasComponents,
  mergeSyncedMessagesIntoThread,
  updateBatchItemInThread,
  updateDossierInThread,
} from './thread-mutations';
import { DEFAULT_USER_PROFILE, type WorkspaceMessage, type WorkspaceThread, type WorkspaceToast } from './types';
import { useWorkspaceClassification } from './use-workspace-classification';

export function useWorkspaceState() {
  const persistence = useMemo(() => createWorkspacePersistence(), []);
  const [threads, setThreads] = useState<WorkspaceThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [selectedCanvasMsgId, setSelectedCanvasMsgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CanvasTabType>('dossier');
  const [skuPrecedents, setSkuPrecedents] = useState<SkuPrecedent[]>([]);
  const [profile, setProfile] = useState<UserProfileSettings>(DEFAULT_USER_PROFILE);
  const [toast, setToast] = useState<WorkspaceToast | null>(null);

  const threadsRef = useRef<WorkspaceThread[]>([]);
  const activeThreadIdRef = useRef<string | null>(null);
  threadsRef.current = threads;
  activeThreadIdRef.current = activeThreadId;

  const jurisdiction = useMemo(() => getJurisdictionById(profile.defaultJurisdictionId), [profile.defaultJurisdictionId]);
  const activeThread = useMemo(() => threads.find((t) => t.id === activeThreadId) ?? null, [threads, activeThreadId]);
  const canvasComponents = useMemo(() => getLatestCanvasComponents(activeThread, selectedCanvasMsgId), [activeThread, selectedCanvasMsgId]);

  const pushToast = useCallback((title: string, variant: WorkspaceToast['variant'] = 'info') => {
    const id = `toast-${Date.now()}`;
    setToast({ id, title, variant });
    window.setTimeout(() => setToast((curr) => (curr?.id === id ? null : curr)), 2800);
  }, []);

  const persistThread = useCallback((nextThread: WorkspaceThread) => {
    const prev = threadsRef.current;
    const exists = prev.some((t) => t.id === nextThread.id);
    const updated = (exists ? prev.map((t) => (t.id === nextThread.id ? nextThread : t)) : [nextThread, ...prev])
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    threadsRef.current = updated;
    setThreads(updated);
    void persistence.saveThread(nextThread);
  }, [persistence]);

  const ensureActiveThreadId = useCallback((): string => {
    if (activeThreadIdRef.current) return activeThreadIdRef.current;
    const id = `thread-eve-${Date.now()}`;
    activeThreadIdRef.current = id;
    setActiveThreadId(id);
    return id;
  }, []);

  const runner = useWorkspaceClassification({
    threads, activeThreadId, jurisdiction,
    approvalWorkflowMode: profile.approvalWorkflowMode,
    defaultIncoterm: profile.defaultIncoterm,
    deepMode: profile.detailLevel === 'exhaustive',
    setActiveThreadId, setSelectedCanvasMsgId, setActiveTab, persistThread, pushToast,
  });

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

    return () => { active = false; };
  }, [persistence]);

  const updateProfile = useCallback((patch: Partial<UserProfileSettings>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch, updatedAt: new Date().toISOString() };
      void persistence.saveUserProfile(next);
      return next;
    });
  }, [persistence]);

  const approveActiveDossier = useCallback(() => {
    if (!activeThread) return;
    persistThread(updateDossierInThread(activeThread, selectedCanvasMsgId, (d) => ({ ...d, reviewStatus: 'approved', approvalMeta: { status: 'approved', updatedAt: new Date().toISOString(), approvedBy: profile.fullName, brokerLicense: profile.brokerLicense } })));
    pushToast('Dictamen aprobado y sellado.', 'success');
  }, [activeThread, persistThread, profile.brokerLicense, profile.fullName, pushToast, selectedCanvasMsgId]);

  const requestDossierReview = useCallback((note: string) => {
    if (!activeThread) return;
    persistThread(updateDossierInThread(activeThread, selectedCanvasMsgId, (d) => ({ ...d, reviewStatus: 'in_review', approvalMeta: { status: 'in_review', updatedAt: new Date().toISOString(), complianceNotes: note } })));
    pushToast('Dictamen marcado en revisión técnica.', 'info');
  }, [activeThread, persistThread, pushToast, selectedCanvasMsgId]);

  const confirmBatchItem = useCallback(
    (lineNumber: number, update: { hsCode: string; adValoremPercent: number; legalRegime: string; answers: Record<string, string> }) => {
      if (!activeThread) return;
      persistThread(updateBatchItemInThread(activeThread, lineNumber, update));
      pushToast(`Ítem #${lineNumber} confirmado (${update.hsCode}).`, 'success');
    },
    [activeThread, persistThread, pushToast],
  );

  const saveSku = useCallback((precedent: SkuPrecedent) => {
    setSkuPrecedents((prev) => [precedent, ...prev.filter((p) => p.id !== precedent.id)]);
    void persistence.saveSkuPrecedent(precedent);
    pushToast(`SKU ${precedent.sku} guardado en catálogo.`, 'success');
  }, [persistence, pushToast]);

  const saveSkuFromMessage = useCallback((message?: WorkspaceMessage) => {
    const target = message ?? [...(activeThread?.messages ?? [])].reverse().find((m) => m.role === 'assistant' && m.envelope);
    const precedent = target ? buildSkuPrecedentFromMessage(target, profile) : null;
    if (precedent) saveSku(precedent);
  }, [activeThread, profile, saveSku]);

  const deleteSku = useCallback((id: string) => { setSkuPrecedents((prev) => prev.filter((p) => p.id !== id)); void persistence.deleteSkuPrecedent(id); }, [persistence]);

  const deleteThread = useCallback((threadId: string) => {
    const remaining = threadsRef.current.filter((t) => t.id !== threadId);
    threadsRef.current = remaining;
    setThreads(remaining);
    if (activeThreadIdRef.current === threadId) {
      activeThreadIdRef.current = null;
      setActiveThreadId(null);
      setSelectedCanvasMsgId(null);
    }
    void persistence.deleteThread(threadId);
  }, [persistence]);

  const clearLocalData = useCallback(async () => {
    await persistence.clearLocal();
    if (typeof window !== 'undefined') { window.localStorage.clear(); window.sessionStorage.clear(); }
    threadsRef.current = []; activeThreadIdRef.current = null;
    setThreads([]); setSkuPrecedents([]); setActiveThreadId(null); setSelectedCanvasMsgId(null);
    pushToast('Caché local e IndexedDB limpiados.', 'info');
  }, [persistence, pushToast]);

  const bindEveSessionId = useCallback((sessionId: string): string => {
    const targetId = ensureActiveThreadId();
    const existing = threadsRef.current.find((t) => t.id === targetId) ?? null;
    persistThread(attachEveSessionToThread(existing, targetId, sessionId, jurisdiction.id));
    return targetId;
  }, [ensureActiveThreadId, jurisdiction.id, persistThread]);

  const ingestExternalMessage = useCallback((msg: WorkspaceMessage): string => {
    const targetId = ensureActiveThreadId();
    const existing = threadsRef.current.find((t) => t.id === targetId) ?? null;
    persistThread(buildThreadWithExternalMessage(existing, targetId, msg));
    if (msg.envelope?.canvasComponents.length) {
      setSelectedCanvasMsgId(msg.id);
      setActiveTab(resolveDefaultCanvasTab(msg.envelope.canvasComponents));
    }
    return targetId;
  }, [ensureActiveThreadId, persistThread]);

  const syncChatMessages = useCallback((synced: readonly WorkspaceMessage[], latestCanvasMsgId: string | null): string => {
    const targetId = ensureActiveThreadId();
    const existing = threadsRef.current.find((t) => t.id === targetId) ?? null;
    persistThread(mergeSyncedMessagesIntoThread(existing, targetId, synced, jurisdiction.id));
    if (latestCanvasMsgId && profile.autoOpenCanvas) {
      const targetMsg = synced.find((m) => m.id === latestCanvasMsgId);
      if (targetMsg?.envelope?.canvasComponents.length) {
        setSelectedCanvasMsgId(latestCanvasMsgId);
        setActiveTab(resolveDefaultCanvasTab(targetMsg.envelope.canvasComponents));
      }
    }
    return targetId;
  }, [ensureActiveThreadId, jurisdiction.id, persistThread, profile.autoOpenCanvas]);

  return {
    threads, threadsLoading, activeThread, activeThreadId, selectedCanvasMsgId, canvasComponents, activeTab,
    jurisdiction, skuPrecedents, profile, toast, ...runner,
    setActiveTab, setActiveThreadId, setSelectedCanvasMsgId,
    setJurisdictionId: (id: string) => updateProfile({ defaultJurisdictionId: id }),
    setApprovalWorkflowMode: (mode: ApprovalWorkflowMode) => updateProfile({ approvalWorkflowMode: mode }),
    updateProfile,
    startNewThread: () => { activeThreadIdRef.current = null; setActiveThreadId(null); setSelectedCanvasMsgId(null); },
    deleteThread, clearLocalData, bindEveSessionId, ingestExternalMessage, syncChatMessages,
    approveActiveDossier, requestDossierReview, confirmBatchItem, saveSku, saveSkuFromMessage, deleteSku, pushToast,
  };
}
