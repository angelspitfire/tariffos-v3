'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import type { UserProfileSettings } from '@tariffos/shared-types';
import { BrokerSignaturePad } from './BrokerSignaturePad';

const ROLE_OPTIONS = [
  'Agente de Aduanas',
  'Analista de Comercio Exterior',
  'Importador / Consignatario',
  'Auditor de Cumplimiento',
] as const;

export interface SettingsProfileTabProps {
  draft: UserProfileSettings;
  onChange: (patch: Partial<UserProfileSettings>) => void;
}

export function SettingsProfileTab({ draft, onChange }: SettingsProfileTabProps) {
  return (
    <div className="space-y-5">
      <div className="border-b border-border-hairline pb-4">
        <h3 className="text-sm font-semibold text-ink-primary">Identidad del operador aduanero</h3>
        <p className="mt-0.5 text-xs text-ink-muted">
          Estos datos identifican tu sesión de despacho y los dictámenes técnicos exportados.
        </p>
      </div>

      <div className="space-y-2.5 rounded-card border border-border-subtle bg-surface-muted p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="block text-xs font-semibold text-ink-primary">Apariencia y tema</span>
            <span className="text-[11px] text-ink-muted">
              Cambia entre paleta clara, oscura o sincronizada con tu sistema.
            </span>
          </div>
          <span className="font-mono text-[11px] text-accent-ink">
            {draft.themePreference === 'dark'
              ? 'Modo oscuro'
              : draft.themePreference === 'system'
                ? 'Automático'
                : 'Modo claro'}
          </span>
        </div>

        <div role="radiogroup" aria-label="Selector de tema" className="grid grid-cols-3 gap-2 rounded-field bg-surface-subtle p-1">
          {(
            [
              { id: 'light', label: 'Claro', hint: 'Fondo limpio', icon: Sun },
              { id: 'dark', label: 'Oscuro', hint: 'Nocturno', icon: Moon },
              { id: 'system', label: 'Sistema', hint: 'Según tu SO', icon: Monitor },
            ] as const
          ).map((opt) => {
            const active = draft.themePreference === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ themePreference: opt.id })}
                className={`flex cursor-pointer items-center gap-2 rounded-field px-3 py-2 text-left transition-colors ${
                  active ? 'bg-surface-panel text-ink-primary shadow-xs' : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className="truncate text-[10px] text-ink-muted">{opt.hint}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="block text-xs font-medium text-ink-secondary">Nombre completo</span>
          <input
            type="text"
            value={draft.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-medium text-ink-secondary">Correo operativo</span>
          <input
            type="email"
            value={draft.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-medium text-ink-secondary">Rol aduanero</span>
          <select
            value={draft.role}
            onChange={(e) => onChange({ role: e.target.value })}
            className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role} className="bg-surface-panel text-ink-primary">
                {role}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-medium text-ink-secondary">Agencia / Empresa</span>
          <input
            type="text"
            value={draft.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="block text-xs font-medium text-ink-secondary">Patente o Registro Aduanal</span>
          <input
            type="text"
            value={draft.brokerLicense}
            onChange={(e) => onChange({ brokerLicense: e.target.value })}
            placeholder="Ej. Patente SENIAT #4821"
            className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 font-mono text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          />
        </label>

        <BrokerSignaturePad
          value={draft.brokerSignatureDataUrl}
          onChange={(dataUrl) => onChange({ brokerSignatureDataUrl: dataUrl })}
          signerName={draft.fullName}
          brokerLicense={draft.brokerLicense}
        />
      </div>
    </div>
  );
}
