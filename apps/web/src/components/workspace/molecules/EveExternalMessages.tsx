'use client';

import { useAuiState } from '@assistant-ui/react';
import type { WorkspaceMessage } from '@/lib/workspace/types';
import type { InlineCardActions } from '../organisms/ThreadInlineCards';
import { WorkspaceMessageBubble } from './WorkspaceMessageBubble';

export interface EveExternalMessagesProps {
  messages: readonly WorkspaceMessage[];
  inlineActions: InlineCardActions;
}

/**
 * Renders persisted or externally ingested workspace messages (e.g., completed
 * Inngest batch uploads or loaded thread history) not mirrored inside Eve's runtime.
 */
export function EveExternalMessages({ messages, inlineActions }: EveExternalMessagesProps) {
  const liveMessages = useAuiState((s) => s.thread.messages);
  if (messages.length === 0) return null;

  const liveIds = new Set(liveMessages.map((m) => m.id));
  const externalOnly = messages.filter((m) => !liveIds.has(m.id));
  if (externalOnly.length === 0) return null;

  return (
    <div className="space-y-5">
      {externalOnly.map((msg) => (
        <WorkspaceMessageBubble key={msg.id} message={msg} inlineActions={inlineActions} />
      ))}
    </div>
  );
}
