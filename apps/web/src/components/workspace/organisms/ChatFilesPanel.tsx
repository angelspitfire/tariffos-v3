'use client';

import { useMemo, useState } from 'react';
import { FileSpreadsheet, FileText, FolderOpen, Image as ImageIcon, RefreshCw, Search, X } from 'lucide-react';
import type { WorkspaceAttachment, WorkspaceMessage } from '@/lib/workspace/types';
import { WorkspaceDialogShell } from '../atoms/WorkspaceDialogShell';

export interface ChatFilesPanelProps {
  open: boolean;
  messages: readonly WorkspaceMessage[];
  pendingAttachments: readonly WorkspaceAttachment[];
  onClose: () => void;
  onReclassifyFile?: (attachment: WorkspaceAttachment) => void;
}

type FileKindFilter = 'all' | 'pdf' | 'sheet' | 'image' | 'other';

function classifyMimeKind(att: WorkspaceAttachment): Exclude<FileKindFilter, 'all'> {
  const name = att.name.toLowerCase();
  if (att.mimeType.startsWith('image/') || /\.(png|jpe?g|webp)$/.test(name)) return 'image';
  if (att.mimeType.includes('spreadsheet') || att.mimeType.includes('csv') || /\.(xlsx?|csv)$/.test(name)) {
    return 'sheet';
  }
  if (att.mimeType === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  return 'other';
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ChatFilesPanel({
  open,
  messages,
  pendingAttachments,
  onClose,
  onReclassifyFile,
}: ChatFilesPanelProps) {
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<FileKindFilter>('all');
  const [previewId, setPreviewId] = useState<string | null>(null);

  const allFiles = useMemo(() => {
    const items: Array<{ attachment: WorkspaceAttachment; sourceLabel: string }> = [];
    for (const att of pendingAttachments) {
      items.push({ attachment: att, sourceLabel: 'Pendiente de envío' });
    }
    for (const msg of messages) {
      for (const att of msg.attachments ?? []) {
        items.push({ attachment: att, sourceLabel: 'Enviado en chat' });
      }
    }
    return items;
  }, [messages, pendingAttachments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allFiles.filter(({ attachment }) => {
      const kindMatch = kindFilter === 'all' || classifyMimeKind(attachment) === kindFilter;
      const queryMatch =
        !q ||
        attachment.name.toLowerCase().includes(q) ||
        (attachment.extractedText?.toLowerCase().includes(q) ?? false);
      return kindMatch && queryMatch;
    });
  }, [allFiles, kindFilter, query]);

  return (
    <WorkspaceDialogShell open={open} onClose={onClose} label="Archivos del chat" variant="drawer">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-accent-ink" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">Archivos del expediente ({allFiles.length})</h2>
            <p className="text-[11px] text-ink-muted">Documentos, hojas de cálculo y capturas adjuntas</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel de archivos"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-2.5 border-b border-border-hairline px-5 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="Buscar archivo o contenido extraído"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar archivo o contenido extraído…"
            className="w-full rounded-field border border-border-subtle bg-surface-input py-1.5 pr-3 pl-8 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          />
        </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'all', label: 'Todos' },
                { id: 'pdf', label: 'PDF' },
                { id: 'sheet', label: 'Excel / CSV' },
                { id: 'image', label: 'Imágenes' },
                { id: 'other', label: 'Otros' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setKindFilter(opt.id)}
                className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  kindFilter === opt.id
                    ? 'bg-surface-inverted text-ink-on-inverted'
                    : 'border border-border-subtle bg-surface-muted text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="rounded-card border border-dashed border-border-subtle p-6 text-center text-xs text-ink-muted">
              No hay archivos adjuntos que coincidan con el filtro.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {filtered.map(({ attachment, sourceLabel }) => {
                const kind = classifyMimeKind(attachment);
                const Icon = kind === 'sheet' ? FileSpreadsheet : kind === 'image' ? ImageIcon : FileText;
                const expanded = previewId === attachment.id;
                return (
                  <li key={attachment.id} className="space-y-2 rounded-card border border-border-subtle bg-surface-muted/70 p-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-ink-primary">{attachment.name}</div>
                          <div className="font-mono text-[10px] text-ink-muted">
                            {formatBytes(attachment.sizeBytes)} · {sourceLabel}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {attachment.extractedText ? (
                          <button
                            type="button"
                            onClick={() => setPreviewId(expanded ? null : attachment.id)}
                            className="cursor-pointer rounded-full border border-border-subtle bg-surface-panel px-2.5 py-1 text-[11px] font-medium text-ink-secondary hover:text-ink-primary"
                          >
                            {expanded ? 'Ocultar' : 'Texto'}
                          </button>
                        ) : null}
                        {onReclassifyFile ? (
                          <button
                            type="button"
                            onClick={() => {
                              onReclassifyFile(attachment);
                              onClose();
                            }}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent-ink hover:bg-blue-100 dark:hover:bg-blue-900/40"
                          >
                            <RefreshCw className="h-3 w-3" aria-hidden="true" />
                            Clasificar
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {expanded && attachment.extractedText ? (
                      <pre className="max-h-36 overflow-y-auto rounded-field border border-border-hairline bg-surface-panel p-2.5 font-mono text-[10px] whitespace-pre-wrap text-ink-secondary">
                        {attachment.extractedText}
                      </pre>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
    </WorkspaceDialogShell>
  );
}
