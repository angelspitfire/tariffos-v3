'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ApprovalWorkflowMode,
  CanvasTabType,
  SkuPrecedent,
  UserProfileSettings,
} from '@tariffos/shared-types';
import { getJurisdictionById } from './jurisdictions';
import { consumeWorkspacePendingQuery } from './pending-query';
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
  const [jurisdictionId, setJurisdictionId] = useState('ve-seniat');
  const [skuPrecedents, setSkuPrecedents] = useState<SkuPrecedent[]>([]);
  const [profile, setProfile] = useState<UserProfileSettings>(DEFAULT_USER_PROFILE);
  const [toast, setToast] = useState<WorkspaceToast | null>(null);
  const pendingConsumedRef = useRef(false);

  const jurisdiction = useMemo(() => getJurisdictionById(jurisdictionId), [jurisdictionId]);
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
    [persistence]
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
        if (loadedProfile) {
          setProfile(loadedProfile);
          setJurisdictionId(loadedProfile.defaultJurisdictionId);
        }
        if (!pendingConsumedRef.current) {
          pendingConsumedRef.current = true;
          const pending = consumeWorkspacePendingQuery();
          if (pending) void runner.sendClassification(pending, { forcedThreadId: `thread-${Date.now()}` });
        }
      }
    );
    return () => { active = false; };
    // Initial hydration runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<UserProfileSettings>) => {
      setProfile((prev) => {
        const next = { ...prev, ...patch, updatedAt: new Date().toISOString() };
        void persistence.saveUserProfile(next);
        return next;
      });
    },
    [persistence]
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
    [activeThread, persistThread, pushToast, selectedCanvasMsgId]
  );

  const confirmBatchItem = useCallback(
    (lineNumber: number, update: { hsCode: string; adValoremPercent: number; legalRegime: string; answers: Record<string, string> }) => {
      if (!activeThread) return;
      persistThread(updateBatchItemInThread(activeThread, lineNumber, update));
      pushToast(`Ítem #${lineNumber} confirmado (${update.hsCode}).`, 'success');
    },
    [activeThread, persistThread, pushToast]
  );

  const saveSku = useCallback(
    (precedent: SkuPrecedent) => {
      setSkuPrecedents((prev) => [precedent, ...prev.filter((p) => p.id !== precedent.id)]);
      void persistence.saveSkuPrecedent(precedent);
      pushToast(`SKU ${precedent.sku} guardado en catálogo.`, 'success');
    },
    [persistence, pushToast]
  );

  const saveSkuFromMessage = useCallback(
    (message?: WorkspaceMessage) => {
      const target = message ?? [...(activeThread?.messages ?? [])].reverse().find((m) => m.role === 'assistant' && m.envelope);
      if (!target) return;
      const precedent = buildSkuPrecedentFromMessage(target, profile);
      if (precedent) saveSku(precedent);
    },
    [activeThread, profile, saveSku]
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

  const ingestExternalMessage = useCallback(
    (msg: WorkspaceMessage) => {
      const targetId = activeThreadId ?? `thread-eve-${Date.now()}`;
      if (!activeThreadId) setActiveThreadId(targetId);
      const nextThread = buildThreadWithExternalMessage(activeThread, targetId, msg);
      persistThread(nextThread);
      if (msg.envelope?.canvasComponents.length) {
        setSelectedCanvasMsgId(msg.id);
        setActiveTab('dossier');
      }
    },
    [activeThread, activeThreadId, persistThread],
  );

  return {
    threads, activeThread, activeThreadId, selectedCanvasMsgId, canvasComponents, activeTab,
    jurisdiction, skuPrecedents, profile, toast, ...runner,
    setActiveTab, setActiveThreadId, setSelectedCanvasMsgId,
    setJurisdictionId: (id: string) => { setJurisdictionId(id); updateProfile({ defaultJurisdictionId: id }); },
    setApprovalWorkflowMode: (mode: ApprovalWorkflowMode) => updateProfile({ approvalWorkflowMode: mode }),
    updateProfile,
    startNewThread: () => { setActiveThreadId(null); setSelectedCanvasMsgId(null); },
    deleteThread, ingestExternalMessage, approveActiveDossier, requestDossierReview, confirmBatchItem,
    saveSku, saveSkuFromMessage, deleteSku, pushToast,
  };
}
