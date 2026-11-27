'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminLlmProvider, AdminLlmSettingsPayload } from '@tariffos/shared-types';
import { LlmProviderFields } from '@/components/admin/molecules/LlmProviderFields';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { adminFetchJson } from '@/lib/admin/admin-fetch';

interface ProbeState {
  ok: boolean;
  latencyMs: number;
  message: string;
}

export function LlmSettingsPanel() {
  const [data, setData] = useState<AdminLlmSettingsPayload | null>(null);
  const [provider, setProvider] = useState<AdminLlmProvider>('nvidia');
  const [model, setModel] = useState('');
  const [deepModel, setDeepModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [maxRpm, setMaxRpm] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'test' | 'save' | 'reset' | null>(null);
  const [probe, setProbe] = useState<ProbeState | null>(null);
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const hydrate = (payload: AdminLlmSettingsPayload) => {
    setData(payload);
    setProvider(payload.active.provider);
    setModel(payload.active.model);
    setDeepModel(payload.active.deepModel ?? '');
    setBaseUrl(payload.active.baseUrl ?? '');
    setMaxRpm(payload.active.maxRpm ? String(payload.active.maxRpm) : '');
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      hydrate(await adminFetchJson<AdminLlmSettingsPayload>('/api/admin/settings/llm'));
    } catch (err) {
      setFeedback({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Solo super_admin puede gestionar el modelo LLM.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleProviderChange = (next: AdminLlmProvider) => {
    setProvider(next);
    setProbe(null);
    const presets = data?.presets[next] ?? [];
    const std = presets.find((p) => p.tier === 'standard') ?? presets[0];
    const deep = presets.find((p) => p.tier === 'deep');
    if (std) setModel(std.id);
    if (deep) setDeepModel(deep.id);
  };

  const handleTest = async () => {
    setBusy('test');
    setProbe(null);
    try {
      const json = await adminFetchJson<{ ok?: boolean; latencyMs?: number; error?: string }>(
        '/api/admin/settings/llm/test',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, model: model.trim(), baseUrl: baseUrl.trim() || undefined }),
        },
      );
      setProbe({
        ok: Boolean(json.ok),
        latencyMs: json.latencyMs ?? 0,
        message: json.ok
          ? `Conexión y salida JSON verificadas en ${json.latencyMs ?? 0} ms.`
          : json.error ?? 'El modelo no respondió con JSON válido.',
      });
    } catch (err) {
      setProbe({
        ok: false,
        latencyMs: 0,
        message: err instanceof Error ? err.message : 'No se pudo probar el modelo.',
      });
    } finally {
      setBusy(null);
    }
  };

  const handleSave = async () => {
    setBusy('save');
    setFeedback(null);
    try {
      const parsedRpm = maxRpm.trim() ? Number.parseInt(maxRpm.trim(), 10) : undefined;
      const json = await adminFetchJson<AdminLlmSettingsPayload>('/api/admin/settings/llm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model: model.trim(),
          deepModel: deepModel.trim() || undefined,
          baseUrl: baseUrl.trim() || undefined,
          maxRpm: Number.isFinite(parsedRpm) ? parsedRpm : undefined,
          reason: reason.trim() || undefined,
        }),
      });
      hydrate(json);
      setReason('');
      setFeedback({ tone: 'ok', text: `Modelo activo actualizado a ${json.active.provider}/${json.active.model}.` });
    } catch (err) {
      setFeedback({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Error al guardar configuración.',
      });
    } finally {
      setBusy(null);
    }
  };

  const handleReset = async () => {
    setBusy('reset');
    setFeedback(null);
    try {
      hydrate(
        await adminFetchJson<AdminLlmSettingsPayload>('/api/admin/settings/llm', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reset: true, reason: reason.trim() || undefined }),
        }),
      );
      setFeedback({ tone: 'ok', text: 'Configuración restablecida a variables de entorno.' });
    } catch (err) {
      setFeedback({
        tone: 'error',
        text: err instanceof Error ? err.message : 'No se pudo restablecer configuración.',
      });
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <FunnelCard padding="p-5"><p className="text-xs text-ink-muted">Cargando configuración de modelos...</p></FunnelCard>;
  }
  if (!data) {
    return <FunnelCard padding="p-5"><p className="text-xs text-rose-500">{feedback?.text ?? 'No disponible.'}</p></FunnelCard>;
  }

  const selectedProviderMeta = data.providers.find((p) => p.provider === provider);

  return (
    <FunnelCard padding="p-5" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-ink-primary">Modelo de Trabajo (Razonamiento RGI)</h2>
          <p className="text-xs text-ink-muted">
            Origen: <strong className="text-ink-primary">{data.source === 'database' ? 'Override Admin (DB)' : 'Variables de entorno'}</strong>
            {' · '}Embeddings bloqueados en <code className="font-mono">{data.embeddingLock.model}</code> ({data.embeddingLock.dims}d).
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${data.active.canRunLive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
          {data.active.canRunLive ? 'Live listo' : 'Sin credencial activa'}
        </span>
      </div>

      <LlmProviderFields
        provider={provider}
        providers={data.providers}
        presets={data.presets[provider] ?? []}
        model={model}
        deepModel={deepModel}
        baseUrl={baseUrl}
        maxRpm={maxRpm}
        onProviderChange={handleProviderChange}
        onModelChange={setModel}
        onDeepModelChange={setDeepModel}
        onBaseUrlChange={setBaseUrl}
        onMaxRpmChange={setMaxRpm}
      />

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <input aria-label="Motivo del cambio" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo auditable (opcional)" className="flex-1 min-w-[200px] rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary" />
        <button type="button" onClick={handleTest} disabled={busy !== null || !model.trim()} className="px-3 py-2 rounded-lg border border-border-strong bg-surface-subtle hover:bg-surface-hover font-semibold text-ink-primary disabled:opacity-50">
          {busy === 'test' ? 'Probando...' : 'Probar modelo'}
        </button>
        <button type="button" onClick={handleSave} disabled={busy !== null || !model.trim() || !selectedProviderMeta?.configured} className="px-3.5 py-2 rounded-lg bg-accent-solid text-white font-semibold disabled:opacity-50">
          {busy === 'save' ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {data.source === 'database' && (
          <button type="button" onClick={handleReset} disabled={busy !== null} className="px-3 py-2 rounded-lg border border-border-subtle text-ink-muted hover:text-ink-primary disabled:opacity-50">
            Restablecer a env
          </button>
        )}
      </div>

      {probe && (
        <div className={`rounded-lg px-3 py-2 text-xs ${probe.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
          {probe.message}
        </div>
      )}
      {feedback && (
        <div className={`rounded-lg px-3 py-2 text-xs ${feedback.tone === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {feedback.text}
        </div>
      )}
    </FunnelCard>
  );
}
