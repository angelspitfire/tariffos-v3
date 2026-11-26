'use client';

import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import type { ApprovalWorkflowMode, IncotermCode, UserProfileSettings } from '@tariffos/shared-types';

export interface WorkspaceSettingsModalProps {
  open: boolean;
  profile: UserProfileSettings;
  onClose: () => void;
  onSave: (patch: Partial<UserProfileSettings>) => void;
}

export function WorkspaceSettingsModal({
  open,
  profile,
  onClose,
  onSave,
}: WorkspaceSettingsModalProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [brokerLicense, setBrokerLicense] = useState(profile.brokerLicense);
  const [defaultIncoterm, setDefaultIncoterm] = useState<IncotermCode>(profile.defaultIncoterm);
  const [preferredCurrency, setPreferredCurrency] = useState<'USD' | 'EUR'>(profile.preferredCurrency);
  const [detailLevel, setDetailLevel] = useState<UserProfileSettings['detailLevel']>(profile.detailLevel);
  const [approvalWorkflowMode, setApprovalWorkflowMode] = useState<ApprovalWorkflowMode>(
    profile.approvalWorkflowMode,
  );
  const [autoOpenCanvas, setAutoOpenCanvas] = useState(profile.autoOpenCanvas);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName: fullName.trim() || profile.fullName,
      companyName: companyName.trim(),
      brokerLicense: brokerLicense.trim(),
      defaultIncoterm,
      preferredCurrency,
      detailLevel,
      approvalWorkflowMode,
      autoOpenCanvas,
    });
    onClose();
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Configuración del workspace"
    >
      <div className="w-full max-w-lg rounded-surface border border-border-subtle bg-surface-panel shadow-elev-2 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-primary">
            <Settings className="h-4 w-4 text-accent-ink" aria-hidden="true" />
            <span>Configuración de cuenta y despacho</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar configuración"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted hover:bg-surface-hover hover:text-ink-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 text-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="block font-medium text-ink-secondary">Nombre completo</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 text-ink-primary focus:border-accent-brand focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="block font-medium text-ink-secondary">Agencia / Empresa</span>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 text-ink-primary focus:border-accent-brand focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="block font-medium text-ink-secondary">Patente / Registro aduanal</span>
              <input
                type="text"
                value={brokerLicense}
                onChange={(e) => setBrokerLicense(e.target.value)}
                className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 text-ink-primary focus:border-accent-brand focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="block font-medium text-ink-secondary">Política de sellado</span>
              <select
                value={approvalWorkflowMode}
                onChange={(e) => setApprovalWorkflowMode(e.target.value as ApprovalWorkflowMode)}
                className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 text-ink-primary focus:border-accent-brand focus:outline-none"
              >
                <option value="agent_decides">Agente decide revisión</option>
                <option value="direct_seal">Sellado directo</option>
                <option value="always_review">Revisión obligatoria</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="block font-medium text-ink-secondary">Incoterm base</span>
              <select
                value={defaultIncoterm}
                onChange={(e) => setDefaultIncoterm(e.target.value as IncotermCode)}
                className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 font-mono text-ink-primary focus:border-accent-brand focus:outline-none"
              >
                {(['FOB', 'CIF', 'EXW', 'DDP'] as const).map((inc) => (
                  <option key={inc} value={inc}>
                    {inc}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="block font-medium text-ink-secondary">Moneda & Profundidad</span>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value as 'USD' | 'EUR')}
                  className="rounded-field border border-border-subtle bg-surface-input px-2 py-2 font-mono text-ink-primary"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
                <select
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(e.target.value as UserProfileSettings['detailLevel'])}
                  className="rounded-field border border-border-subtle bg-surface-input px-2 py-2 text-ink-primary"
                >
                  <option value="concise">Conciso</option>
                  <option value="standard">Estándar</option>
                  <option value="exhaustive">Exhaustivo</option>
                </select>
              </div>
            </label>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-field border border-border-subtle bg-surface-muted px-3 py-2.5">
            <span className="font-medium text-ink-primary">Abrir Canvas automáticamente al clasificar</span>
            <input
              type="checkbox"
              checked={autoOpenCanvas}
              onChange={(e) => setAutoOpenCanvas(e.target.checked)}
              className="h-4 w-4 accent-accent-brand"
            />
          </label>

          <div className="flex justify-end gap-2 border-t border-border-hairline pt-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full border border-border-subtle bg-surface-muted px-4 py-1.5 font-medium text-ink-primary hover:bg-surface-hover"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-full bg-accent-brand px-4 py-1.5 font-semibold text-white hover:bg-accent-brand-hover"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
