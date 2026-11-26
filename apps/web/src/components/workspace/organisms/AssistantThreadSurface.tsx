'use client';

import { useMemo, useRef, useState } from 'react';
import {
  AssistantRuntimeProvider,
  AuiIf,
  MessagePrimitive,
  ThreadPrimitive,
  useExternalStoreRuntime,
  type AppendMessage,
  type ThreadMessageLike,
} from '@assistant-ui/react';
import { FileText } from 'lucide-react';
import type { SkuPrecedent, StreamProgressEvent, UserProfileSettings } from '@tariffos/shared-types';
import type { SampleBatchDocument, SampleMerchandise } from '@/lib/workspace/jurisdictions';
import type { WorkspaceAttachment, WorkspaceMessage } from '@/lib/workspace/types';
import { InlineMarkdownText } from '../atoms/InlineMarkdownText';
import { ProgressStagePill } from '../atoms/ProgressStagePill';
import { WorkspaceEmptyState } from '../molecules/WorkspaceEmptyState';
import { WorkspaceReadOnlyBar } from '../molecules/WorkspaceReadOnlyBar';
import { ThreadInlineCards, type InlineCardActions } from './ThreadInlineCards';
import { WorkspaceComposer } from './WorkspaceComposer';

export interface AssistantThreadSurfaceProps {
  messages: readonly WorkspaceMessage[];
  isRunning: boolean;
  liveProgress: StreamProgressEvent | null;
  skuPrecedents: readonly SkuPrecedent[];
  pendingAttachments: readonly WorkspaceAttachment[];
  profile: UserProfileSettings;
  inlineActions: InlineCardActions;
  readOnlyReason?: string | null;
  onSendMessage: (text: string) => Promise<void>;
  onCancelRun: () => void;
  onAddFiles: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
  onRunSample: (sample: SampleMerchandise) => void;
  onRunBatchSample: (batch: SampleBatchDocument) => void;
  onUpdateProfile: (patch: Partial<UserProfileSettings>) => void;
  onNotifyUnavailableCamera?: () => void;
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
  onSendMessage,
  onCancelRun,
  onAddFiles,
  onRemoveAttachment,
  onRunSample,
  onRunBatchSample,
  onUpdateProfile,
  onNotifyUnavailableCamera,
}: AssistantThreadSurfaceProps) {
  const hiddenUploadRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
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
      <input
        ref={hiddenUploadRef}
        type="file"
        multiple
        accept=".pdf,.xlsx,.xls,.csv,.txt,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onAddFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />
      <ThreadPrimitive.Root
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingFiles(true);
        }}
        onDragLeave={() => setIsDraggingFiles(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingFiles(false);
          if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            onAddFiles(e.dataTransfer.files);
          }
        }}
        className={`flex h-full min-w-0 flex-col overflow-x-hidden bg-transparent transition-colors ${
          isDraggingFiles ? 'ring-2 ring-inset ring-accent-brand/60 bg-accent-soft/20' : ''
        }`}
      >
        <ThreadPrimitive.Viewport className="flex flex-1 min-w-0 flex-col gap-5 overflow-y-auto overflow-x-hidden px-3 sm:px-6 pt-5 pb-2">
          <AuiIf condition={(s) => s.thread.isEmpty}>
            <WorkspaceEmptyState
              onFocusComposer={() => {
                const input = document.querySelector<HTMLTextAreaElement>(
                  'textarea[aria-label="Consulta arancelaria o descripción de mercancía"]',
                );
                input?.focus();
              }}
              onTriggerUpload={() => hiddenUploadRef.current?.click()}
              onRunSample={onRunSample}
              onRunBatchSample={onRunBatchSample}
            />
          </AuiIf>

          <ThreadPrimitive.Messages>
            {({ message }) => {
              const source = messageMap.get(message.id);
              const timestamp = source?.createdAt
                ? new Date(source.createdAt).toLocaleTimeString('es-VE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              if (message.role === 'user') {
                return (
                  <MessagePrimitive.Root className="max-w-2xl mx-auto w-full flex justify-end">
                    <div className="max-w-[85%] bg-surface-inverted text-ink-on-inverted dark:border dark:border-border-subtle rounded-[22px] rounded-br-md px-4 py-3 shadow-sm space-y-2">
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        {source?.text}
                      </p>
                      {source?.attachments && source.attachments.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {source.attachments.map((att) => (
                            <span
                              key={att.id}
                              className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-0.5 text-[11px]"
                            >
                              <FileText className="h-3 w-3" aria-hidden="true" />
                              {att.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {timestamp ? (
                        <div className="text-[10px] text-slate-400 font-mono tabular-nums text-right">
                          {timestamp}
                        </div>
                      ) : null}
                    </div>
                  </MessagePrimitive.Root>
                );
              }

              return (
                <MessagePrimitive.Root className="max-w-2xl mx-auto w-full flex items-start gap-3">
                  <div
                    aria-hidden="true"
                    className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5"
                  >
                    T
                  </div>
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-ink-muted">
                      <span className="font-semibold text-ink-primary">TariffOS</span>
                      {timestamp ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{timestamp}</span>
                        </>
                      ) : null}
                    </div>
                    {source?.text ? (
                      <div className="text-sm leading-relaxed text-ink-primary whitespace-pre-line">
                        <InlineMarkdownText text={source.text} />
                      </div>
                    ) : null}
                    {source ? <ThreadInlineCards message={source} actions={inlineActions} /> : null}
                  </div>
                </MessagePrimitive.Root>
              );
            }}
          </ThreadPrimitive.Messages>

          {isRunning && liveProgress ? (
            <div className="max-w-2xl mx-auto w-full">
              <ProgressStagePill event={liveProgress} />
            </div>
          ) : null}

          <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mt-auto bg-gradient-to-t from-surface-app via-surface-app/90 to-transparent pt-3 pb-3">
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
                onNotifyUnavailableCamera={onNotifyUnavailableCamera}
              />
            )}
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}
