'use client';

import { useRef, useState, type ReactNode } from 'react';
import {
  AssistantRuntimeProvider,
  AuiIf,
  ThreadPrimitive,
} from '@assistant-ui/react';
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
import { EveMessageItem } from '../molecules/EveMessageItem';
import { EveRuntimeObserver } from '../molecules/EveRuntimeObserver';
import { WorkspaceEmptyState } from '../molecules/WorkspaceEmptyState';
import { WorkspaceReadOnlyBar } from '../molecules/WorkspaceReadOnlyBar';
import { type InlineCardActions } from './ThreadInlineCards';
import { WorkspaceComposer } from './WorkspaceComposer';

export interface EveThreadSurfaceProps {
  jurisdictionId: string;
  approvalWorkflowMode: ApprovalWorkflowMode;
  defaultIncoterm?: IncotermCode;
  deepMode?: boolean;
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
  onNotifyUnavailableCamera?: () => void;
  onEnvelopeDiscovered: (message: WorkspaceMessage) => void;
  onRegisterSend: (sendFn: ((text: string) => void) | null) => void;
  onErrorToast: (message: string) => void;
}

const ACCEPTED_FILES = '.pdf,.xlsx,.xls,.csv,.txt,.png,.jpg,.jpeg,.webp';

export function EveThreadSurface({
  jurisdictionId,
  approvalWorkflowMode,
  defaultIncoterm = 'FOB',
  deepMode = false,
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
  onNotifyUnavailableCamera,
  onEnvelopeDiscovered,
  onRegisterSend,
  onErrorToast,
}: EveThreadSurfaceProps) {
  const hiddenUploadRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

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
      <input
        ref={hiddenUploadRef}
        type="file"
        multiple
        accept={ACCEPTED_FILES}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            onAddFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />
      <ThreadPrimitive.Root
        onDragOver={(e) => { e.preventDefault(); setIsDraggingFiles(true); }}
        onDragLeave={() => setIsDraggingFiles(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingFiles(false);
          if (e.dataTransfer?.files?.length) onAddFiles(e.dataTransfer.files);
        }}
        className={`flex h-full min-w-0 flex-col overflow-x-hidden bg-transparent transition-colors ${
          isDraggingFiles ? 'ring-2 ring-inset ring-accent-brand/60 bg-accent-soft/20' : ''
        }`}
      >
        <ThreadPrimitive.Viewport className="flex flex-1 min-w-0 flex-col gap-5 overflow-y-auto overflow-x-hidden px-3 sm:px-6 pt-5 pb-2">
          <AuiIf condition={(s) => s.thread.isEmpty}>
            <WorkspaceEmptyState
              onFocusComposer={() => {
                document.querySelector<HTMLTextAreaElement>(
                  'textarea[aria-label="Consulta arancelaria o descripción de mercancía"]',
                )?.focus();
              }}
              onTriggerUpload={() => hiddenUploadRef.current?.click()}
              onTriggerBatchUpload={onTriggerBatchUpload}
              onRunSample={onRunSample}
              onRunBatchSample={onRunBatchSample}
            />
          </AuiIf>
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
          <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mt-auto space-y-2 bg-gradient-to-t from-surface-app via-surface-app/90 to-transparent pt-3 pb-3">
            {batchBanner}
            {readOnlyReason ? (
              <WorkspaceReadOnlyBar reason={readOnlyReason} />
            ) : (
              <WorkspaceComposer
                skuPrecedents={skuPrecedents}
                pendingAttachments={pendingAttachments}
                profile={profile}
                onAddFiles={onAddFiles}
                onRemoveAttachment={onRemoveAttachment}
                onUpdateProfile={onUpdateProfile}
                onTriggerBatchUpload={onTriggerBatchUpload}
                onNotifyUnavailableCamera={onNotifyUnavailableCamera}
              />
            )}
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}
