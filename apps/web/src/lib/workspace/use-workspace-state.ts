'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { AgencyRole, ApprovalWorkflowMode, CanvasTabType, SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import type { WorkspaceToastState } from '@/components/workspace/atoms/WorkspaceToastBanner';
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
} from './thread-mutations';
import { DEFAULT_USER_PROFILE, type WorkspaceMessage, type WorkspaceThread, type WorkspaceToast } from './types';
import { useUndoableDelete, type UndoToastAction } from './use-undoable-delete';
import { useWorkspaceClassification } from './use-workspace-classification';
import { useWorkspaceHydration } from './use-workspace-hydration';
import { useWorkspaceProcessActions } from './use-workspace-process-actions';

const DEFAULT_TOAST_MS = 2800;

export interface UseWorkspaceStateOptions {
  currentUser?: { userId?: string; fullName?: string; role?: AgencyRole } | null;
}

export function useWorkspaceState(options?: UseWorkspaceStateOptions) {
  const persistence = useMemo(() => createWorkspacePersistence(), []);
  const [threads, setThreads] = useState<WorkspaceThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [selectedCanvasMsgId, setSelectedCanvasMsgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CanvasTabType>('dossier');
  const [skuPrecedents, setSkuPrecedents] = useState<SkuPrecedent[]>([]);
  const [profile, setProfile] = useState<UserProfileSettings>(DEFAULT_USER_PROFILE);
  const [toast, setToast] = useState<WorkspaceToastState | null>(null);

  const threadsRef = useRef<WorkspaceThread[]>([]);
  const activeThreadIdRef = useRef<string | null>(null);
  const skuRef = useRef<SkuPrecedent[]>([]);
  threadsRef.current = threads;
  activeThreadIdRef.current = activeThreadId;
  skuRef.current = skuPrecedents;

  const jurisdiction = useMemo(() => getJurisdictionById(profile.defaultJurisdictionId), [profile.defaultJurisdictionId]);
  const activeThread = useMemo(() => threads.find((t) => t.id === activeThreadId) ?? null, [threads, activeThreadId]);
  const canvasComponents = useMemo(() => getLatestCanvasComponents(activeThread, selectedCanvasMsgId), [activeThread, selectedCanvasMsgId]);

  const dismissToast = useCallback(() => setToast(null), []);
  const pushToast = useCallback((title: string, variant: WorkspaceToast['variant'] = 'info', action?: UndoToastAction) => {
    const id = `toast-${Date.now()}`;
    setToast({ id, title, variant, actionLabel: action?.actionLabel, onAction: action?.onAction });
    window.setTimeout(() => setToast((curr) => (curr?.id === id ? null : curr)), action?.durationMs ?? DEFAULT_TOAST_MS);
  }, []);
  const { scheduleDelete } = useUndoableDelete(pushToast, dismissToast);

  useWorkspaceHydration({ persistence, threadsRef, activeThreadIdRef, setThreads, setThreadsLoading, setActiveThreadId, setSkuPrecedents, setProfile });

  const persistThread = useCallback((nextThread: WorkspaceThread) => {
    const prev = threadsRef.current;
    const updated = (prev.some((t) => t.id === nextThread.id) ? prev.map((t) => (t.id === nextThread.id ? nextThread : t)) : [nextThread, ...prev])
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    threadsRef.current = updated;
    setThreads(updated);
    void persistence.saveThread(nextThread);
  }, [persistence]);

  const processActions = useWorkspaceProcessActions({
    persistence, threadsRef, activeThreadIdRef, selectedCanvasMsgId, profile, currentUser: options?.currentUser,
    setThreads, setActiveThreadId, setSelectedCanvasMsgId, persistThread, pushToast,
  });

  const ensureActiveThreadId = useCallback((): string => {
    if (activeThreadIdRef.current) return activeThreadIdRef.current;
    const id = `thread-eve-${Date.now()}`;
    activeThreadIdRef.current = id;
    setActiveThreadId(id);
    return id;
  }, []);

  const runner = useWorkspaceClassification({
    threads, activeThreadId, jurisdiction, approvalWorkflowMode: profile.approvalWorkflowMode,
    defaultIncoterm: profile.defaultIncoterm, deepMode: profile.detailLevel === 'exhaustive',
    setActiveThreadId, setSelectedCanvasMsgId, setActiveTab, persistThread, pushToast,
  });

  const updateProfile = useCallback((patch: Partial<UserProfileSettings>) => {
    setProfile((prev) => { const next = { ...prev, ...patch, updatedAt: new Date().toISOString() }; void persistence.saveUserProfile(next); return next; });
  }, [persistence]);

  const confirmBatchItem = useCallback((lineNumber: number, update: { hsCode: string; adValoremPercent: number; legalRegime: string; answers: Record<string, string> }) => {
    if (!activeThread) return;
    persistThread(updateBatchItemInThread(activeThread, lineNumber, update));
    pushToast(`Ítem #${lineNumber} confirmado (${update.hsCode}).`, 'success');
  }, [activeThread, persistThread, pushToast]);

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

  const deleteSku = useCallback((id: string) => {
    const removed = skuRef.current.find((p) => p.id === id);
    if (!removed) return;
    setSkuPrecedents((prev) => prev.filter((p) => p.id !== id));
    scheduleDelete({ key: `sku:${id}`, toastTitle: `SKU ${removed.sku} eliminado.`, onRestore: () => setSkuPrecedents((prev) => (prev.some((p) => p.id === id) ? prev : [removed, ...prev])), onCommit: () => { void persistence.deleteSkuPrecedent(id); } });
  }, [persistence, scheduleDelete]);

  const deleteThread = useCallback((threadId: string) => {
    const removed = threadsRef.current.find((t) => t.id === threadId);
    if (!removed) return;
    const wasActive = activeThreadIdRef.current === threadId;
    const remaining = threadsRef.current.filter((t) => t.id !== threadId);
    threadsRef.current = remaining;
    setThreads(remaining);
    if (wasActive) { activeThreadIdRef.current = null; setActiveThreadId(null); setSelectedCanvasMsgId(null); }
    scheduleDelete({
      key: `thread:${threadId}`, toastTitle: `Conversación «${removed.title}» eliminada.`,
      onRestore: () => {
        const restored = [removed, ...threadsRef.current.filter((t) => t.id !== threadId)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        threadsRef.current = restored; setThreads(restored);
        if (wasActive) { activeThreadIdRef.current = threadId; setActiveThreadId(threadId); }
      },
      onCommit: () => { void persistence.deleteThread(threadId); },
    });
  }, [persistence, scheduleDelete]);

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
    if (msg.envelope?.canvasComponents.length) { setSelectedCanvasMsgId(msg.id); setActiveTab(resolveDefaultCanvasTab(msg.envelope.canvasComponents)); }
    return targetId;
  }, [ensureActiveThreadId, persistThread]);

  const actorName = options?.currentUser?.fullName || profile.fullName;
  const syncChatMessages = useCallback((synced: readonly WorkspaceMessage[], latestCanvasMsgId: string | null): string => {
    const targetId = ensureActiveThreadId();
    const existing = threadsRef.current.find((t) => t.id === targetId) ?? null;
    persistThread(mergeSyncedMessagesIntoThread(existing, targetId, synced, jurisdiction.id, { userId: options?.currentUser?.userId, fullName: actorName }));
    if (latestCanvasMsgId && profile.autoOpenCanvas) {
      const targetMsg = synced.find((m) => m.id === latestCanvasMsgId);
      if (targetMsg?.envelope?.canvasComponents.length) { setSelectedCanvasMsgId(latestCanvasMsgId); setActiveTab(resolveDefaultCanvasTab(targetMsg.envelope.canvasComponents)); }
    }
    return targetId;
  }, [actorName, ensureActiveThreadId, jurisdiction.id, options?.currentUser?.userId, persistThread, profile.autoOpenCanvas]);

  return {
    threads, threadsLoading, activeThread, activeThreadId, selectedCanvasMsgId, canvasComponents, activeTab,
    jurisdiction, skuPrecedents, profile, toast, ...runner, ...processActions,
    setActiveTab, setActiveThreadId, setSelectedCanvasMsgId,
    setJurisdictionId: (id: string) => updateProfile({ defaultJurisdictionId: id }),
    setApprovalWorkflowMode: (mode: ApprovalWorkflowMode) => updateProfile({ approvalWorkflowMode: mode }),
    updateProfile, startNewThread: () => { activeThreadIdRef.current = null; setActiveThreadId(null); setSelectedCanvasMsgId(null); },
    deleteThread, clearLocalData, bindEveSessionId, ingestExternalMessage, syncChatMessages,
    confirmBatchItem, saveSku, saveSkuFromMessage, deleteSku, pushToast,
  };
}
