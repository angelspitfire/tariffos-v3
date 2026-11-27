'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ComposerPrimitive, useAui, useAuiState } from '@assistant-ui/react';
import { ChevronDown, Plus, SlidersHorizontal } from 'lucide-react';
import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import type { WorkspaceAttachment } from '@/lib/workspace/types';
import { ComposerAttachmentStrip } from '../molecules/ComposerAttachmentStrip';
import {
  ComposerDictationBar,
  createSpeechRecognition,
  type SpeechRecognitionLike,
} from '../molecules/ComposerDictationBar';
import { ComposerMenus, type ComposerMenuKind } from '../molecules/ComposerMenus';
import { ComposerSendActions } from '../molecules/ComposerSendActions';
import { PredictiveSkuList } from '../molecules/PredictiveSkuList';
import { CameraScannerModal } from './CameraScannerModal';

const ATTACHMENT_DEFAULT_PROMPT = 'Analiza el documento adjunto y resume sus características clave.';

export interface WorkspaceComposerProps {
  skuPrecedents: readonly SkuPrecedent[];
  pendingAttachments: readonly WorkspaceAttachment[];
  profile: UserProfileSettings;
  onAddFiles: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
  onUpdateProfile: (patch: Partial<UserProfileSettings>) => void;
  onTriggerUpload: () => void;
  onTriggerBatchUpload?: () => void;
}

export function WorkspaceComposer({
  skuPrecedents,
  pendingAttachments,
  profile,
  onAddFiles,
  onRemoveAttachment,
  onUpdateProfile,
  onTriggerUpload,
  onTriggerBatchUpload,
}: WorkspaceComposerProps) {
  const aui = useAui();
  const text = useAuiState((s) => s.composer.text);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [dictating, setDictating] = useState(false);
  const [speechLang, setSpeechLang] = useState<'es-ES' | 'en-US'>('es-ES');
  const [composerMenu, setComposerMenu] = useState<ComposerMenuKind>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [dismissedForText, setDismissedForText] = useState<string | null>(null);
  const isExtracting = pendingAttachments.some((a) => a.status === 'extracting');
  const hasReadyAttachments = pendingAttachments.some((a) => a.status !== 'extracting');
  const sendWithAttachmentsOnly = !text.trim() && hasReadyAttachments && !isExtracting;

  const handleAttachmentOnlySend = () => {
    if (!sendWithAttachmentsOnly) return;
    aui.thread.append({
      role: 'user',
      content: [{ type: 'text', text: ATTACHMENT_DEFAULT_PROMPT }],
    });
  };

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
    if (profile.predictiveSearchEnabled === false || dismissedForText === text) return [];
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
  }, [dismissedForText, profile.predictiveSearchEnabled, skuPrecedents, text]);

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
        onTriggerUpload={onTriggerUpload}
        onTriggerBatchUpload={onTriggerBatchUpload}
        onUpdateProfile={onUpdateProfile}
        onOpenCamera={() => setCameraOpen(true)}
      />

      <CameraScannerModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCaptureFile={(file) => {
          const dt = new DataTransfer();
          dt.items.add(file);
          onAddFiles(dt.files);
        }}
      />

      <PredictiveSkuList
        query={text}
        suggestions={suggestions}
        onSelect={(item) => {
          const formatted = `${item.sku}: ${item.title} (${item.hsCode})`;
          aui.composer.setText(formatted);
          setDismissedForText(formatted);
          containerRef.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus();
        }}
        onDismiss={() => setDismissedForText(text)}
      />

      <ComposerPrimitive.Root
        className={`bg-surface-panel border rounded-[24px] shadow-card transition-colors overflow-hidden ${
          dictating
            ? 'border-[var(--color-error)] ring-1 ring-[var(--color-error-border)]'
            : 'border-border-strong/75 focus-within:border-accent-brand focus-within:ring-2 focus-within:ring-accent-brand/25'
        }`}
      >
        <ComposerAttachmentStrip attachments={pendingAttachments} onRemove={onRemoveAttachment} />

        <ComposerPrimitive.Input
          rows={2}
          aria-label="Consulta arancelaria o descripción de mercancía"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && sendWithAttachmentsOnly) {
              e.preventDefault();
              handleAttachmentOnlySend();
            }
          }}
          onPaste={(e) => {
            if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
              e.preventDefault();
              onAddFiles(e.clipboardData.files);
            }
          }}
          placeholder={
            dictating
              ? 'Escuchando… dicta la descripción de la mercancía (material, uso, capacidad, marca)…'
              : 'Pregunta sobre una mercancía, dicta por voz o arrastra Facturas, B/L y Fichas aquí…'
          }
          className="max-h-40 w-full resize-none bg-transparent px-4 pt-3 pb-1.5 text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none"
        />

        {dictating ? (
          <ComposerDictationBar speechLang={speechLang} onChangeSpeechLang={setSpeechLang} />
        ) : null}

        <div className="flex items-center justify-between gap-1.5 px-2.5 py-2 sm:px-3">
          <div className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setComposerMenu((prev) => (prev === 'attach' ? null : 'attach'))}
              aria-expanded={composerMenu === 'attach'}
              aria-label="Adjuntar archivo o abrir cámara"
              title="Adjuntar archivo o cámara"
              className={`inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${
                composerMenu === 'attach'
                  ? 'bg-accent-soft text-accent-ink'
                  : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
              }`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setComposerMenu((prev) => (prev === 'tools' ? null : 'tools'))}
              aria-expanded={composerMenu === 'tools'}
              aria-label="Herramientas"
              title="Herramientas del chat"
              className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${
                composerMenu === 'tools'
                  ? 'bg-accent-soft text-accent-ink'
                  : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden @[440px]:inline">Herramientas</span>
              {(profile.defaultIncoterm !== 'CIF' || profile.detailLevel !== 'standard') && (
                <span className="hidden rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] text-accent-ink @[440px]:inline">
                  {profile.defaultIncoterm}
                </span>
              )}
              <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
            </button>
          </div>

          <ComposerSendActions
            dictating={dictating}
            isExtracting={isExtracting}
            sendWithAttachmentsOnly={sendWithAttachmentsOnly}
            onToggleDictation={handleToggleDictation}
            onAttachmentOnlySend={handleAttachmentOnlySend}
          />
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
}
