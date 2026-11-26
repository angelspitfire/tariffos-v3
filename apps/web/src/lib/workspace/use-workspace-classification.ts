'use client';

import { useCallback, useRef, useState } from 'react';
import type {
  ApprovalWorkflowMode,
  CanvasTabType,
  IncotermCode,
  JurisdictionConfig,
  StreamProgressEvent,
} from '@tariffos/shared-types';
import { resolveDefaultCanvasTab } from './canvas-tabs';
import { extractWorkspaceAttachments } from './attachment-upload';
import { classifyStream } from './classify-client';
import { applyApprovalPolicyToEnvelope } from './dossier-approval-policy';
import type { WorkspaceAttachment, WorkspaceMessage, WorkspaceThread, WorkspaceToast } from './types';

interface UseWorkspaceClassificationParams {
  threads: readonly WorkspaceThread[];
  activeThreadId: string | null;
  jurisdiction: JurisdictionConfig;
  approvalWorkflowMode: ApprovalWorkflowMode;
  defaultIncoterm?: IncotermCode;
  deepMode?: boolean;
  setActiveThreadId: (id: string | null) => void;
  setSelectedCanvasMsgId: (id: string | null) => void;
  setActiveTab: (tab: CanvasTabType) => void;
  persistThread: (thread: WorkspaceThread) => void;
  pushToast: (title: string, variant?: WorkspaceToast['variant']) => void;
}

export function useWorkspaceClassification({
  threads,
  activeThreadId,
  jurisdiction,
  approvalWorkflowMode,
  defaultIncoterm,
  deepMode,
  setActiveThreadId,
  setSelectedCanvasMsgId,
  setActiveTab,
  persistThread,
  pushToast,
}: UseWorkspaceClassificationParams) {
  const [pendingAttachments, setPendingAttachments] = useState<WorkspaceAttachment[]>([]);
  const pendingRef = useRef<WorkspaceAttachment[]>([]);
  pendingRef.current = pendingAttachments;
  const [isRunning, setIsRunning] = useState(false);
  const [liveProgress, setLiveProgress] = useState<StreamProgressEvent | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendClassification = useCallback(
    async (
      query: string,
      options?: { attachmentsText?: string; isBatchHint?: boolean; forcedThreadId?: string }
    ) => {
      const clean = query.trim();
      if (!clean && pendingAttachments.length === 0) return;

      const attachments = pendingAttachments;
      setPendingAttachments([]);
      const now = new Date().toISOString();
      const targetId = options?.forcedThreadId ?? activeThreadId ?? `thread-${Date.now()}`;
      const existing = threads.find((t) => t.id === targetId);

      const userMsg: WorkspaceMessage = {
        id: `msg-u-${Date.now()}`,
        role: 'user',
        text: clean,
        createdAt: now,
        jurisdictionId: jurisdiction.id,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const draftThread: WorkspaceThread = existing
        ? { ...existing, messages: [...existing.messages, userMsg], updatedAt: now }
        : {
            id: targetId,
            title: clean.slice(0, 48) || 'Nueva clasificación',
            jurisdictionId: jurisdiction.id,
            status: 'regular',
            messages: [userMsg],
            createdAt: now,
            updatedAt: now,
          };

      setActiveThreadId(targetId);
      persistThread(draftThread);
      setIsRunning(true);
      setLiveProgress({ stage: 'pre_gate', label: 'Iniciando clasificación...', progressPct: 10 });

      const controller = new AbortController();
      abortRef.current = controller;
      const startedAt = performance.now();

      try {
        const combinedAttachments = [
          options?.attachmentsText,
          ...attachments.map((a) => a.extractedText ?? a.name),
        ]
          .filter(Boolean)
          .join('\n');

        const imageDataUrls = attachments
          .map((a) => a.imageDataUrl)
          .filter((u): u is string => Boolean(u))
          .slice(0, 2);

        const rawEnvelope = await classifyStream({
          query: clean,
          jurisdiction,
          approvalWorkflowMode,
          incoterm: defaultIncoterm,
          deepMode,
          attachmentsText: combinedAttachments || undefined,
          imageDataUrls: imageDataUrls.length > 0 ? imageDataUrls : undefined,
          isBatchHint: options?.isBatchHint || attachments.length > 0,
          onProgress: setLiveProgress,
          signal: controller.signal,
        });

        const envelope = applyApprovalPolicyToEnvelope(rawEnvelope, approvalWorkflowMode);
        const assistantMsg: WorkspaceMessage = {
          id: `msg-a-${Date.now()}`,
          role: 'assistant',
          text: envelope.assistantMessage,
          createdAt: new Date().toISOString(),
          jurisdictionId: jurisdiction.id,
          envelope,
          latencyMs: Math.round(performance.now() - startedAt),
        };

        persistThread({
          ...draftThread,
          messages: [...draftThread.messages, assistantMsg],
          updatedAt: assistantMsg.createdAt,
        });

        if (envelope.canvasComponents.length > 0) {
          setSelectedCanvasMsgId(assistantMsg.id);
          setActiveTab(resolveDefaultCanvasTab(envelope.canvasComponents));
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          const message =
            err instanceof Error && err.message
              ? err.message
              : 'No se pudo completar la clasificación.';
          pushToast(message, 'warning');
        }
      } finally {
        setIsRunning(false);
        setLiveProgress(null);
        abortRef.current = null;
      }
    },
    [
      activeThreadId,
      approvalWorkflowMode,
      deepMode,
      defaultIncoterm,
      jurisdiction,
      pendingAttachments,
      persistThread,
      pushToast,
      setActiveTab,
      setActiveThreadId,
      setSelectedCanvasMsgId,
      threads,
    ]
  );

  const addFiles = useCallback(async (files: FileList) => {
    const added = await extractWorkspaceAttachments(files);
    setPendingAttachments((prev) => [...prev, ...added]);
  }, []);

  return {
    pendingAttachments,
    isRunning,
    liveProgress,
    sendClassification,
    cancelRun: () => abortRef.current?.abort(),
    addFiles,
    consumePendingAttachments: () => {
      const current = pendingRef.current;
      if (current.length > 0) setPendingAttachments([]);
      return current;
    },
    removeAttachment: (id: string) =>
      setPendingAttachments((prev) => prev.filter((a) => a.id !== id)),
  };
}
