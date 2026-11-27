'use client';

import { useMemo } from 'react';
import { MessagePrimitive, type ThreadMessage, useAuiState } from '@assistant-ui/react';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import type { ApprovalWorkflowMode } from '@tariffos/shared-types';
import { applyApprovalPolicyToEnvelope } from '@/lib/workspace/dossier-approval-policy';
import { parseEveUserDisplay } from '@/lib/workspace/eve-attachments';
import { extractMessagePlainText, toWorkspaceMessageFromEve } from '@/lib/workspace/eve-message-mapper';
import { MarkdownProse } from '../atoms/MarkdownProse';
import { ThreadInlineCards, type InlineCardActions } from '../organisms/ThreadInlineCards';
import { FollowUpChips } from './FollowUpChips';
import { ToolActivityList, type ToolActivityItem } from './ToolActivityList';

export interface EveMessageItemProps {
  message: ThreadMessage;
  jurisdictionId: string;
  approvalWorkflowMode: ApprovalWorkflowMode;
  inlineActions: InlineCardActions;
}

function readPreliminaryPhase(result: unknown): string | undefined {
  if (!result || typeof result !== 'object') return undefined;
  const phase = (result as { phase?: unknown }).phase;
  return typeof phase === 'string' && phase.trim() ? phase.trim() : undefined;
}

function formatTurnError(error: unknown): string {
  const raw =
    typeof error === 'string'
      ? error
      : error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message ?? '')
        : '';
  if (/insufficient credits/i.test(raw)) {
    return 'Créditos insuficientes en el proveedor LLM configurado. Cambia el proveedor o recarga créditos.';
  }
  return raw.trim() || 'El agente no pudo completar la respuesta.';
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

  const toolItems = useMemo<ToolActivityItem[]>(() => {
    const items: ToolActivityItem[] = [];
    for (let idx = 0; idx < message.content.length; idx += 1) {
      const part = message.content[idx];
      if (part.type !== 'tool-call') continue;
      const isPreliminary = Boolean('isPreliminary' in part && part.isPreliminary);
      const hasResult = 'result' in part && part.result !== undefined;
      items.push({
        toolCallId: part.toolCallId ?? `tc-${idx}`,
        toolName: part.toolName,
        args: part.args,
        completed: hasResult && !isPreliminary,
        isError: Boolean('isError' in part && part.isError),
        preliminaryPhase: isPreliminary ? readPreliminaryPhase(part.result) : undefined,
      });
    }
    return items;
  }, [message.content]);

  const mappedAssistant = useMemo(() => {
    if (message.role !== 'assistant') return null;
    const raw = toWorkspaceMessageFromEve({ id: message.id, role: 'assistant', createdAt: message.createdAt, content: message.content, jurisdictionId });
    return raw.envelope
      ? { ...raw, envelope: applyApprovalPolicyToEnvelope(raw.envelope, approvalWorkflowMode) }
      : raw;
  }, [approvalWorkflowMode, jurisdictionId, message.content, message.createdAt, message.id, message.role]);

  const isRunning = message.status?.type === 'running';
  const isLastSettledAssistant = useAuiState((s) => {
    if (message.role !== 'assistant' || s.thread.isRunning || isRunning) return false;
    const msgs = s.thread.messages;
    return msgs[msgs.length - 1]?.id === message.id;
  });

  if (message.role === 'user') {
    const { displayText, attachmentNames } = parseEveUserDisplay(text);
    const filePartNames = message.content
      .filter(
        (part): part is Extract<typeof part, { type: 'file' }> & { filename?: string } =>
          part.type === 'file',
      )
      .map((part) => part.filename?.trim())
      .filter((name): name is string => Boolean(name));
    const messageAttachments = (message.attachments ?? [])
      .map((att) => att.name?.trim())
      .filter((name): name is string => Boolean(name));
    const allAttachmentNames = Array.from(
      new Set([...attachmentNames, ...filePartNames, ...messageAttachments]),
    );

    return (
      <MessagePrimitive.Root className="mx-auto flex w-full max-w-2xl justify-end">
        <div className="max-w-[85%] space-y-2 rounded-[22px] rounded-br-md bg-surface-inverted px-4 py-3 text-ink-on-inverted shadow-sm dark:border dark:border-border-subtle">
          {displayText ? (
            <p className="whitespace-pre-wrap text-xs leading-relaxed sm:text-sm">{displayText}</p>
          ) : null}
          {allAttachmentNames.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {allAttachmentNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-0.5 text-[11px]"
                >
                  <FileText className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="max-w-[200px] truncate">{name}</span>
                </span>
              ))}
            </div>
          ) : null}
          {timestamp ? (
            <time dateTime={message.createdAt?.toISOString()} suppressHydrationWarning className="block text-right font-mono text-[10px] text-ink-on-inverted/65 tabular-nums">
              {timestamp}
            </time>
          ) : null}
        </div>
      </MessagePrimitive.Root>
    );
  }

  const visibleText = text || mappedAssistant?.text || '';
  const turnError =
    message.status?.type === 'incomplete' && message.status.reason === 'error'
      ? formatTurnError(message.status.error)
      : null;

  return (
    <MessagePrimitive.Root className="mx-auto flex w-full max-w-2xl items-start gap-3">
      <div
        aria-hidden="true"
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-inverted text-xs font-semibold text-ink-on-inverted"
      >
        T
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="font-semibold text-ink-primary">TariffOS</span>
          {timestamp ? (
            <time dateTime={message.createdAt?.toISOString()} suppressHydrationWarning className="font-mono text-[11px] text-ink-subtle tabular-nums">
              {timestamp}
            </time>
          ) : null}
        </div>

        <ToolActivityList items={toolItems} />

        {isRunning && !visibleText && toolItems.length === 0 ? (
          <div className="inline-flex items-center gap-2 text-xs text-ink-muted" aria-live="polite">
            <Loader2
              className="h-3.5 w-3.5 animate-spin text-accent-ink motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span>Analizando consulta…</span>
          </div>
        ) : null}

        {turnError && !visibleText ? (
          <div
            role="alert"
            className="inline-flex items-start gap-2 rounded-field border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-700 dark:text-rose-300"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{turnError}</span>
          </div>
        ) : null}

        {visibleText ? <MarkdownProse text={visibleText} /> : null}
        {mappedAssistant ? (
          <ThreadInlineCards message={mappedAssistant} actions={inlineActions} />
        ) : null}
        {isLastSettledAssistant && mappedAssistant && inlineActions.onSendFollowUp ? (
          <FollowUpChips
            message={{ ...mappedAssistant, text: visibleText }}
            onSendPrompt={inlineActions.onSendFollowUp}
            onOpenTab={(tab) => inlineActions.onOpenCanvasTab(mappedAssistant, tab)}
          />
        ) : null}
      </div>
    </MessagePrimitive.Root>
  );
}
