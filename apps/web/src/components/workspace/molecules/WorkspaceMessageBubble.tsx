'use client';

import { FileText } from 'lucide-react';
import type { WorkspaceMessage } from '@/lib/workspace/types';
import { InlineMarkdownText } from '../atoms/InlineMarkdownText';
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
    return (
      <div className="max-w-2xl mx-auto w-full flex justify-end">
        <div className="max-w-[85%] bg-surface-inverted text-ink-on-inverted dark:border dark:border-border-subtle rounded-[22px] rounded-br-md px-4 py-3 shadow-sm space-y-2">
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          {message.attachments && message.attachments.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {message.attachments.map((att) => (
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
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full flex items-start gap-3">
      <div
        aria-hidden="true"
        className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5"
      >
        T
      </div>
      <div className="flex-1 min-w-0 space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="font-semibold text-ink-primary">{authorLabel}</span>
          {timestamp ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{timestamp}</span>
            </>
          ) : null}
        </div>
        {message.text ? (
          <div className="text-sm leading-relaxed text-ink-primary whitespace-pre-line">
            <InlineMarkdownText text={message.text} />
          </div>
        ) : null}
        <ThreadInlineCards message={message} actions={inlineActions} />
      </div>
    </div>
  );
}
