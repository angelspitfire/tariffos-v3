'use client';

import type { ApprovalWorkflowMode, IncotermCode, JurisdictionConfig, UserProfileSettings } from '@tariffos/shared-types';

export interface SettingsPreferencesTabProps {
  draft: UserProfileSettings;
  jurisdictions: readonly JurisdictionConfig[];
  onChange: (patch: Partial<UserProfileSettings>) => void;
}

export function SettingsPreferencesTab({
  draft,
  jurisdictions,
  onChange,
}: SettingsPreferencesTabProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-ink-primary">Parámetros predeterminados de análisis</h3>
        <p className="mt-0.5 text-xs text-ink-muted">
          Controla la legislación base, profundidad de dictámenes y comportamiento del espacio de trabajo.
        </p>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className="space-y-1 sm:col-span-2">
          <span className="block text-xs font-medium text-ink-secondary">Legislación aduanera predeterminada</span>
          <select
            value={draft.defaultJurisdictionId}
            onChange={(e) => onChange({ defaultJurisdictionId: e.target.value })}
            className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 text-xs text-ink-primary"
          >
            {jurisdictions.map((jur) => (
              <option key={jur.id} value={jur.id}>
                {jur.country} ({jur.authority}, {jur.nomenclature})
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="block text-xs font-medium text-ink-secondary">Incoterm base de valoración</span>
          <select
            value={draft.defaultIncoterm}
            onChange={(e) => onChange({ defaultIncoterm: e.target.value as IncotermCode })}
            className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 text-xs text-ink-primary"
          >
            <option value="FOB">FOB (Free On Board)</option>
            <option value="CIF">CIF (Cost, Insurance & Freight)</option>
            <option value="EXW">EXW (Ex Works)</option>
            <option value="DDP">DDP (Delivered Duty Paid)</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="block text-xs font-medium text-ink-secondary">Moneda de referencia</span>
          <select
            value={draft.preferredCurrency}
            onChange={(e) => onChange({ preferredCurrency: e.target.value as 'USD' | 'EUR' })}
            className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 text-xs text-ink-primary"
          >
            <option value="USD">USD (Dólar estadounidense)</option>
            <option value="EUR">EUR (Euro)</option>
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <span className="block text-xs font-medium text-ink-secondary">Nivel de detalle en dictámenes y RGI</span>
        <div className="grid grid-cols-3 gap-2 rounded-card bg-surface-subtle p-1">
          {(
            [
              { id: 'concise', label: 'Conciso', hint: 'Resumen directo' },
              { id: 'standard', label: 'Estándar', hint: 'RGI y notas clave' },
              { id: 'exhaustive', label: 'Exhaustivo', hint: 'Justificación completa' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ detailLevel: opt.id })}
              className={`cursor-pointer rounded-field px-3 py-2 text-left transition-colors ${
                draft.detailLevel === opt.id
                  ? 'bg-surface-panel text-ink-primary shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <div className="text-xs font-semibold">{opt.label}</div>
              <div className="truncate text-[11px] text-ink-muted">{opt.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-xs font-medium text-ink-secondary">Política de sellado de dictámenes</span>
        <div className="grid gap-2 sm:grid-cols-3">
          {(
            [
              { id: 'agent_decides', label: 'Agente decide', hint: 'Pausa si falta certeza' },
              { id: 'direct_seal', label: 'Sellado directo', hint: 'Sin pausa previa' },
              { id: 'always_review', label: 'Revisión siempre', hint: 'Pide firma humana' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ approvalWorkflowMode: opt.id as ApprovalWorkflowMode })}
              className={`cursor-pointer rounded-card border p-2.5 text-left transition-colors ${
                draft.approvalWorkflowMode === opt.id
                  ? 'border-accent-brand bg-accent-soft/45 text-ink-primary'
                  : 'border-border-subtle bg-surface-panel text-ink-secondary hover:bg-surface-hover'
              }`}
            >
              <div className="text-xs font-semibold">{opt.label}</div>
              <div className="mt-0.5 text-[11px] text-ink-muted">{opt.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {(
          [
            {
              key: 'autoOpenCanvas',
              label: 'Abrir Canvas automáticamente al generar dictámenes o lotes',
              checked: draft.autoOpenCanvas,
            },
            {
              key: 'predictiveSearchEnabled',
              label: 'Búsqueda predictiva de precedentes SKU al escribir',
              checked: draft.predictiveSearchEnabled !== false,
            },
            {
              key: 'webEnrichmentEnabled',
              label: 'Verificar especificaciones técnicas con ficha web',
              checked: draft.webEnrichmentEnabled !== false,
            },
          ] as const
        ).map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-center justify-between rounded-field border border-border-subtle bg-surface-muted px-3 py-2 text-xs"
          >
            <span className="font-medium text-ink-primary">{item.label}</span>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => onChange({ [item.key]: e.target.checked })}
              className="h-4 w-4 accent-accent-brand"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
