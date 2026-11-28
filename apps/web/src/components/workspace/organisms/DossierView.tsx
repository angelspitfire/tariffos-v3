'use client';

import { useState } from 'react';
import { BookmarkPlus, FileDown, ShieldAlert } from 'lucide-react';
import type {
  A2UIDossierComponent,
  AgencyMemberSummary,
  AgencyRole,
  ApprovalWorkflowMode,
  ProcessActivityEvent,
  UserProfileSettings,
} from '@tariffos/shared-types';
import { resolveInitialDossierReview } from '@/lib/workspace/dossier-approval-policy';
import { ConfidenceBadge } from '../atoms/ConfidenceBadge';
import { CopyHsButton } from '../atoms/CopyHsButton';
import { DossierApprovalBar } from '../molecules/DossierApprovalBar';
import { DossierComplianceSection } from '../molecules/DossierComplianceSection';
import { MerceologicalSpecsCard, type TechnicalSpecItem } from '../molecules/MerceologicalSpecsCard';
import { OfficialScheduleAuditBar } from '../molecules/OfficialScheduleAuditBar';
import { ProcessActivityStrip } from '../molecules/ProcessActivityStrip';
import { RgiDecisionDiagram } from '../molecules/RgiDecisionDiagram';
import { SignatureQuickModal } from './SignatureQuickModal';

export interface DossierViewProps {
  dossier: A2UIDossierComponent;
  profile: UserProfileSettings;
  workflowMode: ApprovalWorkflowMode;
  agencyRole?: AgencyRole;
  teamMembers?: readonly AgencyMemberSummary[];
  assignedToUserId?: string | null;
  processEvents?: readonly ProcessActivityEvent[];
  onApprove: () => void;
  onRequestReview: (note: string, assignedToUserId?: string | null, targetName?: string) => void;
  onChangeWorkflowMode?: (mode: ApprovalWorkflowMode) => void;
  onReevaluateSpecs?: (updatedSpecs: TechnicalSpecItem[]) => void;
  onSaveSku?: () => void;
  onSaveSignature?: (payload: { fullName: string; brokerLicense: string; signatureDataUrl: string }) => void;
  onExportPdf?: () => void;
  onOpenRgi?: () => void;
}

const FOCUS_RING = 'focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none';

