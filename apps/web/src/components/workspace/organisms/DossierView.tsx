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
import { DossierComplianceSection } from '../molecules/DossierComplianceSection';
import { MerceologicalSpecsCard, type TechnicalSpecItem } from '../molecules/MerceologicalSpecsCard';
import { OfficialScheduleAuditBar } from '../molecules/OfficialScheduleAuditBar';
import { RgiDecisionDiagram } from '../molecules/RgiDecisionDiagram';
import { SignatureQuickModal } from './SignatureQuickModal';

export interface DossierViewProps {
  dossier: A2UIDossierComponent;
  profile: UserProfileSettings;
  workflowMode: ApprovalWorkflowMode;
  onApprove: () => void;
  onRequestReview: (note: string) => void;
  onChangeWorkflowMode?: (mode: ApprovalWorkflowMode) => void;
  onReevaluateSpecs?: (updatedSpecs: TechnicalSpecItem[]) => void;
  onSaveSku?: () => void;
  onSaveSignature?: (payload: {
    fullName: string;
    brokerLicense: string;
    signatureDataUrl: string;
  }) => void;
  onExportPdf?: () => void;
  onOpenRgi?: () => void;
}

export function DossierView({
  dossier,
  profile,
  workflowMode,
  onApprove,
  onRequestReview,
  onChangeWorkflowMode,
  onReevaluateSpecs,
  onSaveSku,
  onSaveSignature,
  onExportPdf,
  onOpenRgi,
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
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-card border border-border-subtle bg-surface-panel p-4 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-ink-primary">
              Dictamen Técnico
            </h2>
            <span className="rounded-md border border-border-subtle bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-muted">
              {dossier.jurisdictionName}
            </span>
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
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-surface-hover"
            >
              <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
              Guardar SKU
            </button>
          )}
          <button
            type="button"
            onClick={handleExportClick}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent-brand px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-accent-brand-hover"
          >
            <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
            Descargar PDF
          </button>
        </div>
      </div>

      <DossierApprovalBar
        dossier={dossier}
        workflowMode={workflowMode}
        onApprove={onApprove}
        onRequestReview={onRequestReview}
        onChangeWorkflowMode={onChangeWorkflowMode}
      />

      <OfficialScheduleAuditBar
        hsCode={dossier.hsCode}
        verified={dossier.verifiedAgainstOfficial ?? true}
        jurisdictionName={dossier.jurisdictionName}
      />

      <RgiDecisionDiagram
        hsCode={dossier.hsCode}
        confidencePct={dossier.confidencePct}
        rgiSteps={dossier.rgiSteps}
        flagsCount={dossier.flags?.length ?? 0}
        unresolvedCount={dossier.unresolved?.length ?? 0}
        onOpenRgi={onOpenRgi}
      />

      <MerceologicalSpecsCard
        specs={dossier.technicalSpecs}
        onReevaluate={onReevaluateSpecs}
      />

      <DossierComplianceSection
        flags={dossier.flags}
        rejectedAlternatives={dossier.rejectedAlternatives}
        unresolved={dossier.unresolved}
        verifiedAgainstOfficial={dossier.verifiedAgainstOfficial}
        jurisdictionName={dossier.jurisdictionName}
      />

      {dossier.permits.length > 0 && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Permisos y controles OGA ({dossier.permits.length})
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
          <h3 className="text-xs font-semibold text-ink-secondary">
            Notas legales y sustento normativo
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
