'use client';

import type { ReactNode } from 'react';
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

export interface EveThreadSurfaceProps {
  jurisdictionId: string;
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
  onEnvelopeDiscovered: (message: WorkspaceMessage) => void;
  onRegisterSend: (sendFn: ((text: string) => void) | null) => void;
  onErrorToast: (message: string) => void;
}

export function EveThreadSurface({
  jurisdictionId,
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
  onEnvelopeDiscovered,
  onRegisterSend,
  onErrorToast,
}: EveThreadSurfaceProps) {
  const runtime = useEveAgentRuntime({
    baseUrl: getEveBaseUrl() || undefined,
    isSendDisabled: Boolean(readOnlyReason),
    prepareSend: (input) => {
      if (!('message' in input) || input.message === undefined) return input;
      const attachments = onConsumeAttachments();
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
        clientContext: { jurisdictionId, defaultIncoterm, deepMode, approvalWorkflowMode },
      };
    },
    onError: (err) => {
      onErrorToast(err.message || 'No se pudo completar la consulta con el agente Eve.');
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <EveRuntimeObserver
        jurisdictionId={jurisdictionId}
        approvalWorkflowMode={approvalWorkflowMode}
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
      >
        <EveExternalMessages messages={persistedMessages} inlineActions={inlineActions} />
        <ThreadPrimitive.Messages>
          {({ message }) => (
            <EveMessageItem
              message={message}
              jurisdictionId={jurisdictionId}
              approvalWorkflowMode={approvalWorkflowMode}
              inlineActions={inlineActions}
            />
          )}
        </ThreadPrimitive.Messages>
      </WorkspaceThreadShell>
    </AssistantRuntimeProvider>
  );
}
