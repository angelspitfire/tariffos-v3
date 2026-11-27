'use client';

import { useMemo } from 'react';
import { MessagePrimitive, type ThreadMessage } from '@assistant-ui/react';
import type { ApprovalWorkflowMode } from '@tariffos/shared-types';
import { applyApprovalPolicyToEnvelope } from '@/lib/workspace/dossier-approval-policy';
import {
  extractMessagePlainText,
  toWorkspaceMessageFromEve,
} from '@/lib/workspace/eve-message-mapper';
import { InlineMarkdownText } from '../atoms/InlineMarkdownText';
import { EveToolStatusPill } from './EveToolStatusPill';
import { ThreadInlineCards, type InlineCardActions } from '../organisms/ThreadInlineCards';

export interface EveMessageItemProps {
  message: ThreadMessage;
  jurisdictionId: string;
  approvalWorkflowMode: ApprovalWorkflowMode;
  inlineActions: InlineCardActions;
}

export function EveMessageItem({
  message,
  jurisdictionId,
  approvalWorkflowMode,
  inlineActions,
}: EveMessageItemProps) {
  const timestamp = message.createdAt
    ? message.createdAt.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
    : '';
  const text = extractMessagePlainText(message.content);

  const mappedAssistant = useMemo(() => {
    if (message.role !== 'assistant') return null;
    const raw = toWorkspaceMessageFromEve({
      id: message.id,
      role: 'assistant',
      createdAt: message.createdAt,
      content: message.content,
      jurisdictionId,
    });
    if (!raw.envelope) return raw;
    return {
      ...raw,
      envelope: applyApprovalPolicyToEnvelope(raw.envelope, approvalWorkflowMode),
    };
  }, [approvalWorkflowMode, jurisdictionId, message.content, message.createdAt, message.id, message.role]);

  if (message.role === 'user') {
    return (
      <MessagePrimitive.Root className="max-w-2xl mx-auto w-full flex justify-end">
        <div className="max-w-[85%] bg-surface-inverted text-ink-on-inverted dark:border dark:border-border-subtle rounded-[22px] rounded-br-md px-4 py-3 shadow-sm space-y-2">
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
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
          <span className="font-semibold text-ink-primary">TariffOS · Eve</span>
          {timestamp ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{timestamp}</span>
            </>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {message.content.map((part, idx) =>
            part.type === 'tool-call' ? (
              <EveToolStatusPill
                key={`${part.toolCallId}-${idx}`}
                toolName={part.toolName}
                completed={'result' in part && part.result !== undefined}
                isError={Boolean('isError' in part && part.isError)}
              />
            ) : null,
          )}
        </div>
        {text ? (
          <div className="text-sm leading-relaxed text-ink-primary whitespace-pre-line">
            <InlineMarkdownText text={text} />
          </div>
        ) : null}
        {mappedAssistant ? <ThreadInlineCards message={mappedAssistant} actions={inlineActions} /> : null}
      </div>
    </MessagePrimitive.Root>
  );
}
