import type {
  ApprovalWorkflowMode,
  CanvasTabType,
  JurisdictionConfig,
  StreamProgressEvent,
} from '@tariffos/shared-types';
import { resolveDefaultCanvasTab } from './canvas-tabs';
import { classifyStream } from './classify-client';
import { applyApprovalPolicyToEnvelope } from './dossier-approval-policy';
import type { WorkspaceAttachment, WorkspaceMessage, WorkspaceThread } from './types';

export interface RunClassificationParams {
  query: string;
  attachments: readonly WorkspaceAttachment[];
  existingThread: WorkspaceThread | undefined;
  targetThreadId: string;
  jurisdiction: JurisdictionConfig;
  approvalWorkflowMode: ApprovalWorkflowMode;
  attachmentsText?: string;
  isBatchHint?: boolean;
  signal: AbortSignal;
  onProgress: (event: StreamProgressEvent) => void;
  onDraftThread: (thread: WorkspaceThread) => void;
}

export interface RunClassificationResult {
  completedThread: WorkspaceThread;
  assistantMessageId: string;
  defaultCanvasTab: CanvasTabType | null;
}

export async function runWorkspaceClassification(
  params: RunClassificationParams,
): Promise<RunClassificationResult> {
  const now = new Date().toISOString();
  const userMsg: WorkspaceMessage = {
    id: `msg-u-${Date.now()}`,
    role: 'user',
    text: params.query,
    createdAt: now,
    jurisdictionId: params.jurisdiction.id,
    attachments: params.attachments.length > 0 ? [...params.attachments] : undefined,
  };

  const draftThread: WorkspaceThread = params.existingThread
    ? {
        ...params.existingThread,
        messages: [...params.existingThread.messages, userMsg],
        updatedAt: now,
      }
    : {
        id: params.targetThreadId,
        title: params.query.slice(0, 48) || 'Nueva clasificación',
        jurisdictionId: params.jurisdiction.id,
        status: 'regular',
        messages: [userMsg],
        createdAt: now,
        updatedAt: now,
      };

  params.onDraftThread(draftThread);

  const startedAt = performance.now();
  const combinedAttachments = [
    params.attachmentsText,
    ...params.attachments.map((a) => a.extractedText ?? a.name),
  ]
    .filter(Boolean)
    .join('\n');

  const rawEnvelope = await classifyStream({
    query: params.query,
    jurisdiction: params.jurisdiction,
    attachmentsText: combinedAttachments || undefined,
    isBatchHint: params.isBatchHint || params.attachments.length > 0,
    onProgress: params.onProgress,
    signal: params.signal,
  });

  const envelope = applyApprovalPolicyToEnvelope(rawEnvelope, params.approvalWorkflowMode);
  const assistantMsg: WorkspaceMessage = {
    id: `msg-a-${Date.now()}`,
    role: 'assistant',
    text: envelope.assistantMessage,
    createdAt: new Date().toISOString(),
    jurisdictionId: params.jurisdiction.id,
    envelope,
    latencyMs: Math.round(performance.now() - startedAt),
  };

  const completedThread: WorkspaceThread = {
    ...draftThread,
    messages: [...draftThread.messages, assistantMsg],
    updatedAt: assistantMsg.createdAt,
  };

  return {
    completedThread,
    assistantMessageId: assistantMsg.id,
    defaultCanvasTab:
      envelope.canvasComponents.length > 0
        ? resolveDefaultCanvasTab(envelope.canvasComponents)
        : null,
  };
}
