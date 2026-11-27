'use client';

import { FileText, Loader2, X } from 'lucide-react';
import type { WorkspaceAttachment } from '@/lib/workspace/types';

export function ComposerAttachmentStrip({
  attachments,
  onRemove,
}: {
  attachments: readonly WorkspaceAttachment[];
  onRemove: (id: string) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="px-3.5 pt-3 pb-1 flex flex-wrap gap-2">
      {attachments.map((att) => {
        const isExtracting = att.status === 'extracting';
        return (
          <div
            key={att.id}
            className={`inline-flex items-center gap-2 rounded-lg border p-1.5 pl-2.5 ${
              isExtracting
                ? 'border-accent-border bg-accent-soft/50 text-accent-ink'
                : 'border-border-subtle bg-surface-muted text-ink-primary'
            }`}
          >
            {isExtracting ? (
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <FileText className="h-3.5 w-3.5 shrink-0 text-accent-ink" aria-hidden="true" />
            )}
            <span className="max-w-[160px] truncate text-xs font-medium">{att.name}</span>
            {isExtracting ? (
              <span className="text-[10px] font-medium text-accent-ink">Extrayendo…</span>
            ) : null}
            <button
              type="button"
              onClick={() => onRemove(att.id)}
              aria-label={`Quitar archivo ${att.name}`}
              className="cursor-pointer p-0.5 text-ink-subtle hover:text-ink-primary"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
