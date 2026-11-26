'use client';

import { useEffect, useState } from 'react';
import type { AdminAiQualityArtifactDetail } from '@tariffos/shared-types';
import { X } from 'lucide-react';

interface RgiStepLike {
  rule?: string;
  note?: string;
  conclusion?: string;
  items?: string[];
}

interface FlagLike {
  type?: string;
  title?: string;
  text?: string;
}

export function DecisionArtifactDrawer({
  artifactId,
  onClose,
}: {
  artifactId: string | null;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<AdminAiQualityArtifactDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (!artifactId) {
      setDetail(null);
      return;
    }
    let active = true;
    setLoading(true);
    setShowRaw(false);
    fetch(`/api/admin/ai-quality/${artifactId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { artifact?: AdminAiQualityArtifactDetail } | null) => {
        if (active) setDetail(json?.artifact ?? null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [artifactId]);

  if (!artifactId) return null;

  const rgiSteps = Array.isArray(detail?.sustento?.rgiSteps)
    ? (detail.sustento.rgiSteps as RgiStepLike[])
    : [];
  const flags = Array.isArray(detail?.sustento?.flags)
    ? (detail.sustento.flags as FlagLike[])
    : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" role="dialog" aria-label="Detalle de DecisionArtifact">
      <div className="w-full max-w-xl bg-surface-card border-l border-border-strong h-full overflow-y-auto p-5 space-y-4">
        <div className="flex items-start justify-between gap-2 border-b border-border-hairline pb-3">
          <div>
            <h2 className="text-sm font-bold text-ink-primary">Inspector de DecisionArtifact</h2>
            <p className="text-[11px] font-mono text-ink-muted">{artifactId}</p>
          </div>
          <button
            type="button"
            aria-label="Cerrar inspector"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-ink-muted">Cargando detalle del artefacto...</p>
        ) : !detail ? (
          <p className="text-xs text-rose-400">No se encontró el artefacto solicitado.</p>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="rounded-lg border border-border-hairline bg-surface-subtle p-3 space-y-1">
              <div className="font-semibold text-ink-primary">{detail.query}</div>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-ink-muted">
                <span>HS: <strong className="text-accent-ink">{detail.hsCode}</strong></span>
                <span>Confianza: <strong>{detail.confidencePct}% ({detail.confidenceLevel})</strong></span>
                <span>Modelo: <strong>{detail.provider}/{detail.modelUsed}</strong></span>
                <span>Tenant: <strong>{detail.tenantName}</strong></span>
              </div>
              {detail.officialDescription && (
                <p className="text-[11px] text-ink-secondary pt-1">{detail.officialDescription}</p>
              )}
            </div>

            {flags.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-semibold text-ink-secondary">Alertas y Flags ({flags.length})</div>
                {flags.map((flag, idx) => (
                  <div key={idx} className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px]">
                    <div className="font-semibold text-amber-300">{flag.title ?? flag.type ?? 'Aviso'}</div>
                    {flag.text && <div className="text-ink-secondary">{flag.text}</div>}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="font-semibold text-ink-secondary">Recorrido RGI ({rgiSteps.length})</div>
              {rgiSteps.length === 0 ? (
                <p className="text-[11px] text-ink-muted">Sin pasos RGI registrados en sustento.</p>
              ) : (
                rgiSteps.map((step, idx) => (
                  <div key={idx} className="rounded-lg border border-border-hairline p-2.5 space-y-1">
                    <div className="font-mono font-bold text-accent-ink">
                      {step.rule ?? `Paso ${idx + 1}`} {step.note ? `· ${step.note}` : ''}
                    </div>
                    {step.conclusion && <div className="text-ink-primary">{step.conclusion}</div>}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-border-hairline space-y-2">
              <button
                type="button"
                onClick={() => setShowRaw((v) => !v)}
                className="text-[11px] font-semibold text-accent-ink hover:underline"
              >
                {showRaw ? 'Ocultar JSON técnico' : 'Ver JSON técnico completo'}
              </button>
              {showRaw && (
                <pre className="rounded-lg bg-surface-subtle p-3 text-[10px] font-mono overflow-x-auto text-ink-secondary">
                  {JSON.stringify(
                    {
                      modelMetadata: detail.modelMetadata,
                      retrievalTrace: detail.retrievalTrace,
                      rerankingScores: detail.rerankingScores,
                      finalDecision: detail.finalDecision,
                    },
                    null,
                    2,
                  )}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
