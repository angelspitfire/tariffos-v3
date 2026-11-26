'use client';

import { useMemo } from 'react';
import {
  AssistantRuntimeProvider,
  AuiIf,
  MessagePrimitive,
  ThreadPrimitive,
  useExternalStoreRuntime,
  type AppendMessage,
  type ThreadMessageLike,
} from '@assistant-ui/react';
import { FileText, Scale, Sparkles } from 'lucide-react';
import type { SkuPrecedent, StreamProgressEvent } from '@tariffos/shared-types';
import { SAMPLE_MERCHANDISE, type SampleMerchandise } from '@/lib/workspace/jurisdictions';
import type { WorkspaceAttachment, WorkspaceMessage } from '@/lib/workspace/types';
import { ProgressStagePill } from '../atoms/ProgressStagePill';
import { ThreadInlineCards, type InlineCardActions } from './ThreadInlineCards';
import { WorkspaceComposer } from './WorkspaceComposer';

export interface AssistantThreadSurfaceProps {
  messages: readonly WorkspaceMessage[];
  isRunning: boolean;
  liveProgress: StreamProgressEvent | null;
  skuPrecedents: readonly SkuPrecedent[];
  pendingAttachments: readonly WorkspaceAttachment[];
  inlineActions: InlineCardActions;
  onSendMessage: (text: string) => Promise<void>;
  onCancelRun: () => void;
  onAddFiles: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
  onRunSample: (sample: SampleMerchandise) => void;
}

const convertMessage = (msg: WorkspaceMessage): ThreadMessageLike => ({
  id: msg.id,
  role: msg.role,
  createdAt: new Date(msg.createdAt),
  content: [{ type: 'text', text: msg.text }],
});

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={idx} className="font-semibold text-ink-primary">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

export function AssistantThreadSurface({
  messages,
  isRunning,
  liveProgress,
  skuPrecedents,
  pendingAttachments,
  inlineActions,
  onSendMessage,
  onCancelRun,
  onAddFiles,
  onRemoveAttachment,
  onRunSample,
}: AssistantThreadSurfaceProps) {
  const messageMap = useMemo(() => {
    const map = new Map<string, WorkspaceMessage>();
    for (const item of messages) map.set(item.id, item);
    return map;
  }, [messages]);

  const onNew = async (append: AppendMessage) => {
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
      <ThreadPrimitive.Root className="flex h-full flex-col bg-surface-app">
        <ThreadPrimitive.Viewport className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-2">
          <AuiIf condition={(s) => s.thread.isEmpty}>
            <div className="my-auto flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
                <Scale className="h-5 w-5" aria-hidden="true" />
              </div>
              <h1 className="mt-3 text-base font-semibold text-ink-primary">
                Copiloto de Clasificación Arancelaria
              </h1>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-ink-muted">
                Aplica RGI 1→6 sobre aranceles oficiales, valida fichas merceológicas HITL y liquida tributos CIF deterministas.
              </p>

              <div className="mt-5 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {SAMPLE_MERCHANDISE.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => onRunSample(sample)}
                    className="flex cursor-pointer flex-col items-start rounded-xl border border-border-subtle bg-surface-panel p-3 text-left transition hover:border-accent-border hover:bg-accent-soft"
                  >
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-primary">
                      <Sparkles className="h-3 w-3 text-accent-ink" aria-hidden="true" />
                      {sample.label}
                    </span>
                    <span className="mt-1 line-clamp-2 text-[11px] text-ink-muted">
                      {sample.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </AuiIf>

          <ThreadPrimitive.Messages>
            {({ message }) => {
              const source = messageMap.get(message.id);
              if (message.role === 'user') {
                return (
                  <MessagePrimitive.Root className="flex flex-col items-end gap-1">
                    <div className="max-w-[85%] rounded-2xl bg-surface-inverted px-3.5 py-2.5 text-sm text-ink-on-inverted shadow-xs">
                      <p className="whitespace-pre-wrap">{source?.text}</p>
                      {source?.attachments && source.attachments.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
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
                    </div>
                  </MessagePrimitive.Root>
                );
              }
              return (
                <MessagePrimitive.Root className="flex flex-col items-start gap-1">
                  <div className="w-full max-w-2xl">
                    {source?.text ? (
                      <div className="rounded-2xl border border-border-subtle bg-surface-panel/90 backdrop-blur-md px-3.5 py-2.5 text-sm leading-relaxed text-ink-primary shadow-xs whitespace-pre-wrap">
                        {renderInlineBold(source.text)}
                      </div>
                    ) : null}
                    {source ? <ThreadInlineCards message={source} actions={inlineActions} /> : null}
                  </div>
                </MessagePrimitive.Root>
              );
            }}
          </ThreadPrimitive.Messages>

          {isRunning && liveProgress ? (
            <div className="max-w-md">
              <ProgressStagePill event={liveProgress} />
            </div>
          ) : null}

          <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mt-auto bg-gradient-to-t from-surface-app via-surface-app to-transparent pt-3 pb-3">
            <WorkspaceComposer
              skuPrecedents={skuPrecedents}
              pendingAttachments={pendingAttachments}
              onAddFiles={onAddFiles}
              onRemoveAttachment={onRemoveAttachment}
            />
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}
