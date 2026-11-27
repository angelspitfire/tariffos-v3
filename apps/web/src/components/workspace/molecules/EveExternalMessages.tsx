'use client';

import { useAuiState } from '@assistant-ui/react';
import { Loader2 } from 'lucide-react';
import type { WorkspaceMessage } from '@/lib/workspace/types';
import type { InlineCardActions } from '../organisms/ThreadInlineCards';
import { WorkspaceMessageBubble } from './WorkspaceMessageBubble';

export interface EveExternalMessagesProps {
  messages: readonly WorkspaceMessage[];
  hasEveSession?: boolean;
  inlineActions: InlineCardActions;
}

function isExternalBatchMessage(message: WorkspaceMessage): boolean {
  return message.id.startsWith('msg-batch-') || message.id.startsWith('batch-');
}

/**
 * Renders persisted or externally ingested workspace messages (e.g., completed
 * Inngest batch uploads or legacy threads) while guaranteeing zero duplication
 * once a durable Eve session replays its authoritative live messages.
 */
export function EveExternalMessages({
  messages,
  hasEveSession = false,
  inlineActions,
}: EveExternalMessagesProps) {
  const liveMessages = useAuiState((s) => s.thread.messages);
  const isResuming = useAuiState((s) => s.thread.isLoading);

  if (messages.length === 0 && !isResuming) return null;

  const liveIds = new Set(liveMessages.map((m) => m.id));
  const externalOnly =
    hasEveSession && liveMessages.length > 0
      ? messages.filter((m) => isExternalBatchMessage(m) && !liveIds.has(m.id))
      : messages.filter((m) => !liveIds.has(m.id));

  if (externalOnly.length === 0 && !isResuming) return null;

  return (
    <div className="space-y-5">
      {isResuming && liveMessages.length === 0 ? (
        <div
          className="mx-auto flex w-full max-w-2xl items-center gap-2 text-xs text-ink-muted"
          aria-live="polite"
        >
          <Loader2
            className="h-3.5 w-3.5 animate-spin text-accent-ink motion-reduce:animate-none"
            aria-hidden="true"
          />
          <span>Reconectando sesión…</span>
        </div>
      ) : null}
      {externalOnly.map((msg) => (
        <WorkspaceMessageBubble key={msg.id} message={msg} inlineActions={inlineActions} />
      ))}
    </div>
  );
}
