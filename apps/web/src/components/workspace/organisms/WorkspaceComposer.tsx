'use client';

import { useMemo, useRef, useState } from 'react';
import {
  AuiIf,
  ComposerPrimitive,
  useAui,
  useAuiState,
} from '@assistant-ui/react';
import { ArrowUp, Mic, MicOff, Paperclip, Square, X } from 'lucide-react';
import type { SkuPrecedent } from '@tariffos/shared-types';
import type { WorkspaceAttachment } from '@/lib/workspace/types';

interface WorkspaceComposerProps {
  skuPrecedents: readonly SkuPrecedent[];
  pendingAttachments: readonly WorkspaceAttachment[];
  onAddFiles: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

function createSpeechRecognition(): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function WorkspaceComposer({
  skuPrecedents,
  pendingAttachments,
  onAddFiles,
  onRemoveAttachment,
}: WorkspaceComposerProps) {
  const aui = useAui();
  const text = useAuiState((s) => s.composer.text);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [dictating, setDictating] = useState(false);

  const suggestions = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (q.length < 2) return [];
    return skuPrecedents
      .filter(
        (item) =>
          item.sku.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.hsCode.includes(q)
      )
      .slice(0, 3);
  }, [skuPrecedents, text]);

  const handleToggleDictation = () => {
    if (dictating) {
      recognitionRef.current?.stop();
      setDictating(false);
      return;
    }
    const recognition = createSpeechRecognition();
    if (!recognition) return;
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      if (transcript) {
        const nextText = text.trim() ? `${text.trim()} ${transcript}` : transcript;
        aui.composer.setText(nextText);
      }
    };
    recognition.onend = () => setDictating(false);
    recognition.onerror = () => setDictating(false);
    recognitionRef.current = recognition;
    setDictating(true);
    recognition.start();
  };

  return (
    <div className="space-y-2">
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => aui.composer.setText(`${item.sku}: ${item.title} (${item.hsCode})`)}
              className="rounded-full border border-accent-border bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent-ink transition hover:bg-accent-brand hover:text-white"
            >
              SKU {item.sku} · {item.hsCode}
            </button>
          ))}
        </div>
      )}

      {pendingAttachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {pendingAttachments.map((att) => (
            <span
              key={att.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-2 py-1 text-[11px] text-ink-primary"
            >
              <span className="max-w-44 truncate">{att.name}</span>
              <button
                type="button"
                onClick={() => onRemoveAttachment(att.id)}
                aria-label={`Quitar archivo ${att.name}`}
                className="text-ink-muted hover:text-ink-primary"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      <ComposerPrimitive.Root className="flex items-end gap-1.5 rounded-2xl border border-border-strong bg-surface-panel/90 backdrop-blur-xl p-2 shadow-sm focus-within:border-accent-brand">
        <input
          ref={fileInputRef}
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

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Adjuntar factura, packing list o imagen"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-ink-muted transition hover:bg-surface-hover hover:text-ink-primary"
        >
          <Paperclip className="h-4 w-4" aria-hidden="true" />
        </button>

        <ComposerPrimitive.Input
          rows={1}
          placeholder="Describe la mercancía o adjunta una factura / B/L para clasificar..."
          className="max-h-36 min-h-8 flex-1 resize-none bg-transparent px-1 py-1.5 text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none"
        />

        <button
          type="button"
          onClick={handleToggleDictation}
          aria-label={dictating ? 'Detener dictado por voz' : 'Dictar por voz'}
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
            dictating
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              : 'text-ink-muted hover:bg-surface-hover hover:text-ink-primary'
          }`}
        >
          {dictating ? <MicOff className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
        </button>

        <AuiIf condition={(s) => !s.thread.isRunning}>
          <ComposerPrimitive.Send
            aria-label="Clasificar mercancía"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-brand text-white transition hover:bg-accent-brand-hover disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </ComposerPrimitive.Send>
        </AuiIf>

        <AuiIf condition={(s) => s.thread.isRunning}>
          <ComposerPrimitive.Cancel
            aria-label="Detener clasificación"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-muted text-ink-primary hover:bg-surface-hover"
          >
            <Square className="h-3.5 w-3.5" aria-hidden="true" />
          </ComposerPrimitive.Cancel>
        </AuiIf>
      </ComposerPrimitive.Root>
    </div>
  );
}
