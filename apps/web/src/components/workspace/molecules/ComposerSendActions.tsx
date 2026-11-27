'use client';

import { AuiIf, ComposerPrimitive } from '@assistant-ui/react';
import { Mic, Send, Square } from 'lucide-react';

export interface ComposerSendActionsProps {
  dictating: boolean;
  isExtracting: boolean;
  sendWithAttachmentsOnly: boolean;
  onToggleDictation: () => void;
  onAttachmentOnlySend: () => void;
}

export function ComposerSendActions({
  dictating,
  isExtracting,
  sendWithAttachmentsOnly,
  onToggleDictation,
  onAttachmentOnlySend,
}: ComposerSendActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={onToggleDictation}
        aria-pressed={dictating}
        aria-label={dictating ? 'Detener dictado por voz' : 'Dictar consulta por voz'}
        className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none @[440px]:px-3 ${
          dictating
            ? 'border border-[var(--color-error-border)] bg-[var(--color-error-soft)] text-[var(--color-error)]'
            : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
        }`}
      >
        {dictating ? (
          <>
            <Square className="h-3.5 w-3.5 shrink-0 fill-current" aria-hidden="true" />
            <span>Detener</span>
          </>
        ) : (
          <>
            <Mic className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden @[440px]:inline">Dictar</span>
          </>
        )}
      </button>

      <AuiIf condition={(s) => !s.thread.isRunning}>
        {isExtracting ? (
          <button
            type="button"
            disabled
            aria-label="Procesando archivo adjunto"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-brand/60 px-4 py-1.5 text-xs font-semibold text-white whitespace-nowrap opacity-70"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Procesando archivo…</span>
          </button>
        ) : sendWithAttachmentsOnly ? (
          <button
            type="button"
            onClick={onAttachmentOnlySend}
            aria-label="Enviar"
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-accent-brand px-4 py-1.5 text-xs font-semibold text-white whitespace-nowrap transition-colors hover:bg-accent-brand-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Enviar</span>
          </button>
        ) : (
          <ComposerPrimitive.Send
            aria-label="Enviar"
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-accent-brand px-4 py-1.5 text-xs font-semibold text-white whitespace-nowrap transition-colors hover:bg-accent-brand-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Enviar</span>
          </ComposerPrimitive.Send>
        )}
      </AuiIf>

      <AuiIf condition={(s) => s.thread.isRunning}>
        <ComposerPrimitive.Cancel
          aria-label="Detener clasificación"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted px-3.5 py-1.5 text-xs font-semibold text-ink-primary transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        >
          <Square className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Detener</span>
        </ComposerPrimitive.Cancel>
      </AuiIf>
    </div>
  );
}
