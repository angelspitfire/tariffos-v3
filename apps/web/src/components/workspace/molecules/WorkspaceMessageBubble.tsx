'use client';

import { FileText } from 'lucide-react';
import { parseEveUserDisplay } from '@/lib/workspace/eve-attachments';
import type { WorkspaceMessage } from '@/lib/workspace/types';
import { MarkdownProse } from '../atoms/MarkdownProse';
import { ThreadInlineCards, type InlineCardActions } from '../organisms/ThreadInlineCards';

export interface WorkspaceMessageBubbleProps {
  message: WorkspaceMessage;
  inlineActions: InlineCardActions;
  authorLabel?: string;
}

export function WorkspaceMessageBubble({
  message,
  inlineActions,
  authorLabel = 'TariffOS',
}: WorkspaceMessageBubbleProps) {
  const timestamp = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString('es-VE', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  if (message.role === 'user') {
    const { displayText, attachmentNames } = parseEveUserDisplay(message.text);
    const mergedAttachments = [
      ...(message.attachments?.map((a) => ({ id: a.id, name: a.name })) ?? []),
      ...attachmentNames
        .filter((name) => !message.attachments?.some((a) => a.name === name))
        .map((name) => ({ id: `parsed-${name}`, name })),
    ];

    return (
      <div className="mx-auto flex w-full max-w-2xl justify-end">
        <div className="max-w-[85%] space-y-2 rounded-[22px] rounded-br-md bg-surface-inverted px-4 py-3 text-ink-on-inverted shadow-sm dark:border dark:border-border-subtle">
          {message.authorName ? (
            <div className="text-[10px] font-semibold tracking-wide text-ink-on-inverted/75">{message.authorName}</div>
          ) : null}
          {displayText ? (
            <p className="whitespace-pre-wrap text-xs leading-relaxed sm:text-sm">{displayText}</p>
          ) : null}
          {mergedAttachments.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {mergedAttachments.map((att) => (
                <span
                  key={att.id}
                  className="inline-flex items-center gap-1 rounded-md bg-surface-panel/15 px-2 py-0.5 text-[11px]"
                >
                  <FileText className="h-3 w-3" aria-hidden="true" />
                  {att.name}
                </span>
              ))}
            </div>
          ) : null}
          {timestamp ? (
            <div className="text-right font-mono text-[10px] text-ink-on-inverted/65 tabular-nums">
              {timestamp}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl items-start gap-3">
      <div
        aria-hidden="true"
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-inverted text-xs font-semibold text-ink-on-inverted"
      >
        T
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="font-semibold text-ink-primary">{authorLabel}</span>
          {timestamp ? (
            <span className="font-mono text-[11px] text-ink-subtle tabular-nums">{timestamp}</span>
          ) : null}
        </div>
        {message.text ? <MarkdownProse text={message.text} /> : null}
        <ThreadInlineCards message={message} actions={inlineActions} />
      </div>
    </div>
  );
}
