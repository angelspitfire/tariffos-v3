'use client';

import { Archive, ArrowUpRight, Tag, UserCheck } from 'lucide-react';
import type { OperationalStatus, ProcessKind } from '@tariffos/shared-types';
import { deriveThreadProcessSnapshot, formatRelativeThreadTime } from '@/lib/workspace/thread-process-meta';
import type { WorkspaceThread } from '@/lib/workspace/types';
import { CopyHsButton } from '../atoms/CopyHsButton';

export interface ProcessRowCardProps {
  thread: WorkspaceThread;
  compact?: boolean;
  assigneeName?: string | null;
  onOpen: (threadId: string) => void;
  onArchive: (threadId: string) => void;
}

const KIND_LABELS: Record<ProcessKind, string> = {
  quick_lookup: 'Consulta',
  single_ruling: 'Dictamen',
  invoice_batch: 'Lote',
  oga_escalation: 'OGA / Revisión',
  cif_simulation: 'Cálculo CIF',
};

const STATUS_DOT: Record<OperationalStatus, { label: string; cls: string }> = {
  needs_input: { label: 'Requiere dato', cls: 'bg-rose-500' },
  processing: { label: 'En curso', cls: 'bg-sky-500' },
  in_review: { label: 'Por aprobar', cls: 'bg-amber-500' },
  approved: { label: 'Sellado', cls: 'bg-emerald-500' },
  archived: { label: 'Archivado', cls: 'bg-ink-subtle' },
};

export function ProcessRowCard({ thread, compact = false, assigneeName, onOpen, onArchive }: ProcessRowCardProps) {
  const snap = deriveThreadProcessSnapshot(thread);
  const dot = STATUS_DOT[snap.operationalStatus];
  const kindLabel =
    snap.processKind === 'invoice_batch' && snap.itemProgress
      ? `Lote ${snap.itemProgress.completed}/${snap.itemProgress.total}`
      : KIND_LABELS[snap.processKind];
  const hsCopyable = snap.primaryHsCode && /^\d{4}\./.test(snap.primaryHsCode) ? snap.primaryHsCode : null;

  return (
    <article className={`rounded-card border border-border-subtle bg-surface-panel transition-colors hover:border-border-strong ${compact ? 'p-3' : 'flex flex-wrap items-center justify-between gap-3 px-4 py-3'}`}>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 font-medium text-ink-secondary">
            <span className={`h-2 w-2 rounded-full ${dot.cls}`} aria-hidden="true" />
            {dot.label}
          </span>
          <span className="rounded-md bg-surface-subtle px-1.5 py-0.5 font-medium text-ink-muted">{kindLabel}</span>
          {hsCopyable ? (
            <span className="inline-flex items-center gap-1 font-mono font-semibold text-accent-ink tabular-nums" translate="no">
              {hsCopyable}
              <CopyHsButton hsCode={hsCopyable} />
            </span>
          ) : snap.primaryHsCode ? (
            <span className="font-mono font-semibold text-accent-ink tabular-nums">{snap.primaryHsCode}</span>
          ) : null}
          {thread.clientRef ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-ink-secondary">
              <Tag className="h-2.5 w-2.5" aria-hidden="true" />
              {thread.clientRef}
            </span>
          ) : null}
          {assigneeName ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent-ink">
              <UserCheck className="h-2.5 w-2.5" aria-hidden="true" />
              {assigneeName}
            </span>
          ) : null}
        </div>
        <h3 className="truncate text-xs font-semibold text-ink-primary">{thread.title}</h3>
      </div>

      <div className={`flex items-center gap-1.5 ${compact ? 'mt-2.5 justify-between border-t border-border-hairline pt-2' : 'shrink-0'}`}>
        <span className="font-mono text-[11px] text-ink-subtle tabular-nums">{formatRelativeThreadTime(thread.updatedAt)}</span>
        <div className="flex items-center gap-1">
          {snap.operationalStatus !== 'archived' ? (
            <button type="button" onClick={() => onArchive(thread.id)} aria-label={`Archivar proceso ${thread.title}`} className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-border-subtle text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none">
              <Archive className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
          <button type="button" onClick={() => onOpen(thread.id)} className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg bg-surface-inverted px-2.5 text-[11px] font-semibold text-ink-on-inverted transition-colors hover:bg-surface-inverted-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none">
            Abrir
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
