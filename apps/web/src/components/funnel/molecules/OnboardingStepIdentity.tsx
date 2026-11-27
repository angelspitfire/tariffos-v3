'use client';

import type { Ref } from 'react';
import { Building2, User } from 'lucide-react';
import { FunnelInput, FunnelSelect } from '../atoms/FunnelField';

export interface OnboardingStepIdentityProps {
  fullName: string;
  role: string;
  brokerLicense: string;
  taxId: string;
  companyName: string;
  fullNameError?: string | null;
  companyNameError?: string | null;
  fullNameRef?: Ref<HTMLInputElement>;
  companyNameRef?: Ref<HTMLInputElement>;
  onChangeFullName: (value: string) => void;
  onChangeRole: (value: string) => void;
  onChangeBrokerLicense: (value: string) => void;
  onChangeTaxId: (value: string) => void;
  onChangeCompanyName: (value: string) => void;
}

export function OnboardingStepIdentity({
  fullName,
  role,
  brokerLicense,
  taxId,
  companyName,
  fullNameError,
  companyNameError,
  fullNameRef,
  companyNameRef,
  onChangeFullName,
  onChangeRole,
  onChangeBrokerLicense,
  onChangeTaxId,
  onChangeCompanyName,
}: OnboardingStepIdentityProps) {
  return (
    <div className="space-y-4">
      <FunnelInput
        ref={fullNameRef}
        label="Nombre completo"
        placeholder="Ej. María González"
        leftIcon={<User className="h-4 w-4" />}
        value={fullName}
        error={fullNameError}
        onChange={(e) => onChangeFullName(e.target.value)}
        required
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FunnelSelect
          label="Rol operativo"
          value={role}
          onChange={(e) => onChangeRole(e.target.value)}
        >
          <option value="Agente de Aduanas">Agente de Aduanas</option>
          <option value="Analista de Comercio Exterior">Analista de Comercio Exterior</option>
          <option value="Importador / Consignatario">Importador / Consignatario</option>
          <option value="Auditor de Cumplimiento">Auditor de Cumplimiento</option>
        </FunnelSelect>
        <FunnelInput
          label="Patente aduanal (opcional)"
          placeholder="Ej. SENIAT-AA-1042"
          value={brokerLicense}
          onChange={(e) => onChangeBrokerLicense(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FunnelInput
          ref={companyNameRef}
          label="Empresa o agencia"
          placeholder="Ej. Aduanas Bolívar C.A."
          leftIcon={<Building2 className="h-4 w-4" />}
          value={companyName}
          error={companyNameError}
          onChange={(e) => onChangeCompanyName(e.target.value)}
          required
        />
        <FunnelInput
          label="RIF / Tax ID (opcional)"
          placeholder="Ej. J-30192837-4"
          className="font-mono"
          value={taxId}
          onChange={(e) => onChangeTaxId(e.target.value)}
        />
      </div>
    </div>
  );
}
