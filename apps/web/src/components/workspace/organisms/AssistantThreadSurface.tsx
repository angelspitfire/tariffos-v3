'use client';

import { useMemo, type ReactNode } from 'react';
import {
  AssistantRuntimeProvider,
  MessagePrimitive,
  ThreadPrimitive,
  useExternalStoreRuntime,
  type AppendMessage,
  type ThreadMessageLike,
} from '@assistant-ui/react';
import type { SkuPrecedent, StreamProgressEvent, UserProfileSettings } from '@tariffos/shared-types';
import type { SampleBatchDocument, SampleMerchandise } from '@/lib/workspace/jurisdictions';
import type { WorkspaceAttachment, WorkspaceMessage } from '@/lib/workspace/types';
import { ProgressStagePill } from '../atoms/ProgressStagePill';
import { WorkspaceMessageBubble } from '../molecules/WorkspaceMessageBubble';
import type { InlineCardActions } from './ThreadInlineCards';
import { WorkspaceThreadShell } from './WorkspaceThreadShell';

export interface AssistantThreadSurfaceProps {
  messages: readonly WorkspaceMessage[];
  isRunning: boolean;
  liveProgress: StreamProgressEvent | null;
  skuPrecedents: readonly SkuPrecedent[];
  pendingAttachments: readonly WorkspaceAttachment[];
  profile: UserProfileSettings;
  inlineActions: InlineCardActions;
  readOnlyReason?: string | null;
  batchBanner?: ReactNode;
  onTriggerBatchUpload?: () => void;
  onSendMessage: (text: string) => Promise<void>;
  onCancelRun: () => void;
  onAddFiles: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
  onRunSample: (sample: SampleMerchandise) => void;
  onRunBatchSample: (batch: SampleBatchDocument) => void;
  onUpdateProfile: (patch: Partial<UserProfileSettings>) => void;
}

const convertMessage = (msg: WorkspaceMessage): ThreadMessageLike => ({
  id: msg.id,
  role: msg.role,
  createdAt: new Date(msg.createdAt),
  content: [{ type: 'text', text: msg.text }],
});

export function AssistantThreadSurface({
  messages,
  isRunning,
  liveProgress,
  skuPrecedents,
  pendingAttachments,
  profile,
  inlineActions,
  readOnlyReason = null,
  batchBanner = null,
  onTriggerBatchUpload,
  onSendMessage,
  onCancelRun,
  onAddFiles,
  onRemoveAttachment,
  onRunSample,
  onRunBatchSample,
  onUpdateProfile,
}: AssistantThreadSurfaceProps) {
  const messageMap = useMemo(() => {
    const map = new Map<string, WorkspaceMessage>();
    for (const item of messages) map.set(item.id, item);
    return map;
  }, [messages]);

  const onNew = async (append: AppendMessage) => {
    if (readOnlyReason) return;
    const textPart = append.content.find((part) => part.type === 'text');
    const text = textPart && textPart.type === 'text' ? textPart.text.trim() : '';
    if (!text && pendingAttachments.length === 0) return;
    await onSendMessage(text || `Clasificar documentos adjuntos (${pendingAttachments.length})`);
  };

  const runtime = useExternalStoreRuntime({
    isRunning,
    messages,
    convertMessage,
    onNew,
    onCancel: async () => onCancelRun(),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <WorkspaceThreadShell
        skuPrecedents={skuPrecedents}
        pendingAttachments={pendingAttachments}
        profile={profile}
        readOnlyReason={readOnlyReason}
        batchBanner={batchBanner}
        onTriggerBatchUpload={onTriggerBatchUpload}
        onAddFiles={onAddFiles}
        onRemoveAttachment={onRemoveAttachment}
        onRunSample={onRunSample}
        onRunBatchSample={onRunBatchSample}
        onUpdateProfile={onUpdateProfile}
      >
        <ThreadPrimitive.Messages>
          {({ message }) => {
            const source = messageMap.get(message.id);
            if (!source) return null;
            return (
              <MessagePrimitive.Root>
                <WorkspaceMessageBubble message={source} inlineActions={inlineActions} />
              </MessagePrimitive.Root>
            );
          }}
        </ThreadPrimitive.Messages>

        {isRunning && liveProgress ? (
          <div className="max-w-2xl mx-auto w-full">
            <ProgressStagePill event={liveProgress} />
          </div>
        ) : null}
      </WorkspaceThreadShell>
    </AssistantRuntimeProvider>
  );
}
