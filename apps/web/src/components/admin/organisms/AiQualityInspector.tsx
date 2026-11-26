'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  AdminAiQualityArtifactSummary,
  AdminAiQualityModelStat,
} from '@tariffos/shared-types';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { AiQualitySummaryCards } from '@/components/admin/molecules/AiQualitySummaryCards';
import { DecisionArtifactDrawer } from './DecisionArtifactDrawer';

export function AiQualityInspector() {
  const [artifacts, setArtifacts] = useState<AdminAiQualityArtifactSummary[]>([]);
  const [modelStats, setModelStats] = useState<AdminAiQualityModelStat[]>([]);
  const [queryFilter, setQueryFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [maxConfidence, setMaxConfidence] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (queryFilter.trim()) params.set('q', queryFilter.trim());
      if (modelFilter.trim()) params.set('model', modelFilter.trim());
      if (maxConfidence.trim()) params.set('maxConfidence', maxConfidence.trim());
      const res = await fetch(`/api/admin/ai-quality?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as {
          artifacts?: AdminAiQualityArtifactSummary[];
          modelStats?: AdminAiQualityModelStat[];
        };
        setArtifacts(json.artifacts ?? []);
        setModelStats(json.modelStats ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [queryFilter, modelFilter, maxConfidence]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-ink-primary">Calidad IA — Inspector de DecisionArtifact</h1>
        <p className="text-xs text-ink-muted">
          Compara confianza, verificación oficial y sustento RGI por modelo para auditar cambios de LLM.
        </p>
      </div>

      <AiQualitySummaryCards stats={modelStats} />

      <div className="flex flex-wrap gap-2 text-xs">
        <input
          aria-label="Buscar por HS, mercancía o tenant"
          value={queryFilter}
          onChange={(e) => setQueryFilter(e.target.value)}
          placeholder="Buscar por HS, producto o tenant..."
          className="flex-1 min-w-[200px] rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
        />
        <input
          aria-label="Filtrar por modelo"
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
          placeholder="Modelo (ej. gemini, nemotron)"
          className="w-52 rounded-lg border border-border-strong bg-surface-input px-3 py-2 font-mono text-ink-primary"
        />
        <select
          aria-label="Filtrar por confianza máxima"
          value={maxConfidence}
          onChange={(e) => setMaxConfidence(e.target.value)}
          className="rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
        >
          <option value="">Toda confianza</option>
          <option value="84">Solo &lt; 85% (Revisión)</option>
          <option value="69">Solo &lt; 70% (Baja)</option>
        </select>
      </div>

      <FunnelCard padding="p-0" className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-xs text-ink-muted">Cargando artefactos de decisión...</div>
        ) : artifacts.length === 0 ? (
          <div className="p-6 text-xs text-ink-muted text-center">
            No se encontraron clasificaciones con los filtros seleccionados.
          </div>
        ) : (
          <div className="divide-y divide-border-hairline text-xs">
            {artifacts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="w-full text-left p-3.5 hover:bg-surface-hover transition-colors flex flex-wrap items-center justify-between gap-2"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-accent-ink">{item.hsCode}</span>
                    <span className="font-semibold text-ink-primary truncate max-w-md">{item.query}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${item.verifiedAgainstDb ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                      {item.verifiedAgainstDb ? 'Verificado' : 'Sin verificar'}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-muted flex flex-wrap gap-2">
                    <span>{item.tenantName}</span>
                    <span>·</span>
                    <span className="font-mono">{item.provider}/{item.modelUsed}</span>
                    {item.flagCount > 0 && <span>· {item.flagCount} flags</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-ink-primary">{item.confidencePct}%</div>
                  <div className="text-[10px] text-ink-subtle">
                    {new Date(item.createdAt).toLocaleString('es-VE')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </FunnelCard>

      <DecisionArtifactDrawer artifactId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