export function DossierView({
  dossier, profile, workflowMode, agencyRole, teamMembers, assignedToUserId, processEvents,
  onApprove, onRequestReview, onChangeWorkflowMode, onReevaluateSpecs, onSaveSku, onSaveSignature, onExportPdf, onOpenRgi,
}: DossierViewProps) {
  const [signatureOpen, setSignatureOpen] = useState(false);
  const isApproved = resolveInitialDossierReview(dossier, workflowMode).reviewStatus === 'approved';
  const hasCompliance =
    (dossier.flags?.length ?? 0) > 0 ||
    (dossier.rejectedAlternatives?.length ?? 0) > 0 ||
    (dossier.unresolved?.length ?? 0) > 0;

  const handleExportClick = () => {
    if (!profile.brokerSignatureDataUrl && onSaveSignature) {
      setSignatureOpen(true);
      return;
    }
    onExportPdf?.();
  };

  return (
    <div className="p-4">
      <article className="divide-y divide-border-hairline overflow-hidden rounded-card border border-border-subtle bg-surface-panel shadow-xs">
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-ink-primary">Dictamen Técnico</h2>
              <span className="rounded-md border border-border-subtle bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-muted">
                {dossier.jurisdictionName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CopyHsButton hsCode={dossier.hsCode} size="lg" />
              <ConfidenceBadge label={dossier.confidenceLevel} pct={dossier.confidencePct} />
              {dossier.statisticalUnit ? (
                <span className="rounded-md border border-border-subtle bg-surface-muted px-2 py-0.5 font-mono text-xs text-ink-secondary">
                  UF: {dossier.statisticalUnit}
                </span>
              ) : null}
            </div>
            <p className="max-w-[72ch] text-sm font-medium leading-relaxed text-ink-primary">
              {dossier.officialDescription}
            </p>
            {dossier.confidenceReason ? (
              <p className="max-w-[72ch] text-xs leading-relaxed text-ink-muted">{dossier.confidenceReason}</p>
            ) : null}
          </div>

          <div className="no-print flex flex-wrap gap-1.5">
            {onSaveSku ? (
              <button
                type="button"
                onClick={onSaveSku}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted px-3 py-1.5 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-hover ${FOCUS_RING}`}
              >
                <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
                Guardar SKU
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleExportClick}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${FOCUS_RING} ${
                isApproved
                  ? 'bg-accent-brand text-white hover:bg-accent-brand-hover'
                  : 'border border-border-subtle bg-surface-panel text-ink-primary hover:bg-surface-hover'
              }`}
            >
              <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
              Descargar PDF
            </button>
          </div>
        </header>

        <DossierApprovalBar
          dossier={dossier}
          workflowMode={workflowMode}
          agencyRole={agencyRole}
          teamMembers={teamMembers}
          assignedToUserId={assignedToUserId}
          onApprove={onApprove}
          onRequestReview={onRequestReview}
          onChangeWorkflowMode={onChangeWorkflowMode}
          embedded
        />

        <OfficialScheduleAuditBar
          hsCode={dossier.hsCode}
          verified={dossier.verifiedAgainstOfficial ?? true}
          jurisdictionName={dossier.jurisdictionName}
          embedded
        />

        <RgiDecisionDiagram
          hsCode={dossier.hsCode}
          confidencePct={dossier.confidencePct}
          rgiSteps={dossier.rgiSteps}
          flagsCount={dossier.flags?.length ?? 0}
          unresolvedCount={dossier.unresolved?.length ?? 0}
          onOpenRgi={onOpenRgi}
          embedded
        />

        <MerceologicalSpecsCard specs={dossier.technicalSpecs} onReevaluate={onReevaluateSpecs} embedded />

        {hasCompliance ? (
          <div className="px-5 py-4">
            <DossierComplianceSection flags={dossier.flags} rejectedAlternatives={dossier.rejectedAlternatives} unresolved={dossier.unresolved} verifiedAgainstOfficial={dossier.verifiedAgainstOfficial} jurisdictionName={dossier.jurisdictionName} />
          </div>
        ) : null}

        {dossier.permits.length > 0 ? (
          <section className="border-l-2 border-l-amber-500/70 bg-amber-500/[0.04] px-5 py-4">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Permisos y controles OGA ({dossier.permits.length})
            </h3>
            <ul className="mt-2 space-y-1.5">
              {dossier.permits.map((permit) => (
                <li key={`${permit.code}-${permit.organism}`} className="flex items-center justify-between gap-2 rounded-lg bg-surface-muted/60 px-3 py-2 text-xs ring-1 ring-border-subtle">
                  <span><span className="font-mono font-semibold text-ink-primary">{permit.code}</span> <span className="text-ink-secondary">{permit.name}</span></span>
                  <span className="text-[11px] font-medium text-ink-muted">{permit.organism}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {dossier.legalNotes.length > 0 ? (
          <section className="px-5 py-4">
            <h3 className="text-xs font-semibold text-ink-secondary">Notas legales y sustento normativo</h3>
            <ul className="mt-2 max-w-[72ch] list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-ink-secondary">
              {dossier.legalNotes.map((note) => <li key={note}>{note}</li>)}
            </ul>
          </section>
        ) : null}

        <ProcessActivityStrip events={processEvents} />
      </article>

      <SignatureQuickModal
        open={signatureOpen} defaultName={profile.fullName} defaultLicense={profile.brokerLicense}
        onClose={() => setSignatureOpen(false)}
        onSaveAndExport={(payload) => { onSaveSignature?.(payload); setSignatureOpen(false); onExportPdf?.(); }}
      />
    </div>
  );
}
