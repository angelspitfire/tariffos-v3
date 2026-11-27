'use client';

import { useRef, useState, type ReactNode } from 'react';
import { AuiIf, ThreadPrimitive } from '@assistant-ui/react';
import { ArrowDown, FilePlus2 } from 'lucide-react';
import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import type { SampleBatchDocument, SampleMerchandise } from '@/lib/workspace/jurisdictions';
import type { WorkspaceAttachment } from '@/lib/workspace/types';
import { WorkspaceEmptyState } from '../molecules/WorkspaceEmptyState';
import { WorkspaceReadOnlyBar } from '../molecules/WorkspaceReadOnlyBar';
import { WorkspaceComposer } from './WorkspaceComposer';

const ACCEPTED_FILES = '.pdf,.xlsx,.xls,.csv,.txt,.png,.jpg,.jpeg,.webp';

export interface WorkspaceThreadShellProps {
  skuPrecedents: readonly SkuPrecedent[];
  pendingAttachments: readonly WorkspaceAttachment[];
  profile: UserProfileSettings;
  readOnlyReason?: string | null;
  hasExternalMessages?: boolean;
  batchBanner?: ReactNode;
  onTriggerBatchUpload?: () => void;
  onAddFiles: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
  onRunSample: (sample: SampleMerchandise) => void;
  onRunBatchSample: (batch: SampleBatchDocument) => void;
  onUpdateProfile: (patch: Partial<UserProfileSettings>) => void;
  children: ReactNode;
}

/** Shared thread viewport, drag-and-drop overlay, and clean docked composer footer. */
export function WorkspaceThreadShell({
  skuPrecedents,
  pendingAttachments,
  profile,
  readOnlyReason = null,
  hasExternalMessages = false,
  batchBanner = null,
  onTriggerBatchUpload,
  onAddFiles,
  onRemoveAttachment,
  onRunSample,
  onRunBatchSample,
  onUpdateProfile,
  children,
}: WorkspaceThreadShellProps) {
  const hiddenUploadRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  const openFilePicker = () => hiddenUploadRef.current?.click();
  const handleClassifyCardClick = () => {
    const textarea = document.querySelector<HTMLTextAreaElement>(
      'textarea[aria-label="Consulta arancelaria o descripción de mercancía"]',
    );
    textarea?.focus();
  };

  return (
    <>
      <input
        ref={hiddenUploadRef}
        type="file"
        multiple
        accept={ACCEPTED_FILES}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            onAddFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />
      <ThreadPrimitive.Root
        onDragOver={(e) => {
          if (Array.from(e.dataTransfer?.types || []).includes('Files')) {
            e.preventDefault();
            setIsDraggingFiles(true);
          }
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDraggingFiles(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingFiles(false);
          if (e.dataTransfer?.files?.length) onAddFiles(e.dataTransfer.files);
        }}
        className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-surface-app"
      >
        {isDraggingFiles ? (
          <div className="pointer-events-none absolute inset-3 z-30 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-accent-brand bg-accent-soft/90 p-6 text-center">
            <FilePlus2 className="mb-2 h-8 w-8 text-accent-ink" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink-primary">
              Suelta aquí tus documentos aduaneros
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              Facturas, Bill of Lading, Packing Lists, Fichas Técnicas (PDF, Excel, CSV o imágenes)
            </p>
          </div>
        ) : null}

        <ThreadPrimitive.Viewport className="flex min-w-0 flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-6">
          {!hasExternalMessages ? (
            <AuiIf condition={(s) => s.thread.isEmpty}>
              <WorkspaceEmptyState
                onFocusComposer={handleClassifyCardClick}
                onTriggerUpload={openFilePicker}
                onTriggerBatchUpload={onTriggerBatchUpload}
                onRunSample={onRunSample}
                onRunBatchSample={onRunBatchSample}
              />
            </AuiIf>
          ) : null}

          {children}
        </ThreadPrimitive.Viewport>

        <div className="relative shrink-0 bg-surface-app px-4 pt-2 pb-4 sm:px-6">
          <ThreadPrimitive.ScrollToBottom
            aria-label="Ir al último mensaje"
            className="absolute -top-9 left-1/2 z-20 inline-flex h-8 w-8 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-border-subtle bg-surface-panel text-ink-secondary shadow-md transition hover:bg-surface-hover hover:text-ink-primary disabled:pointer-events-none disabled:opacity-0"
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </ThreadPrimitive.ScrollToBottom>
          {batchBanner ? <div className="mx-auto mb-2 max-w-2xl">{batchBanner}</div> : null}
          {readOnlyReason ? (
            <WorkspaceReadOnlyBar reason={readOnlyReason} />
          ) : (
            <WorkspaceComposer
              skuPrecedents={skuPrecedents}
              pendingAttachments={pendingAttachments}
              profile={profile}
              onAddFiles={onAddFiles}
              onRemoveAttachment={onRemoveAttachment}
              onUpdateProfile={onUpdateProfile}
              onTriggerUpload={openFilePicker}
              onTriggerBatchUpload={onTriggerBatchUpload}
            />
          )}
        </div>
      </ThreadPrimitive.Root>
    </>
  );
}
