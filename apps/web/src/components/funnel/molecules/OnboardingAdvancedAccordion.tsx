'use client';

import { useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { ApprovalWorkflowMode, IncotermCode } from '@tariffos/shared-types';
import { FunnelSelect } from '../atoms/FunnelField';

const REVIEW_MODE_LABELS: Record<ApprovalWorkflowMode, string> = {
  agent_decides: 'El agente decide',
  direct_seal: 'Sello directo',
  always_review: 'Siempre revisar',
};

export interface OnboardingAdvancedAccordionProps {
  defaultIncoterm: IncotermCode;
  preferredCurrency: 'USD' | 'EUR';
  approvalWorkflowMode: ApprovalWorkflowMode;
  onChange: (patch: {
    defaultIncoterm?: IncotermCode;
    preferredCurrency?: 'USD' | 'EUR';
    approvalWorkflowMode?: ApprovalWorkflowMode;
  }) => void;
}

export function OnboardingAdvancedAccordion({
  defaultIncoterm,
  preferredCurrency,
  approvalWorkflowMode,
  onChange,
}: OnboardingAdvancedAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface-muted/40">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
      >
        <span className="inline-flex items-center gap-2 min-w-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-accent-ink shrink-0" />
          <span className="font-medium truncate">
            Preferencias avanzadas ({defaultIncoterm} · {preferredCurrency} ·{' '}
            {REVIEW_MODE_LABELS[approvalWorkflowMode]})
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div className="px-3.5 pb-3.5 pt-2.5 border-t border-border-hairline grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FunnelSelect
            label="Incoterm por defecto"
            value={defaultIncoterm}
            onChange={(e) => onChange({ defaultIncoterm: e.target.value as IncotermCode })}
          >
            <option value="CIF">CIF</option>
            <option value="FOB">FOB</option>
            <option value="EXW">EXW</option>
            <option value="CFR">CFR</option>
            <option value="DDP">DDP</option>
          </FunnelSelect>

          <FunnelSelect
            label="Moneda principal"
            value={preferredCurrency}
            onChange={(e) =>
              onChange({ preferredCurrency: e.target.value as 'USD' | 'EUR' })
            }
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </FunnelSelect>

          <FunnelSelect
            label="Modo de revisión"
            value={approvalWorkflowMode}
            onChange={(e) =>
              onChange({
                approvalWorkflowMode: e.target.value as ApprovalWorkflowMode,
              })
            }
          >
            <option value="agent_decides">El agente decide (HITL inteligente)</option>
            <option value="direct_seal">Sello directo (alta confianza)</option>
            <option value="always_review">Siempre revisar antes de sellar</option>
          </FunnelSelect>
        </div>
      ) : null}
    </div>
  );
}
