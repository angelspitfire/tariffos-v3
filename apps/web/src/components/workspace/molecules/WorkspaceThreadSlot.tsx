'use client';

import type { ReactNode } from 'react';
import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import type { SampleBatchDocument, SampleMerchandise } from '@/lib/workspace/jurisdictions';
import type { WorkspaceAttachment, WorkspaceMessage } from '@/lib/workspace/types';
import { EveThreadSurface } from '../organisms/EveThreadSurface';
import type { InlineCardActions } from '../organisms/ThreadInlineCards';

export interface WorkspaceThreadSlotProps {
  surfaceKey: string;
  eveSessionId?: string | null;
  jurisdictionId: string;
  countryCode: string;
  messages: readonly WorkspaceMessage[];
  skuPrecedents: readonly SkuPrecedent[];
  pendingAttachments: readonly WorkspaceAttachment[];
  profile: UserProfileSettings;
  inlineActions: InlineCardActions;
  readOnlyReason: string | null;
  batchBanner?: ReactNode;
  onTriggerBatchUpload?: () => void;
  onAddFiles: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
  onConsumeAttachments: () => WorkspaceAttachment[];
  onRunSample: (sample: SampleMerchandise) => void;
  onRunBatchSample: (batch: SampleBatchDocument) => void;
  onUpdateProfile: (patch: Partial<UserProfileSettings>) => void;
  onSessionIdDiscovered: (sessionId: string) => void;
  onSyncChatMessages: (messages: WorkspaceMessage[], latestCanvasMsgId: string | null) => void;
  onRegisterAgentSend: (sendFn: ((text: string) => void) | null) => void;
  onNotifyWarning: (message: string) => void;
}

/** Single Eve durable chat surface slot bound to the active WorkspaceThread's sessionId. */
export function WorkspaceThreadSlot({
  surfaceKey,
  eveSessionId = null,
  jurisdictionId,
  countryCode,
  messages,
  skuPrecedents,
  pendingAttachments,
  profile,
  inlineActions,
  readOnlyReason,
  batchBanner = null,
  onTriggerBatchUpload,
  onAddFiles,
  onRemoveAttachment,
  onConsumeAttachments,
  onRunSample,
  onRunBatchSample,
  onUpdateProfile,
  onSessionIdDiscovered,
  onSyncChatMessages,
  onRegisterAgentSend,
  onNotifyWarning,
}: WorkspaceThreadSlotProps) {
  return (
    <EveThreadSurface
      key={surfaceKey}
      eveSessionId={eveSessionId}
      jurisdictionId={jurisdictionId}
      countryCode={countryCode}
      approvalWorkflowMode={profile.approvalWorkflowMode}
      defaultIncoterm={profile.defaultIncoterm}
      deepMode={profile.detailLevel === 'exhaustive'}
      persistedMessages={messages}
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
      onRunSample={onRunSample}
      onRunBatchSample={onRunBatchSample}
      onUpdateProfile={onUpdateProfile}
      onSessionIdDiscovered={onSessionIdDiscovered}
      onSyncMessages={onSyncChatMessages}
      onRegisterSend={onRegisterAgentSend}
      onErrorToast={onNotifyWarning}
    />
  );
}
