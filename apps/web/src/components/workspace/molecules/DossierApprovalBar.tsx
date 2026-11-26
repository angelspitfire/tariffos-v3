'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardCheck, ShieldCheck } from 'lucide-react';
import type {
  A2UIDossierComponent,
  ApprovalWorkflowMode,
  DossierReviewStatus,
} from '@tariffos/shared-types';
import { resolveInitialDossierReview } from '@/lib/workspace/dossier-approval-policy';
import { StatusPill } from '../atoms/StatusPill';

export interface DossierApprovalBarProps {
  dossier: A2UIDossierComponent;
  workflowMode: ApprovalWorkflowMode;
  onApprove?: () => void;
  onRequestReview?: (note: string) => void;
  onChangeStatus?: (status: DossierReviewStatus, complianceNote?: string) => void;
}

const MODE_LABELS: Record<ApprovalWorkflowMode, string> = {
  agent_decides: 'Modo: Agente decide',
  direct_seal: 'Modo: Sellado directo',
  always_review: 'Modo: Revisión obligatoria',
};

export function DossierApprovalBar({
  dossier,
  workflowMode,
  onApprove,
  onRequestReview,
  onChangeStatus,
}: DossierApprovalBarProps) {
  const resolved = resolveInitialDossierReview(dossier, workflowMode);
  const status = resolved.reviewStatus ?? 'draft_ai';
  const trigger = resolved.agentReviewTrigger;

  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [note, setNote] = useState(resolved.approvalMeta?.complianceNotes ?? '');

  const handleApprove = () => {
    onApprove?.();
    onChangeStatus?.('approved', undefined);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNote = note.trim() || 'Pendiente de revisión documental.';
    onRequestReview?.(cleanNote);
    onChangeStatus?.('in_review', cleanNote);
    setReviewFormOpen(false);
  };

  return (
    <section className="rounded-xl border border-border-subtle bg-surface-panel p-3.5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill variant={status} />
          <span className="text-[11px] text-ink-muted">{MODE_LABELS[workflowMode]}</span>
          {resolved.approvalMeta?.approvedBy && status === 'approved' && (
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
              · {resolved.approvalMeta.approvedBy}
              {resolved.approvalMeta.brokerLicense ? ` (${resolved.approvalMeta.brokerLicense})` : ''}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {status !== 'approved' && (
            <button
              type="button"
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Aprobar y sellar
            </button>
          )}
          <button
            type="button"
            onClick={() => setReviewFormOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-ink-primary transition hover:bg-surface-hover"
          >
            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Dejar en revisión
          </button>
        </div>
      </div>

      {trigger && status !== 'approved' && (
        <div className="mt-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{trigger.invokedBySkill ?? 'Revisión técnica requerida'}</span>
          </div>
          <p className="mt-1 text-ink-secondary">{trigger.reason}</p>
          {trigger.missingFields && trigger.missingFields.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {trigger.missingFields.map((field) => (
                <span
                  key={field}
                  className="rounded-md bg-surface-panel px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-500/30 dark:text-amber-300"
                >
                  {field}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {status === 'approved' && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Dictamen sellado y listo para declaración aduanera o exportación PDF.</span>
        </div>
      )}

      {reviewFormOpen && (
        <form
          onSubmit={handleReviewSubmit}
          className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border-hairline pt-2.5"
        >
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nota de cumplimiento o requisito faltante..."
            className="min-w-48 flex-1 rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5 text-xs text-ink-primary outline-none focus:border-accent-brand"
          />
          <button
            type="submit"
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700"
          >
            Confirmar revisión
          </button>
        </form>
      )}
    </section>
  );
}
