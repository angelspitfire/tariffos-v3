'use client';

import { useId, useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardCheck, ShieldCheck } from 'lucide-react';
import {
  canSealDossier,
  type A2UIDossierComponent,
  type AgencyMemberSummary,
  type AgencyRole,
  type ApprovalWorkflowMode,
  type DossierReviewStatus,
} from '@tariffos/shared-types';
import { resolveInitialDossierReview } from '@/lib/workspace/dossier-approval-policy';
import { StatusPill } from '../atoms/StatusPill';

export interface DossierApprovalBarProps {
  dossier: A2UIDossierComponent;
  workflowMode: ApprovalWorkflowMode;
  agencyRole?: AgencyRole;
  teamMembers?: readonly AgencyMemberSummary[];
  assignedToUserId?: string | null;
  onApprove?: () => void;
  onRequestReview?: (note: string, assignedToUserId?: string | null, targetName?: string) => void;
  onChangeStatus?: (status: DossierReviewStatus, complianceNote?: string) => void;
  onChangeWorkflowMode?: (mode: ApprovalWorkflowMode) => void;
  embedded?: boolean;
}

const MODE_OPTIONS: ReadonlyArray<{ value: ApprovalWorkflowMode; label: string }> = [
  { value: 'agent_decides', label: 'Agente decide' },
  { value: 'direct_seal', label: 'Sellado directo' },
  { value: 'always_review', label: 'Revisión obligatoria' },
];

const MODE_LABELS: Record<ApprovalWorkflowMode, string> = {
  agent_decides: 'Política: Agente decide',
  direct_seal: 'Política: Sellado directo',
  always_review: 'Política: Revisión obligatoria',
};

export function DossierApprovalBar({
  dossier, workflowMode, agencyRole = 'OWNER', teamMembers = [], assignedToUserId = null,
  onApprove, onRequestReview, onChangeStatus, onChangeWorkflowMode, embedded = false,
}: DossierApprovalBarProps) {
  const noteInputId = useId();
  const resolved = resolveInitialDossierReview(dossier, workflowMode);
  const status = resolved.reviewStatus ?? 'draft_ai';
  const trigger = resolved.agentReviewTrigger;
  const canSeal = canSealDossier(agencyRole, workflowMode);

  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [note, setNote] = useState(resolved.approvalMeta?.complianceNotes ?? '');
  const [reviewerId, setReviewerId] = useState<string>(assignedToUserId ?? '');

  const handleApprove = () => {
    onApprove?.();
    onChangeStatus?.('approved', undefined);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNote = note.trim() || 'Pendiente de revisión documental.';
    const nextAssignee = reviewerId.trim() ? reviewerId.trim() : null;
    const targetName = nextAssignee ? teamMembers.find((m) => m.userId === nextAssignee)?.fullName : undefined;
    if (nextAssignee) {
      onRequestReview?.(cleanNote, nextAssignee, targetName);
    } else {
      onRequestReview?.(cleanNote);
    }
    onChangeStatus?.('in_review', cleanNote);
    setReviewFormOpen(false);
  };

  const surfaceClass = embedded
    ? status === 'approved'
      ? 'border-l-2 border-l-emerald-500/80 bg-emerald-500/[0.04] px-5 py-3.5'
      : 'border-l-2 border-l-amber-500/80 bg-amber-500/[0.04] px-5 py-3.5'
    : status === 'approved'
      ? 'rounded-card border border-border-subtle border-l-2 border-l-emerald-500/80 bg-emerald-500/[0.04] p-3.5 shadow-xs'
      : 'rounded-card border border-border-subtle border-l-2 border-l-amber-500/80 bg-amber-500/[0.04] p-3.5 shadow-xs';

  return (
    <section className={surfaceClass}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill variant={status} />
          {onChangeWorkflowMode ? (
            <select
              aria-label="Política de sellado"
              name="workflowMode"
              value={workflowMode}
              onChange={(e) => onChangeWorkflowMode(e.target.value as ApprovalWorkflowMode)}
              className="cursor-pointer rounded-full border border-border-subtle bg-surface-panel px-2.5 py-0.5 text-[11px] font-medium text-ink-secondary transition-colors hover:border-accent-brand hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
            >
              {MODE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface-panel text-ink-primary">{opt.label}</option>
              ))}
            </select>
          ) : (
            <span className="text-[11px] text-ink-muted">{MODE_LABELS[workflowMode]}</span>
          )}
          {resolved.approvalMeta?.approvedBy && status === 'approved' ? (
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
              · {resolved.approvalMeta.approvedBy}{resolved.approvalMeta.brokerLicense ? ` (${resolved.approvalMeta.brokerLicense})` : ''}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setReviewFormOpen((prev) => !prev)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface-panel px-3 py-1.5 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {canSeal ? 'Dejar en revisión' : 'Enviar a revisión'}
          </button>
          {status !== 'approved' && canSeal ? (
            <button
              type="button"
              onClick={handleApprove}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Aprobar y sellar
            </button>
          ) : null}
        </div>
      </div>

      {trigger && status !== 'approved' ? (
        <div className="mt-2.5 rounded-lg border border-amber-500/25 bg-surface-panel/80 px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{trigger.invokedBySkill ?? 'Revisión técnica requerida'}</span>
          </div>
          <p className="mt-1 max-w-[72ch] text-ink-secondary">{trigger.reason}</p>
          {trigger.missingFields && trigger.missingFields.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {trigger.missingFields.map((field) => (
                <span key={field} className="rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-500/25 dark:text-amber-300">{field}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {resolved.approvalMeta?.complianceNotes && status === 'in_review' ? (
        <div className="mt-2.5 rounded-lg border border-amber-500/30 bg-surface-panel px-3 py-2 text-xs text-ink-primary">
          <span className="font-semibold text-amber-800 dark:text-amber-300">Nota de revisión: </span>
          <span>{resolved.approvalMeta.complianceNotes}</span>
        </div>
      ) : null}

      {status === 'approved' ? (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Dictamen sellado y listo para declaración aduanera o exportación PDF.</span>
        </div>
      ) : null}

      {reviewFormOpen ? (
        <form onSubmit={handleReviewSubmit} className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border-hairline pt-2.5">
          {teamMembers.length > 0 ? (
            <select
              aria-label="Asignar revisor"
              value={reviewerId}
              onChange={(e) => setReviewerId(e.target.value)}
              className="rounded-lg border border-border-subtle bg-surface-panel px-2.5 py-1.5 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
            >
              <option value="">Cola técnica de la agencia</option>
              {teamMembers.filter((m) => m.role !== 'ANALYST' || m.userId === assignedToUserId).map((m) => (
                <option key={m.userId} value={m.userId}>{m.fullName}</option>
              ))}
            </select>
          ) : null}
          <label htmlFor={noteInputId} className="sr-only">Nota de cumplimiento</label>
          <input
            id={noteInputId}
            name="complianceNote"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nota de cumplimiento o requisito faltante…"
            className="min-w-48 flex-1 rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5 text-xs text-ink-primary focus:border-accent-brand focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          />
          <button type="submit" className="cursor-pointer rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700 focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none">
            Confirmar revisión
          </button>
        </form>
      ) : null}
    </section>
  );
}
