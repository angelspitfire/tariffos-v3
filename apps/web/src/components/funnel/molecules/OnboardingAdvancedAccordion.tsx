'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { ApprovalWorkflowMode, IncotermCode } from '@tariffos/shared-types';
import { FUNNEL_JURISDICTIONS, VE_CUSTOMS_OFFICES } from '@/lib/funnel/funnel-storage';
import { FunnelSelect } from '../atoms/FunnelField';

const REVIEW_MODE_LABELS: Record<ApprovalWorkflowMode, string> = {
  agent_decides: 'El agente decide',
  direct_seal: 'Sello directo',
  always_review: 'Siempre revisar',
};

export interface OnboardingAdvancedAccordionProps {
  isCloud: boolean;
  jurisdictionId: string;
  customsOffice: string;
  defaultIncoterm: IncotermCode;
  preferredCurrency: 'USD' | 'EUR';
  approvalWorkflowMode: ApprovalWorkflowMode;
  onChange: (patch: {
    jurisdictionId?: string;
    customsOffice?: string;
    defaultIncoterm?: IncotermCode;
    preferredCurrency?: 'USD' | 'EUR';
    approvalWorkflowMode?: ApprovalWorkflowMode;
  }) => void;
}

export function OnboardingAdvancedAccordion({
  isCloud,
  jurisdictionId,
  customsOffice,
  defaultIncoterm,
  preferredCurrency,
  approvalWorkflowMode,
  onChange,
}: OnboardingAdvancedAccordionProps) {
  const [open, setOpen] = useState(false);
  const countryCode =
    FUNNEL_JURISDICTIONS.find((jur) => jur.id === jurisdictionId)?.countryCode ?? 'VE';

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-muted/40">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-3.5 py-2.5 text-xs text-ink-secondary transition-colors hover:text-ink-primary"
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-accent-ink" />
          <span className="truncate font-medium">
            Preferencias operativas ({countryCode} · {defaultIncoterm} · {preferredCurrency} ·{' '}
            {REVIEW_MODE_LABELS[approvalWorkflowMode]})
          </span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-border-hairline px-3.5 pb-3.5 pt-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <FunnelSelect
                label="Jurisdicción por defecto"
                value={jurisdictionId}
                onChange={(e) => onChange({ jurisdictionId: e.target.value })}
              >
                {FUNNEL_JURISDICTIONS.map((jur) => {
                  const disabled = isCloud && !jur.liveInCloud;
                  return (
                    <option key={jur.id} value={jur.id} disabled={disabled}>
                      {jur.country} · {jur.authority} ({jur.nomenclature})
                      {disabled ? ' — Próximamente (Enterprise)' : ''}
                    </option>
                  );
                })}
              </FunnelSelect>
              {isCloud ? (
                <p className="text-[11px] text-ink-muted">
                  ¿Operas en CO, MX, US o UE?{' '}
                  <Link href="/#contacto" className="font-semibold text-accent-ink hover:underline">
                    Solicita despliegue Enterprise
                  </Link>
                  .
                </p>
              ) : null}
            </div>

            <FunnelSelect
              label="Aduana principal"
              value={customsOffice}
              onChange={(e) => onChange({ customsOffice: e.target.value })}
            >
              {VE_CUSTOMS_OFFICES.map((office) => (
                <option key={office} value={office}>
                  {office}
                </option>
              ))}
            </FunnelSelect>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
        </div>
      ) : null}
    </div>
  );
}
