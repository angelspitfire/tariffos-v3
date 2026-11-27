'use client';

import Link from 'next/link';
import type { ApprovalWorkflowMode, IncotermCode } from '@tariffos/shared-types';
import { FUNNEL_JURISDICTIONS } from '@/lib/funnel/funnel-storage';
import { FunnelSelect } from '../atoms/FunnelField';

export interface OnboardingStepOperationProps {
  isCloud: boolean;
  jurisdictionId: string;
  incoterm: IncotermCode;
  currency: 'USD' | 'EUR';
  approvalMode: ApprovalWorkflowMode;
  onChangeJurisdiction: (value: string) => void;
  onChangeIncoterm: (value: IncotermCode) => void;
  onChangeCurrency: (value: 'USD' | 'EUR') => void;
  onChangeApprovalMode: (value: ApprovalWorkflowMode) => void;
}

export function OnboardingStepOperation({
  isCloud,
  jurisdictionId,
  incoterm,
  currency,
  approvalMode,
  onChangeJurisdiction,
  onChangeIncoterm,
  onChangeCurrency,
  onChangeApprovalMode,
}: OnboardingStepOperationProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <FunnelSelect
          label="Jurisdicción por defecto"
          value={jurisdictionId}
          onChange={(e) => onChangeJurisdiction(e.target.value)}
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
            ¿Necesitas operar en CO, MX, US o UE desde hoy?{' '}
            <Link href="/#contacto" className="font-semibold text-accent-ink hover:underline">
              Solicita despliegue Enterprise
            </Link>
            .
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FunnelSelect
          label="Incoterm por defecto"
          value={incoterm}
          onChange={(e) => onChangeIncoterm(e.target.value as IncotermCode)}
        >
          <option value="CIF">CIF</option>
          <option value="FOB">FOB</option>
          <option value="EXW">EXW</option>
          <option value="CFR">CFR</option>
          <option value="DDP">DDP</option>
        </FunnelSelect>

        <FunnelSelect
          label="Moneda principal"
          value={currency}
          onChange={(e) => onChangeCurrency(e.target.value as 'USD' | 'EUR')}
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </FunnelSelect>

        <FunnelSelect
          label="Modo de revisión"
          value={approvalMode}
          onChange={(e) => onChangeApprovalMode(e.target.value as ApprovalWorkflowMode)}
        >
          <option value="agent_decides">El agente decide (HITL inteligente)</option>
          <option value="direct_seal">Sello directo (alta confianza)</option>
          <option value="always_review">Siempre revisar antes de sellar</option>
        </FunnelSelect>
      </div>
    </div>
  );
}
