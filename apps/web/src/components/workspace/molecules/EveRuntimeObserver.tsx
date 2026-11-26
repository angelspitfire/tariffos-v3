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
  onEnvelopeDiscovered: (message: WorkspaceMessage) => void;
  onRegisterSend: (sendFn: ((text: string) => void) | null) => void;
}

/** Observes Eve thread messages and exposes imperative append for shell triggers. */
export function EveRuntimeObserver({
  jurisdictionId,
  approvalWorkflowMode,
  onEnvelopeDiscovered,
  onRegisterSend,
}: EveRuntimeObserverProps) {
  const aui = useAui();
  const messages = useAuiState((s) => s.thread.messages);
  const seenRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    onRegisterSend((text: string) => aui.thread().append(text));
    return () => onRegisterSend(null);
  }, [aui, onRegisterSend]);

  useEffect(() => {
    for (const msg of messages) {
      if (msg.role !== 'assistant') continue;
      const mapped = toWorkspaceMessageFromEve({
        id: msg.id,
        role: 'assistant',
        createdAt: msg.createdAt,
        content: msg.content,
        jurisdictionId,
      });
      if (!mapped.envelope) continue;
      const policyEnvelope = applyApprovalPolicyToEnvelope(mapped.envelope, approvalWorkflowMode);
      const signature = JSON.stringify(policyEnvelope);
      if (seenRef.current.get(msg.id) === signature) continue;
      seenRef.current.set(msg.id, signature);
      onEnvelopeDiscovered({ ...mapped, envelope: policyEnvelope });
    }
  }, [approvalWorkflowMode, jurisdictionId, messages, onEnvelopeDiscovered]);

  return null;
}
