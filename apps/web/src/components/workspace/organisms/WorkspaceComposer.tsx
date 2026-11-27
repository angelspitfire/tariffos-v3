'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ComposerPrimitive, useAui, useAuiState } from '@assistant-ui/react';
import { ChevronDown, Plus, SlidersHorizontal, X } from 'lucide-react';
import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import type { WorkspaceAttachment } from '@/lib/workspace/types';
import { useComposerDictation } from '@/lib/workspace/use-composer-dictation';
import { ComposerAttachmentStrip } from '../molecules/ComposerAttachmentStrip';
import { ComposerDictationBar } from '../molecules/ComposerDictationBar';
import { ComposerMenus, type ComposerMenuKind } from '../molecules/ComposerMenus';
import { ComposerSendActions } from '../molecules/ComposerSendActions';
import { PredictiveSkuList } from '../molecules/PredictiveSkuList';
import { CameraScannerModal } from './CameraScannerModal';

const ATTACHMENT_DEFAULT_PROMPT = 'Analiza el documento adjunto y resume sus características clave.';
const SKU_LISTBOX_ID = 'workspace-predictive-sku-list';
const FOCUS_RING = 'focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none';

export interface WorkspaceComposerProps {
  skuPrecedents: readonly SkuPrecedent[];
  pendingAttachments: readonly WorkspaceAttachment[];
  profile: UserProfileSettings;
  onAddFiles: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
  onUpdateProfile: (patch: Partial<UserProfileSettings>) => void;
  onTriggerUpload: () => void;
  onTriggerBatchUpload?: () => void;
  onNotifyWarning?: (message: string) => void;
}

