'use client';

import { FileText, X } from 'lucide-react';
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
      {attachments.map((att) => (
        <div
          key={att.id}
          className="inline-flex items-center gap-2 p-1.5 pl-2.5 bg-surface-muted border border-border-subtle rounded-lg"
        >
          <FileText className="w-3.5 h-3.5 text-accent-ink shrink-0" aria-hidden="true" />
          <span className="text-xs font-medium text-ink-primary truncate max-w-[160px]">{att.name}</span>
          <button
            type="button"
            onClick={() => onRemove(att.id)}
            aria-label={`Quitar archivo ${att.name}`}
            className="p-0.5 text-ink-subtle hover:text-ink-primary cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
