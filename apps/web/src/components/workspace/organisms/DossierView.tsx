'use client';

import { useState } from 'react';
import { BookmarkPlus, FileDown, ShieldAlert } from 'lucide-react';
import type {
  A2UIDossierComponent,
  ApprovalWorkflowMode,
  UserProfileSettings,
} from '@tariffos/shared-types';
import { ConfidenceBadge } from '../atoms/ConfidenceBadge';
import { CopyHsButton } from '../atoms/CopyHsButton';
import { DossierApprovalBar } from '../molecules/DossierApprovalBar';
import { OfficialScheduleAuditBar } from '../molecules/OfficialScheduleAuditBar';
import { SignatureQuickModal } from './SignatureQuickModal';

export interface DossierViewProps {
  dossier: A2UIDossierComponent;
  profile: UserProfileSettings;
  workflowMode: ApprovalWorkflowMode;
  onApprove: () => void;
  onRequestReview: (note: string) => void;
  onSaveSku?: () => void;
  onSaveSignature?: (payload: {
    fullName: string;
    brokerLicense: string;
    signatureDataUrl: string;
  }) => void;
  onExportPdf?: () => void;
}

export function DossierView({
  dossier,
  profile,
  workflowMode,
  onApprove,
  onRequestReview,
  onSaveSku,
  onSaveSignature,
  onExportPdf,
}: DossierViewProps) {
  const [signatureOpen, setSignatureOpen] = useState(false);

  const handleExportClick = () => {
    if (!profile.brokerSignatureDataUrl && onSaveSignature) {
      setSignatureOpen(true);
      return;
    }
    onExportPdf?.();
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium tracking-wide text-ink-muted uppercase">
            {dossier.jurisdictionName}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CopyHsButton hsCode={dossier.hsCode} size="lg" />
            <ConfidenceBadge label={dossier.confidenceLevel} pct={dossier.confidencePct} />
          </div>
          <p className="text-sm font-medium text-ink-primary">{dossier.officialDescription}</p>
          {dossier.confidenceReason && (
            <p className="text-xs text-ink-muted">{dossier.confidenceReason}</p>
          )}
        </div>

        <div className="no-print flex flex-wrap gap-1.5">
          {onSaveSku && (
            <button
              type="button"
              onClick={onSaveSku}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-ink-primary hover:bg-surface-hover"
            >
              <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
              Guardar SKU
            </button>
          )}
          <button
            type="button"
            onClick={handleExportClick}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-brand-hover"
          >
            <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
            Exportar PDF
          </button>
        </div>
      </div>

      <DossierApprovalBar
        dossier={dossier}
        workflowMode={workflowMode}
        onApprove={onApprove}
        onRequestReview={onRequestReview}
      />

      <OfficialScheduleAuditBar
        hsCode={dossier.hsCode}
        verified={dossier.verifiedAgainstOfficial ?? true}
        jurisdictionName={dossier.jurisdictionName}
      />

      {dossier.technicalSpecs.length > 0 && (
        <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
          <h3 className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Especificaciones Técnicas
          </h3>
          <dl className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {dossier.technicalSpecs.map((spec) => (
              <div key={spec.key} className="rounded-lg bg-surface-muted px-3 py-2">
                <dt className="text-[11px] text-ink-muted">{spec.key}</dt>
                <dd className="mt-0.5 text-xs font-medium text-ink-primary">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {dossier.permits.length > 0 && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-amber-800 uppercase dark:text-amber-300">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Permisos y Controles OGA ({dossier.permits.length})
          </h3>
          <ul className="mt-2 space-y-1.5">
            {dossier.permits.map((permit) => (
              <li
                key={`${permit.code}-${permit.organism}`}
                className="flex items-center justify-between gap-2 rounded-lg bg-surface-panel px-3 py-2 text-xs ring-1 ring-border-subtle"
              >
                <span>
                  <span className="font-mono font-semibold text-ink-primary">{permit.code}</span>{' '}
                  <span className="text-ink-secondary">{permit.name}</span>
                </span>
                <span className="text-[11px] font-medium text-ink-muted">{permit.organism}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {dossier.legalNotes.length > 0 && (
        <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
          <h3 className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Notas Legales y Sustento Normativo
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-ink-secondary">
            {dossier.legalNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      <SignatureQuickModal
        open={signatureOpen}
        defaultName={profile.fullName}
        defaultLicense={profile.brokerLicense}
        onClose={() => setSignatureOpen(false)}
        onSaveAndExport={(payload) => {
          onSaveSignature?.(payload);
          setSignatureOpen(false);
          onExportPdf?.();
        }}
      />
    </div>
  );
}
