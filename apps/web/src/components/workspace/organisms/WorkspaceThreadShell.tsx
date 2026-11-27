'use client';

import { useRef, useState, type ReactNode } from 'react';
import { AuiIf, ThreadPrimitive } from '@assistant-ui/react';
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

/** Shared thread viewport, single file upload input, drag-and-drop zone, and composer footer. */
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
          e.preventDefault();
          setIsDraggingFiles(true);
        }}
        onDragLeave={() => setIsDraggingFiles(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingFiles(false);
          if (e.dataTransfer?.files?.length) onAddFiles(e.dataTransfer.files);
        }}
        className={`flex h-full min-w-0 flex-col overflow-x-hidden bg-transparent transition-colors ${
          isDraggingFiles ? 'ring-2 ring-inset ring-accent-brand/60 bg-accent-soft/20' : ''
        }`}
      >
        <ThreadPrimitive.Viewport className="flex flex-1 min-w-0 flex-col gap-5 overflow-y-auto overflow-x-hidden px-3 sm:px-6 pt-5 pb-2">
          {!hasExternalMessages ? (
            <AuiIf condition={(s) => s.thread.isEmpty}>
              <WorkspaceEmptyState
                onFocusComposer={() => {
                  document
                    .querySelector<HTMLTextAreaElement>(
                      'textarea[aria-label="Consulta arancelaria o descripción de mercancía"]',
                    )
                    ?.focus();
                }}
                onTriggerUpload={openFilePicker}
                onTriggerBatchUpload={onTriggerBatchUpload}
                onRunSample={onRunSample}
                onRunBatchSample={onRunBatchSample}
              />
            </AuiIf>
          ) : null}

          {children}

          <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mt-auto space-y-2 bg-gradient-to-t from-surface-app via-surface-app/90 to-transparent pt-3 pb-3">
            {batchBanner}
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
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>
    </>
  );
}
