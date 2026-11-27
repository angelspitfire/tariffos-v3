'use client';

import { Building2, User } from 'lucide-react';
import { FunnelInput, FunnelSelect } from '../atoms/FunnelField';

export interface OnboardingStepIdentityProps {
  fullName: string;
  role: string;
  brokerLicense: string;
  companyName: string;
  onChangeFullName: (value: string) => void;
  onChangeRole: (value: string) => void;
  onChangeBrokerLicense: (value: string) => void;
  onChangeCompanyName: (value: string) => void;
}

export function OnboardingStepIdentity({
  fullName,
  role,
  brokerLicense,
  companyName,
  onChangeFullName,
  onChangeRole,
  onChangeBrokerLicense,
  onChangeCompanyName,
}: OnboardingStepIdentityProps) {
  return (
    <div className="space-y-4">
      <FunnelInput
        label="Nombre completo"
        placeholder="Ej. María González"
        leftIcon={<User className="h-4 w-4" />}
        value={fullName}
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
      <FunnelInput
        label="Empresa o agencia"
        placeholder="Ej. Aduanas Bolívar C.A."
        leftIcon={<Building2 className="h-4 w-4" />}
        value={companyName}
        onChange={(e) => onChangeCompanyName(e.target.value)}
        required
      />
    </div>
  );
}
