'use client';

import { useMemo, useRef, type ReactNode } from 'react';
import { AssistantRuntimeProvider, ThreadPrimitive } from '@assistant-ui/react';
import { useEveAgentRuntime } from '@assistant-ui/eve';
import type {
  ApprovalWorkflowMode,
  IncotermCode,
  SkuPrecedent,
  UserProfileSettings,
} from '@tariffos/shared-types';
import { getEveBaseUrl } from '@/lib/runtime-config';
import { buildEvePayloadWithAttachments } from '@/lib/workspace/eve-attachments';
import type { SampleBatchDocument, SampleMerchandise } from '@/lib/workspace/jurisdictions';
import type { WorkspaceAttachment, WorkspaceMessage } from '@/lib/workspace/types';
import { EveExternalMessages } from '../molecules/EveExternalMessages';
import { EveMessageItem } from '../molecules/EveMessageItem';
import { EveRuntimeObserver } from '../molecules/EveRuntimeObserver';
import type { InlineCardActions } from './ThreadInlineCards';
import { WorkspaceThreadShell } from './WorkspaceThreadShell';

const EVE_UNREACHABLE_RE = /internal server error|failed to fetch|econnrefused|networkerror|502|503|504/i;

function formatEveRuntimeError(err: Error): string {
  const message = err.message?.trim() ?? '';
  if (EVE_UNREACHABLE_RE.test(message)) {
    return 'No se pudo conectar con el agente Eve (puerto 2000). Inicia el entorno con "pnpm dev" o "pnpm dev:eve".';
  }
  return message || 'No se pudo completar la consulta con el agente Eve.';
}

export interface EveThreadSurfaceProps {
  eveSessionId?: string | null;
  jurisdictionId: string;
  countryCode?: string;
  approvalWorkflowMode: ApprovalWorkflowMode;
  defaultIncoterm?: IncotermCode;
  deepMode?: boolean;
  persistedMessages?: readonly WorkspaceMessage[];
  skuPrecedents: readonly SkuPrecedent[];
  pendingAttachments: readonly WorkspaceAttachment[];
  profile: UserProfileSettings;
  inlineActions: InlineCardActions;
  readOnlyReason?: string | null;
  batchBanner?: ReactNode;
  onTriggerBatchUpload?: () => void;
  onAddFiles: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
  onConsumeAttachments: () => WorkspaceAttachment[];
  onRunSample: (sample: SampleMerchandise) => void;
  onRunBatchSample: (batch: SampleBatchDocument) => void;
  onUpdateProfile: (patch: Partial<UserProfileSettings>) => void;
  onSessionIdDiscovered?: (sessionId: string) => void;
  onSyncMessages?: (messages: WorkspaceMessage[], latestCanvasMsgId: string | null) => void;
  onEnvelopeDiscovered?: (message: WorkspaceMessage) => void;
  onRegisterSend: (sendFn: ((text: string) => void) | null) => void;
  onErrorToast: (message: string) => void;
}

