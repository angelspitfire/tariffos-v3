import type { LegalDocumentStatus, LegalDocumentType } from '@tariffos/shared-types';

const STATUS_STYLES: Record<LegalDocumentStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Borrador',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  },
  PUBLISHED: {
    label: 'Publicado',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  },
  DEROGATED: {
    label: 'Derogado',
    className: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
  },
};

export function DocumentStatusBadge({
  status,
  legalType,
}: {
  status: LegalDocumentStatus;
  legalType?: LegalDocumentType;
}) {
  const cfg = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.className}`}
      >
        {cfg.label}
      </span>
      {legalType && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono bg-surface-subtle text-ink-muted border border-border-subtle">
          {legalType}
        </span>
      )}
    </span>
  );
}
