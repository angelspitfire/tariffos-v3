'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ApprovalWorkflowMode,
  CanvasTabType,
  SkuPrecedent,
  UserProfileSettings,
} from '@tariffos/shared-types';
import { consumePendingQuery } from '@/lib/funnel/funnel-storage';
import { resolveDefaultCanvasTab } from './canvas-tabs';
import { getJurisdictionById } from './jurisdictions';
import { createWorkspacePersistence } from './persistence';
import {
  buildSkuPrecedentFromMessage,
  buildThreadWithExternalMessage,
  getLatestCanvasComponents,
  updateBatchItemInThread,
  updateDossierInThread,
} from './thread-mutations';
import { DEFAULT_USER_PROFILE, type WorkspaceMessage, type WorkspaceThread, type WorkspaceToast } from './types';
import { useWorkspaceClassification } from './use-workspace-classification';

export function useWorkspaceState() {
  const persistence = useMemo(() => createWorkspacePersistence(), []);
  const [threads, setThreads] = useState<WorkspaceThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [selectedCanvasMsgId, setSelectedCanvasMsgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CanvasTabType>('dossier');
  const [skuPrecedents, setSkuPrecedents] = useState<SkuPrecedent[]>([]);
  const [profile, setProfile] = useState<UserProfileSettings>(DEFAULT_USER_PROFILE);
  const [hydrated, setHydrated] = useState(false);
  const [queuedPendingQuery, setQueuedPendingQuery] = useState<string | null>(null);
  const [toast, setToast] = useState<WorkspaceToast | null>(null);
  const pendingConsumedRef = useRef(false);

  const jurisdiction = useMemo(
    () => getJurisdictionById(profile.defaultJurisdictionId),
    [profile.defaultJurisdictionId],
  );
  const activeThread = useMemo(() => threads.find((t) => t.id === activeThreadId) ?? null, [threads, activeThreadId]);
  const canvasComponents = useMemo(() => getLatestCanvasComponents(activeThread, selectedCanvasMsgId), [activeThread, selectedCanvasMsgId]);

  const pushToast = useCallback((title: string, variant: WorkspaceToast['variant'] = 'info') => {
    const id = `toast-${Date.now()}`;
    setToast({ id, title, variant });
    window.setTimeout(() => setToast((curr) => (curr?.id === id ? null : curr)), 2800);
  }, []);

  const persistThread = useCallback(
    (nextThread: WorkspaceThread) => {
      setThreads((prev) => {
        const exists = prev.some((t) => t.id === nextThread.id);
        const updated = exists ? prev.map((t) => (t.id === nextThread.id ? nextThread : t)) : [nextThread, ...prev];
        return updated.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      });
      void persistence.saveThread(nextThread);
    },
    [persistence],
  );

  const runner = useWorkspaceClassification({
    threads, activeThreadId, jurisdiction,
    approvalWorkflowMode: profile.approvalWorkflowMode,
    defaultIncoterm: profile.defaultIncoterm,
    deepMode: profile.detailLevel === 'exhaustive',
    setActiveThreadId, setSelectedCanvasMsgId, setActiveTab, persistThread, pushToast,
  });

  useEffect(() => {
    let active = true;
    void Promise.all([persistence.loadThreads(), persistence.loadSkuPrecedents(), persistence.loadUserProfile()]).then(
      ([loadedThreads, loadedSkus, loadedProfile]) => {
        if (!active) return;
        setThreads(loadedThreads);
        if (loadedThreads[0]) setActiveThreadId(loadedThreads[0].id);
        setSkuPrecedents(loadedSkus);
        if (loadedProfile) setProfile(loadedProfile);
        if (!pendingConsumedRef.current) {
          pendingConsumedRef.current = true;
          const pending = consumePendingQuery();
          if (pending) setQueuedPendingQuery(pending);
        }
        setHydrated(true);
      },
    );
    return () => { active = false; };
  }, [persistence]);

  useEffect(() => {
    if (!hydrated || !queuedPendingQuery) return;
    const query = queuedPendingQuery;
    setQueuedPendingQuery(null);
    void runner.sendClassification(query, { forcedThreadId: `thread-${Date.now()}` });
  }, [hydrated, queuedPendingQuery, runner]);

  const updateProfile = useCallback(
    (patch: Partial<UserProfileSettings>) => {
      setProfile((prev) => {
        const next = { ...prev, ...patch, updatedAt: new Date().toISOString() };
        void persistence.saveUserProfile(next);
        return next;
      });
    },
    [persistence],
  );

  const approveActiveDossier = useCallback(() => {
    if (!activeThread) return;
    persistThread(updateDossierInThread(activeThread, selectedCanvasMsgId, (d) => ({
      ...d, reviewStatus: 'approved',
      approvalMeta: { status: 'approved', updatedAt: new Date().toISOString(), approvedBy: profile.fullName, brokerLicense: profile.brokerLicense },
    })));
    pushToast('Dictamen aprobado y sellado.', 'success');
  }, [activeThread, persistThread, profile.brokerLicense, profile.fullName, pushToast, selectedCanvasMsgId]);

  const requestDossierReview = useCallback(
    (note: string) => {
      if (!activeThread) return;
      persistThread(updateDossierInThread(activeThread, selectedCanvasMsgId, (d) => ({
        ...d, reviewStatus: 'in_review',
        approvalMeta: { status: 'in_review', updatedAt: new Date().toISOString(), complianceNotes: note },
      })));
      pushToast('Dictamen marcado en revisión técnica.', 'info');
    },
    [activeThread, persistThread, pushToast, selectedCanvasMsgId],
  );

  const confirmBatchItem = useCallback(
    (lineNumber: number, update: { hsCode: string; adValoremPercent: number; legalRegime: string; answers: Record<string, string> }) => {
      if (!activeThread) return;
      persistThread(updateBatchItemInThread(activeThread, lineNumber, update));
      pushToast(`Ítem #${lineNumber} confirmado (${update.hsCode}).`, 'success');
    },
    [activeThread, persistThread, pushToast],
  );

  const saveSku = useCallback(
    (precedent: SkuPrecedent) => {
      setSkuPrecedents((prev) => [precedent, ...prev.filter((p) => p.id !== precedent.id)]);
      void persistence.saveSkuPrecedent(precedent);
      pushToast(`SKU ${precedent.sku} guardado en catálogo.`, 'success');
    },
    [persistence, pushToast],
  );

  const saveSkuFromMessage = useCallback(
    (message?: WorkspaceMessage) => {
      const target = message ?? [...(activeThread?.messages ?? [])].reverse().find((m) => m.role === 'assistant' && m.envelope);
      if (!target) return;
      const precedent = buildSkuPrecedentFromMessage(target, profile);
      if (precedent) saveSku(precedent);
    },
    [activeThread, profile, saveSku],
  );

  const deleteSku = useCallback((id: string) => {
    setSkuPrecedents((prev) => prev.filter((p) => p.id !== id));
    void persistence.deleteSkuPrecedent(id);
  }, [persistence]);

  const deleteThread = useCallback((threadId: string) => {
    setThreads((prev) => {
      const remaining = prev.filter((t) => t.id !== threadId);
      if (activeThreadId === threadId) {
        setActiveThreadId(remaining[0]?.id ?? null);
        setSelectedCanvasMsgId(null);
      }
      return remaining;
    });
    void persistence.deleteThread(threadId);
  }, [activeThreadId, persistence]);

  const clearLocalData = useCallback(async () => {
    await persistence.clearLocal();
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      window.sessionStorage.clear();
    }
    setThreads([]);
    setSkuPrecedents([]);
    setActiveThreadId(null);
    setSelectedCanvasMsgId(null);
    pushToast('Caché local e IndexedDB limpiados.', 'info');
  }, [persistence, pushToast]);

  const ingestExternalMessage = useCallback(
    (msg: WorkspaceMessage) => {
      const targetId = activeThreadId ?? `thread-eve-${Date.now()}`;
      if (!activeThreadId) setActiveThreadId(targetId);
      const nextThread = buildThreadWithExternalMessage(activeThread, targetId, msg);
      persistThread(nextThread);
      if (msg.envelope?.canvasComponents.length) {
        setSelectedCanvasMsgId(msg.id);
        setActiveTab(resolveDefaultCanvasTab(msg.envelope.canvasComponents));
      }
    },
    [activeThread, activeThreadId, persistThread],
  );

  return {
    threads, activeThread, activeThreadId, selectedCanvasMsgId, canvasComponents, activeTab,
    jurisdiction, skuPrecedents, profile, toast, ...runner,
    setActiveTab, setActiveThreadId, setSelectedCanvasMsgId,
    setJurisdictionId: (id: string) => updateProfile({ defaultJurisdictionId: id }),
    setApprovalWorkflowMode: (mode: ApprovalWorkflowMode) => updateProfile({ approvalWorkflowMode: mode }),
    updateProfile,
    startNewThread: () => { setActiveThreadId(null); setSelectedCanvasMsgId(null); },
    deleteThread, clearLocalData, ingestExternalMessage, approveActiveDossier,
    requestDossierReview, confirmBatchItem, saveSku, saveSkuFromMessage, deleteSku, pushToast,
  };
}
