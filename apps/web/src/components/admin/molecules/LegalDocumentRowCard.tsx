import { FileText, GitCompare, Trash2 } from 'lucide-react';
import type { LegalDraftSummary } from '@tariffos/shared-types';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { DocumentStatusBadge } from '../atoms/DocumentStatusBadge';

export interface LegalDocumentRowCardProps {
  doc: LegalDraftSummary;
  busy?: boolean;
  onInspectDiff: (docId: string) => void;
  onDiscard: (docId: string) => void;
}

export function LegalDocumentRowCard({
  doc,
  busy = false,
  onInspectDiff,
  onDiscard,
}: LegalDocumentRowCardProps) {
  const validDate = doc.validFromDate.slice(0, 10);

  return (
    <FunnelCard padding="p-4" className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <FileText className="w-4 h-4 text-ink-muted shrink-0" />
          <span className="text-sm font-semibold text-ink-primary truncate">{doc.title}</span>
          <DocumentStatusBadge status={doc.status} legalType={doc.legalType} />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-muted">
          <span className="font-mono">ruta: {doc.hierarchyPath}</span>
          <span>chunks: {doc.chunkCount}</span>
          <span>vigente desde: {validDate}</span>
          {doc.decreeNumber && <span>{doc.decreeNumber}</span>}
          {doc.officialDocumentNumber && <span>{doc.officialDocumentNumber}</span>}
        </div>
      </div>

      {doc.status === 'DRAFT' && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onInspectDiff(doc.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-brand-hover cursor-pointer disabled:opacity-50"
          >
            <GitCompare className="w-3.5 h-3.5" />
            Ver Diff / Publicar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDiscard(doc.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-border-strong bg-surface-panel px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-surface-hover cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Descartar
          </button>
        </div>
      )}
    </FunnelCard>
  );
}
