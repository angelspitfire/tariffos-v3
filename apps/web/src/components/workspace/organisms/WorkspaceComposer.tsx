'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AuiIf,
  ComposerPrimitive,
  useAui,
  useAuiState,
} from '@assistant-ui/react';
import {
  ChevronDown,
  FileText,
  Mic,
  Plus,
  Send,
  SlidersHorizontal,
  Square,
  X,
} from 'lucide-react';
import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import type { WorkspaceAttachment } from '@/lib/workspace/types';
import {
  ComposerDictationBar,
  createSpeechRecognition,
  type SpeechRecognitionLike,
} from '../molecules/ComposerDictationBar';
import { ComposerMenus, type ComposerMenuKind } from '../molecules/ComposerMenus';
import { PredictiveSkuList } from '../molecules/PredictiveSkuList';

export interface WorkspaceComposerProps {
  skuPrecedents: readonly SkuPrecedent[];
  pendingAttachments: readonly WorkspaceAttachment[];
  profile: UserProfileSettings;
  onAddFiles: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
  onUpdateProfile: (patch: Partial<UserProfileSettings>) => void;
  onNotifyUnavailableCamera?: () => void;
}

export function WorkspaceComposer({
  skuPrecedents,
  pendingAttachments,
  profile,
  onAddFiles,
  onRemoveAttachment,
  onUpdateProfile,
  onNotifyUnavailableCamera,
}: WorkspaceComposerProps) {
  const aui = useAui();
  const text = useAuiState((s) => s.composer.text);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [dictating, setDictating] = useState(false);
  const [speechLang, setSpeechLang] = useState<'es-ES' | 'en-US'>('es-ES');
  const [composerMenu, setComposerMenu] = useState<ComposerMenuKind>(null);
  const [predictiveDismissed, setPredictiveDismissed] = useState(false);

  useEffect(() => {
    if (!composerMenu) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setComposerMenu(null);
    };
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setComposerMenu(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, [composerMenu]);

  const suggestions = useMemo(() => {
    if (profile.predictiveSearchEnabled === false || predictiveDismissed) return [];
    const q = text.trim().toLowerCase();
    if (q.length < 2) return [];
    return skuPrecedents
      .filter(
        (item) =>
          item.sku.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.hsCode.includes(q),
      )
      .slice(0, 4);
  }, [predictiveDismissed, profile.predictiveSearchEnabled, skuPrecedents, text]);

  const handleToggleDictation = () => {
    if (dictating) {
      recognitionRef.current?.stop();
      setDictating(false);
      return;
    }
    const recognition = createSpeechRecognition();
    if (!recognition) return;
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      if (transcript) {
        aui.composer.setText(text.trim() ? `${text.trim()} ${transcript}` : transcript);
      }
    };
    recognition.onend = () => setDictating(false);
    recognition.onerror = () => setDictating(false);
    recognitionRef.current = recognition;
    setDictating(true);
    recognition.start();
  };

  return (
    <div ref={containerRef} className="@container relative max-w-2xl mx-auto w-full space-y-2">
      <ComposerMenus
        menu={composerMenu}
        profile={profile}
        onClose={() => setComposerMenu(null)}
        onTriggerUpload={() => fileInputRef.current?.click()}
        onUpdateProfile={onUpdateProfile}
        onNotifyUnavailableCamera={() => onNotifyUnavailableCamera?.()}
      />

      <PredictiveSkuList
        query={text}
        suggestions={suggestions}
        onSelect={(item) => {
          aui.composer.setText(`${item.sku}: ${item.title} (${item.hsCode})`);
          setPredictiveDismissed(true);
        }}
        onDismiss={() => setPredictiveDismissed(true)}
      />

      <ComposerPrimitive.Root
        className={`bg-surface-panel/95 backdrop-blur-xl border rounded-[24px] shadow-[0_14px_36px_-18px_rgba(15,23,42,0.18)] transition-colors overflow-hidden ${
          dictating
            ? 'border-red-500/60 ring-1 ring-red-500/30'
            : 'border-border-strong/75 focus-within:border-accent-brand focus-within:ring-2 focus-within:ring-accent-brand/25'
        }`}
      >
        {pendingAttachments.length > 0 && (
          <div className="px-3.5 pt-3 pb-1 flex flex-wrap gap-2">
            {pendingAttachments.map((att) => (
              <div
                key={att.id}
                className="inline-flex items-center gap-2 p-1.5 pl-2.5 bg-surface-muted border border-border-subtle rounded-lg"
              >
                <FileText className="w-3.5 h-3.5 text-accent-ink shrink-0" aria-hidden="true" />
                <span className="text-xs font-medium text-ink-primary truncate max-w-[160px]">{att.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(att.id)}
                  aria-label={`Quitar archivo ${att.name}`}
                  className="p-0.5 text-ink-subtle hover:text-ink-primary cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        <ComposerPrimitive.Input
          rows={2}
          aria-label="Consulta arancelaria o descripción de mercancía"
          onPaste={(e) => {
            if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
              e.preventDefault();
              onAddFiles(e.clipboardData.files);
            }
          }}
          placeholder={
            dictating
              ? 'Escuchando… dicta la descripción de la mercancía (material, uso, capacidad, marca)...'
              : 'Pregunta sobre una mercancía, dicta por voz o arrastra Facturas, B/L y Fichas aquí...'
          }
          className="w-full px-4 pt-3 pb-1.5 text-sm text-ink-primary placeholder:text-ink-subtle bg-transparent resize-none focus:outline-none max-h-40"
        />

        {dictating && (
          <ComposerDictationBar speechLang={speechLang} onChangeSpeechLang={setSpeechLang} />
        )}

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

        <div className="px-2.5 sm:px-3 py-2 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 min-w-0">
            <button
              type="button"
              onClick={() => setComposerMenu((prev) => (prev === 'attach' ? null : 'attach'))}
              aria-expanded={composerMenu === 'attach'}
              aria-label="Adjuntar archivo o abrir cámara"
              title="Adjuntar archivo o cámara"
              className={`w-8 h-8 inline-flex items-center justify-center rounded-full transition-colors shrink-0 cursor-pointer ${
                composerMenu === 'attach'
                  ? 'bg-accent-soft text-accent-ink'
                  : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
              }`}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setComposerMenu((prev) => (prev === 'tools' ? null : 'tools'))}
              aria-expanded={composerMenu === 'tools'}
              aria-label="Herramientas"
              title="Herramientas del chat"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                composerMenu === 'tools'
                  ? 'bg-accent-soft text-accent-ink'
                  : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden @[440px]:inline">Herramientas</span>
              {(profile.defaultIncoterm !== 'CIF' || profile.detailLevel !== 'standard') && (
                <span className="hidden @[440px]:inline font-mono text-[10px] text-accent-ink">
                  · {profile.defaultIncoterm}
                </span>
              )}
              <ChevronDown className="w-3 h-3 opacity-60" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleToggleDictation}
              aria-pressed={dictating}
              aria-label={dictating ? 'Detener dictado por voz' : 'Dictar consulta por voz'}
              className={`inline-flex items-center gap-1.5 px-2.5 @[440px]:px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                dictating
                  ? 'bg-red-600/10 text-red-700 dark:text-red-400 border border-red-500/35'
                  : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
              }`}
            >
              {dictating ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true" />
                  <span>Detener</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="hidden @[440px]:inline">Dictar</span>
                </>
              )}
            </button>

            <AuiIf condition={(s) => !s.thread.isRunning}>
              <ComposerPrimitive.Send
                aria-label="Enviar"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-accent-brand hover:bg-accent-brand-hover disabled:opacity-40 rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Enviar</span>
              </ComposerPrimitive.Send>
            </AuiIf>

            <AuiIf condition={(s) => s.thread.isRunning}>
              <ComposerPrimitive.Cancel
                aria-label="Detener clasificación"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border border-border-subtle bg-surface-muted text-ink-primary hover:bg-surface-hover cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Detener</span>
              </ComposerPrimitive.Cancel>
            </AuiIf>
          </div>
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
}