export function EveThreadSurface({
  eveSessionId = null,
  jurisdictionId,
  countryCode = 'VE',
  approvalWorkflowMode,
  defaultIncoterm = 'FOB',
  deepMode = false,
  persistedMessages = [],
  skuPrecedents,
  pendingAttachments,
  profile,
  inlineActions,
  readOnlyReason = null,
  batchBanner = null,
  onTriggerBatchUpload,
  onAddFiles,
  onRemoveAttachment,
  onConsumeAttachments,
  onRunSample,
  onRunBatchSample,
  onUpdateProfile,
  onSessionIdDiscovered,
  onSyncMessages,
  onEnvelopeDiscovered,
  onRegisterSend,
  onErrorToast,
}: EveThreadSurfaceProps) {
  const reportedSessionRef = useRef<string | null>(eveSessionId);
  const messageAuthorById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of persistedMessages) {
      if (m.authorName) map.set(m.id, m.authorName);
    }
    return map;
  }, [persistedMessages]);
  const initialSession = useMemo(
    () => (eveSessionId ? { sessionId: eveSessionId, streamIndex: 0 } : undefined),
    [eveSessionId],
  );
  const contextRef = useRef({
    jurisdictionId, countryCode, defaultIncoterm, deepMode, approvalWorkflowMode,
    webEnrichmentEnabled: profile.webEnrichmentEnabled !== false,
    onConsumeAttachments, onSessionIdDiscovered, onErrorToast,
  });
  contextRef.current = {
    jurisdictionId, countryCode, defaultIncoterm, deepMode, approvalWorkflowMode,
    webEnrichmentEnabled: profile.webEnrichmentEnabled !== false,
    onConsumeAttachments, onSessionIdDiscovered, onErrorToast,
  };

  const runtime = useEveAgentRuntime({
    baseUrl: getEveBaseUrl() || undefined,
    ...(initialSession ? { initialSession, resume: true } : {}),
    isSendDisabled: Boolean(readOnlyReason),
    prepareSend: (input) => {
      if (!('message' in input) || input.message === undefined) return input;
      const ctx = contextRef.current;
      const attachments = ctx.onConsumeAttachments();
      const baseText =
        typeof input.message === 'string'
          ? input.message
          : input.message
              .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
              .map((p) => p.text)
              .join('\n');
      const nextMessage =
        attachments.length > 0 ? buildEvePayloadWithAttachments(baseText, attachments) : input.message;
      return {
        ...input,
        message: nextMessage,
        clientContext: {
          jurisdictionId: ctx.jurisdictionId,
          countryCode: ctx.countryCode,
          defaultIncoterm: ctx.defaultIncoterm,
          deepMode: ctx.deepMode,
          approvalWorkflowMode: ctx.approvalWorkflowMode,
          webEnrichmentEnabled: ctx.webEnrichmentEnabled,
        },
      };
    },
    onSessionChange: (session) => {
      if (session?.sessionId && session.sessionId !== reportedSessionRef.current) {
        reportedSessionRef.current = session.sessionId;
        contextRef.current.onSessionIdDiscovered?.(session.sessionId);
      }
    },
    onError: (err) => {
      contextRef.current.onErrorToast(formatEveRuntimeError(err));
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <EveRuntimeObserver
        jurisdictionId={jurisdictionId}
        approvalWorkflowMode={approvalWorkflowMode}
        onSyncMessages={onSyncMessages}
        onEnvelopeDiscovered={onEnvelopeDiscovered}
        onRegisterSend={onRegisterSend}
      />
      <WorkspaceThreadShell
        skuPrecedents={skuPrecedents}
        pendingAttachments={pendingAttachments}
        profile={profile}
        readOnlyReason={readOnlyReason}
        hasExternalMessages={persistedMessages.length > 0}
        batchBanner={batchBanner}
        onTriggerBatchUpload={onTriggerBatchUpload}
        onAddFiles={onAddFiles}
        onRemoveAttachment={onRemoveAttachment}
        onRunSample={onRunSample}
        onRunBatchSample={onRunBatchSample}
        onUpdateProfile={onUpdateProfile}
        onNotifyWarning={onErrorToast}
      >
        <EveExternalMessages
          messages={persistedMessages}
          hasEveSession={Boolean(eveSessionId)}
          inlineActions={inlineActions}
        />
        <ThreadPrimitive.Messages>
          {({ message }) => (
            <EveMessageItem
              message={message}
              jurisdictionId={jurisdictionId}
              approvalWorkflowMode={approvalWorkflowMode}
              inlineActions={inlineActions}
              authorName={message.role === 'user' ? messageAuthorById.get(message.id) : undefined}
            />
          )}
        </ThreadPrimitive.Messages>
      </WorkspaceThreadShell>
    </AssistantRuntimeProvider>
  );
}
