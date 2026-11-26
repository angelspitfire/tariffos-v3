'use client';

import type {
  AdminLlmPreset,
  AdminLlmProvider,
  AdminLlmProviderStatus,
} from '@tariffos/shared-types';

interface LlmProviderFieldsProps {
  provider: AdminLlmProvider;
  providers: AdminLlmProviderStatus[];
  presets: AdminLlmPreset[];
  model: string;
  deepModel: string;
  baseUrl: string;
  maxRpm: string;
  onProviderChange: (next: AdminLlmProvider) => void;
  onModelChange: (next: string) => void;
  onDeepModelChange: (next: string) => void;
  onBaseUrlChange: (next: string) => void;
  onMaxRpmChange: (next: string) => void;
}

export function LlmProviderFields({
  provider,
  providers,
  presets,
  model,
  deepModel,
  baseUrl,
  maxRpm,
  onProviderChange,
  onModelChange,
  onDeepModelChange,
  onBaseUrlChange,
  onMaxRpmChange,
}: LlmProviderFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <label className="space-y-1">
          <span className="font-semibold text-ink-secondary">Proveedor</span>
          <select
            aria-label="Proveedor LLM"
            value={provider}
            onChange={(e) => onProviderChange(e.target.value as AdminLlmProvider)}
            className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
          >
            {providers.map((item) => (
              <option key={item.provider} value={item.provider}>
                {item.provider} —{' '}
                {item.configured ? `Lista (${item.envVar})` : `Sin configurar (${item.envVar})`}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="font-semibold text-ink-secondary">Límite RPM opcional</span>
          <input
            aria-label="Límite RPM"
            type="number"
            min={0}
            value={maxRpm}
            onChange={(e) => onMaxRpmChange(e.target.value)}
            placeholder="0 = sin throttling extra"
            className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
          />
        </label>

        <label className="space-y-1">
          <span className="font-semibold text-ink-secondary">Modelo estándar</span>
          <input
            aria-label="Modelo estándar"
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 font-mono text-ink-primary"
          />
        </label>

        <label className="space-y-1">
          <span className="font-semibold text-ink-secondary">Modelo Deep Mode (opcional)</span>
          <input
            aria-label="Modelo Deep Mode"
            value={deepModel}
            onChange={(e) => onDeepModelChange(e.target.value)}
            placeholder="Usa el estándar si se deja vacío"
            className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 font-mono text-ink-primary"
          />
        </label>
      </div>

      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                preset.tier === 'deep' ? onDeepModelChange(preset.id) : onModelChange(preset.id)
              }
              className="px-2.5 py-1 rounded-md border border-border-subtle bg-surface-subtle hover:bg-surface-hover text-[11px] text-ink-secondary"
              title={preset.note}
            >
              {preset.tier === 'deep' ? 'Deep: ' : ''}
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {provider === 'openai-compatible' && (
        <label className="block space-y-1 text-xs">
          <span className="font-semibold text-ink-secondary">Base URL compatible (/v1)</span>
          <input
            aria-label="Base URL"
            value={baseUrl}
            onChange={(e) => onBaseUrlChange(e.target.value)}
            placeholder="http://127.0.0.1:11434/v1"
            className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 font-mono text-ink-primary"
          />
        </label>
      )}
    </div>
  );
}