export function WorkspaceComposer({
  skuPrecedents, pendingAttachments, profile, onAddFiles, onRemoveAttachment,
  onUpdateProfile, onTriggerUpload, onTriggerBatchUpload, onNotifyWarning,
}: WorkspaceComposerProps) {
  const aui = useAui();
  const text = useAuiState((s) => s.composer.text);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [composerMenu, setComposerMenu] = useState<ComposerMenuKind>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [dismissedForText, setDismissedForText] = useState<string | null>(null);
  const [activeSelection, setActiveSelection] = useState({ query: '', index: -1 });

  const { dictating, speechLang, setSpeechLang, toggleDictation, fallbackWarning, clearFallbackWarning } =
    useComposerDictation({
      text,
      onSetText: (nextText) => aui.composer.setText(nextText),
      onUnsupportedBrowser: onNotifyWarning,
    });

  const isExtracting = pendingAttachments.some((a) => a.status === 'extracting');
  const sendWithAttachmentsOnly = !text.trim() && pendingAttachments.some((a) => a.status !== 'extracting') && !isExtracting;

  useEffect(() => {
    if (!composerMenu) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setComposerMenu(null); };
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setComposerMenu(null);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onPointerDown);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('mousedown', onPointerDown); };
  }, [composerMenu]);

  const suggestions = useMemo(() => {
    if (profile.predictiveSearchEnabled === false || dismissedForText === text) return [];
    const q = text.trim().toLowerCase();
    if (q.length < 2) return [];
    return skuPrecedents
      .filter((item) => item.sku.toLowerCase().includes(q) || item.title.toLowerCase().includes(q) || item.hsCode.includes(q))
      .slice(0, 4);
  }, [dismissedForText, profile.predictiveSearchEnabled, skuPrecedents, text]);

  const activeIndex = activeSelection.query === text && suggestions.length > 0
    ? Math.min(activeSelection.index, suggestions.length - 1) : -1;

  const selectSuggestion = (item: SkuPrecedent) => {
    const formatted = `${item.sku}: ${item.title} (${item.hsCode})`;
    aui.composer.setText(formatted);
    setDismissedForText(formatted);
    setActiveSelection({ query: formatted, index: -1 });
    containerRef.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus();
  };

  const handleAttachmentOnlySend = () => {
    if (!sendWithAttachmentsOnly) return;
    aui.thread.append({ role: 'user', content: [{ type: 'text', text: ATTACHMENT_DEFAULT_PROMPT }] });
  };

  const handleInputKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const delta = e.key === 'ArrowDown' ? 1 : -1;
        const next = activeIndex < 0 ? (delta > 0 ? 0 : suggestions.length - 1) : (activeIndex + delta + suggestions.length) % suggestions.length;
        setActiveSelection({ query: text, index: next });
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setDismissedForText(text);
        setActiveSelection({ query: text, index: -1 });
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey && activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey && sendWithAttachmentsOnly) {
      e.preventDefault();
      handleAttachmentOnlySend();
    }
  };

  return (
    <div ref={containerRef} className="@container relative mx-auto w-full max-w-2xl space-y-2">
      <ComposerMenus
        menu={composerMenu} profile={profile} onClose={() => setComposerMenu(null)}
        onTriggerUpload={onTriggerUpload} onTriggerBatchUpload={onTriggerBatchUpload}
        onUpdateProfile={onUpdateProfile} onOpenCamera={() => setCameraOpen(true)}
      />
      <CameraScannerModal
        open={cameraOpen} onClose={() => setCameraOpen(false)}
        onCaptureFile={(file) => { const dt = new DataTransfer(); dt.items.add(file); onAddFiles(dt.files); }}
      />
      <PredictiveSkuList
        query={text} suggestions={suggestions} activeIndex={activeIndex} listboxId={SKU_LISTBOX_ID}
        onSelect={selectSuggestion}
        onDismiss={() => { setDismissedForText(text); setActiveSelection({ query: text, index: -1 }); }}
      />
      {!onNotifyWarning && fallbackWarning ? (
        <div role="status" aria-live="polite" className="flex items-center justify-between gap-2 rounded-field border border-amber-500/35 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-800 dark:text-amber-200">
          <span>{fallbackWarning}</span>
          <button type="button" onClick={clearFallbackWarning} aria-label="Cerrar aviso de dictado" className={`cursor-pointer rounded p-0.5 transition-colors hover:bg-amber-500/15 ${FOCUS_RING}`}>
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <ComposerPrimitive.Root
        className={`overflow-hidden rounded-[24px] border bg-surface-panel shadow-card transition-colors ${
          dictating ? 'border-[var(--color-error)] ring-1 ring-[var(--color-error-border)]' : 'border-border-strong/75 focus-within:border-accent-brand focus-within:ring-2 focus-within:ring-accent-brand/25'
        }`}
      >
        <ComposerAttachmentStrip attachments={pendingAttachments} onRemove={onRemoveAttachment} />
        <ComposerPrimitive.Input
          rows={2}
          name="workspacePrompt"
          aria-label="Consulta arancelaria o descripción de mercancía"
          aria-controls={suggestions.length > 0 ? SKU_LISTBOX_ID : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${SKU_LISTBOX_ID}-option-${activeIndex}` : undefined}
          onKeyDown={handleInputKeyDown}
          onPaste={(e) => { if (e.clipboardData?.files?.length) { e.preventDefault(); onAddFiles(e.clipboardData.files); } }}
          placeholder={dictating ? 'Escuchando… dicta la descripción de la mercancía (material, uso, capacidad, marca)…' : 'Pregunta sobre una mercancía, dicta por voz o arrastra Facturas, B/L y Fichas aquí…'}
          className="max-h-40 w-full resize-none bg-transparent px-4 pt-3 pb-1.5 text-sm text-ink-primary placeholder:text-ink-subtle focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-brand/30 focus-visible:outline-none"
        />
        {dictating ? <ComposerDictationBar speechLang={speechLang} onChangeSpeechLang={setSpeechLang} /> : null}
        <div className="flex items-center justify-between gap-1.5 px-2.5 py-2 sm:px-3">
          <div className="flex min-w-0 items-center gap-1">
            <button
              type="button" onClick={() => setComposerMenu((p) => (p === 'attach' ? null : 'attach'))}
              aria-expanded={composerMenu === 'attach'} aria-label="Adjuntar archivo o abrir cámara" title="Adjuntar archivo o cámara"
              className={`inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${FOCUS_RING} ${composerMenu === 'attach' ? 'bg-accent-soft text-accent-ink' : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'}`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button" onClick={() => setComposerMenu((p) => (p === 'tools' ? null : 'tools'))}
              aria-expanded={composerMenu === 'tools'} aria-label="Herramientas" title="Herramientas del chat"
              className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${FOCUS_RING} ${composerMenu === 'tools' ? 'bg-accent-soft text-accent-ink' : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'}`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden @[440px]:inline">Herramientas</span>
              {(profile.defaultIncoterm !== 'CIF' || profile.detailLevel !== 'standard') && (
                <span className="hidden rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] text-accent-ink @[440px]:inline">{profile.defaultIncoterm}</span>
              )}
              <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
            </button>
          </div>
          <ComposerSendActions
            dictating={dictating} isExtracting={isExtracting} sendWithAttachmentsOnly={sendWithAttachmentsOnly}
            onToggleDictation={toggleDictation} onAttachmentOnlySend={handleAttachmentOnlySend}
          />
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
}
