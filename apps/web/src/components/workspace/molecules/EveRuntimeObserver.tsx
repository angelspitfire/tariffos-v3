'use client';

import { useEffect, useRef } from 'react';
import { useAui, useAuiState } from '@assistant-ui/react';
import type { ApprovalWorkflowMode } from '@tariffos/shared-types';
import { applyApprovalPolicyToEnvelope } from '@/lib/workspace/dossier-approval-policy';
import { toWorkspaceMessageFromEve } from '@/lib/workspace/eve-message-mapper';
import type { WorkspaceMessage } from '@/lib/workspace/types';

export interface EveRuntimeObserverProps {
  jurisdictionId: string;
  approvalWorkflowMode: ApprovalWorkflowMode;
  onSyncMessages?: (messages: WorkspaceMessage[], latestCanvasMsgId: string | null) => void;
  onEnvelopeDiscovered?: (message: WorkspaceMessage) => void;
  onRegisterSend: (sendFn: ((text: string) => void) | null) => void;
}

/**
 * Observes live Eve thread messages, syncs full turns + A2UI envelopes into
 * workspace persistence, and exposes imperative append for shell triggers.
 */
export function EveRuntimeObserver({
  jurisdictionId,
  approvalWorkflowMode,
  onSyncMessages,
  onEnvelopeDiscovered,
  onRegisterSend,
}: EveRuntimeObserverProps) {
  const aui = useAui();
  const messages = useAuiState((s) => s.thread.messages);
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const seenEnvelopesRef = useRef<Map<string, string>>(new Map());
  const lastSyncSigRef = useRef<string>('');

  useEffect(() => {
    onRegisterSend((text: string) => aui.thread().append(text));
    return () => onRegisterSend(null);
  }, [aui, onRegisterSend]);

  useEffect(() => {
    if (messages.length === 0) return;

    const mappedAll: WorkspaceMessage[] = [];
    let latestCanvasMsgId: string | null = null;

    for (const msg of messages) {
      if (msg.role !== 'user' && msg.role !== 'assistant') continue;
      const mapped = toWorkspaceMessageFromEve({
        id: msg.id,
        role: msg.role,
        createdAt: msg.createdAt,
        content: msg.content,
        jurisdictionId,
      });

      const normalized: WorkspaceMessage = mapped.envelope
        ? {
            ...mapped,
            envelope: applyApprovalPolicyToEnvelope(mapped.envelope, approvalWorkflowMode),
          }
        : mapped;

      if (normalized.role === 'assistant' && normalized.envelope) {
        const envSig = JSON.stringify(normalized.envelope);
        if (seenEnvelopesRef.current.get(normalized.id) !== envSig) {
          seenEnvelopesRef.current.set(normalized.id, envSig);
          onEnvelopeDiscovered?.(normalized);
        }
        if (normalized.envelope.canvasComponents.length > 0) {
          latestCanvasMsgId = normalized.id;
        }
      }

      if (normalized.text || normalized.envelope) {
        mappedAll.push(normalized);
      }
    }

    if (!onSyncMessages || mappedAll.length === 0) return;
    if (isRunning && !latestCanvasMsgId) return;

    const sig = JSON.stringify(
      mappedAll.map((m) => [
        m.id,
        m.role,
        m.text,
        m.envelope?.classificationStatus ?? null,
        m.envelope?.canvasComponents.map((c) => c.id) ?? [],
      ]),
    );
    if (sig === lastSyncSigRef.current) return;
    lastSyncSigRef.current = sig;
    onSyncMessages(mappedAll, latestCanvasMsgId);
  }, [
    approvalWorkflowMode,
    isRunning,
    jurisdictionId,
    messages,
    onEnvelopeDiscovered,
    onSyncMessages,
  ]);

  return null;
}
