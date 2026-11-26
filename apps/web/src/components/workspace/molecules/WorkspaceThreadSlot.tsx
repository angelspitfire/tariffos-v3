'use client';

import type { ReactNode } from 'react';
import type {
  SkuPrecedent,
  StreamProgressEvent,
  UserProfileSettings,
} from '@tariffos/shared-types';
import type { AgentRuntimeMode } from '@/lib/runtime-config';
import type { SampleBatchDocument, SampleMerchandise } from '@/lib/workspace/jurisdictions';
import type { WorkspaceAttachment, WorkspaceMessage } from '@/lib/workspace/types';
import { AssistantThreadSurface } from '../organisms/AssistantThreadSurface';
import { EveThreadSurface } from '../organisms/EveThreadSurface';
import type { InlineCardActions } from '../organisms/ThreadInlineCards';

export interface WorkspaceThreadSlotProps {
  runtimeMode: AgentRuntimeMode;
  eveSessionKey: number;
  jurisdictionId: string;
  messages: readonly WorkspaceMessage[];
  isRunning: boolean;
  liveProgress: StreamProgressEvent | null;
  skuPrecedents: readonly SkuPrecedent[];
  pendingAttachments: readonly WorkspaceAttachment[];
  profile: UserProfileSettings;
  inlineActions: InlineCardActions;
  readOnlyReason: string | null;
  batchBanner?: ReactNode;
  onTriggerBatchUpload?: () => void;
  onSendMessage: (
    prompt: string,
    opts?: { attachmentsText?: string; isBatchHint?: boolean },
  ) => Promise<void>;
  onCancelRun: () => void;
  onAddFiles: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
  onConsumeAttachments: () => WorkspaceAttachment[];
  onRunSample: (sample: SampleMerchandise) => void;
  onRunBatchSample: (batch: SampleBatchDocument) => void;
  onUpdateProfile: (patch: Partial<UserProfileSettings>) => void;
  onEnvelopeDiscovered: (message: WorkspaceMessage) => void;
  onRegisterEveSend: (sendFn: ((text: string) => void) | null) => void;
  onNotifyInfo: (message: string) => void;
  onNotifyWarning: (message: string) => void;
}

export function WorkspaceThreadSlot({
  runtimeMode,
  eveSessionKey,
  jurisdictionId,
  messages,
  isRunning,
  liveProgress,
  skuPrecedents,
  pendingAttachments,
  profile,
  inlineActions,
  readOnlyReason,
  batchBanner = null,
  onTriggerBatchUpload,
  onSendMessage,
  onCancelRun,
  onAddFiles,
  onRemoveAttachment,
  onConsumeAttachments,
  onRunSample,
  onRunBatchSample,
  onUpdateProfile,
  onEnvelopeDiscovered,
  onRegisterEveSend,
  onNotifyInfo,
  onNotifyWarning,
}: WorkspaceThreadSlotProps) {
  if (runtimeMode === 'eve') {
    return (
      <EveThreadSurface
        key={eveSessionKey}
        jurisdictionId={jurisdictionId}
        approvalWorkflowMode={profile.approvalWorkflowMode}
        defaultIncoterm={profile.defaultIncoterm}
        deepMode={profile.detailLevel === 'exhaustive'}
        skuPrecedents={skuPrecedents}
        pendingAttachments={pendingAttachments}
        profile={profile}
        inlineActions={inlineActions}
        readOnlyReason={readOnlyReason}
        batchBanner={batchBanner}
        onTriggerBatchUpload={onTriggerBatchUpload}
        onAddFiles={onAddFiles}
        onRemoveAttachment={onRemoveAttachment}
        onConsumeAttachments={onConsumeAttachments}
        onRunSample={(s) => void onSendMessage(s.description)}
        onRunBatchSample={(b) =>
          void onSendMessage(`${b.promptText}\n\n${b.documentText}`, { isBatchHint: true })
        }
        onUpdateProfile={onUpdateProfile}
        onNotifyUnavailableCamera={() =>
          onNotifyInfo('Usa el botón + o pega una imagen con Ctrl+V para escanear documentos.')
        }
        onEnvelopeDiscovered={onEnvelopeDiscovered}
        onRegisterSend={onRegisterEveSend}
        onErrorToast={onNotifyWarning}
      />
    );
  }

  return (
    <AssistantThreadSurface
      messages={messages}
      isRunning={isRunning}
      liveProgress={liveProgress}
      skuPrecedents={skuPrecedents}
      pendingAttachments={pendingAttachments}
      profile={profile}
      inlineActions={inlineActions}
      readOnlyReason={readOnlyReason}
      batchBanner={batchBanner}
      onTriggerBatchUpload={onTriggerBatchUpload}
      onSendMessage={(text) => onSendMessage(text)}
      onCancelRun={onCancelRun}
      onAddFiles={onAddFiles}
      onRemoveAttachment={onRemoveAttachment}
      onRunSample={onRunSample}
      onRunBatchSample={onRunBatchSample}
      onUpdateProfile={onUpdateProfile}
      onNotifyUnavailableCamera={() =>
        onNotifyInfo('Usa el botón + o pega una imagen con Ctrl+V para escanear documentos.')
      }
    />
  );
}
