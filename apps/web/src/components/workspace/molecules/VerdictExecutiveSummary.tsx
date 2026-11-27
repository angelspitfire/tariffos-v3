'use client';

import { useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, ChevronDown, Copy, ShieldAlert } from 'lucide-react';
import type { VerdictExecutivePoint } from '@tariffos/shared-types';

export interface VerdictExecutiveSummaryProps {
  hsCode: string;
  points: readonly VerdictExecutivePoint[];
}

export function VerdictExecutiveSummary({ hsCode, points }: VerdictExecutiveSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (points.length === 0) return null;

  const hasHigh = points.some((pt) => pt.severity === 'high');
  const hasMedium = points.some((pt) => pt.severity === 'medium');
  const overallLabel = hasHigh
    ? 'Riesgo alto detectado'
    : hasMedium
      ? 'Atención previa al despacho'
      : 'Control estándar';
  const overallTone = hasHigh
    ? 'text-[var(--color-error)]'
    : hasMedium
      ? 'text-amber-700 dark:text-amber-400'
      : 'text-[var(--color-success)]';
  const OverallIcon = hasHigh ? ShieldAlert : hasMedium ? AlertTriangle : CheckCircle2;

  const handleCopy = () => {
    const lines = [
      `RESUMEN EJECUTIVO (${hsCode} - ${overallLabel})`,
      ...points.map(
        (p, idx) => `${idx + 1}. ${p.title}\nRiesgo: ${p.risk}\nRecomendación: ${p.recommendation}`,
      ),
    ];
    void navigator.clipboard?.writeText(lines.join('\n'));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section
      aria-label="Resumen Ejecutivo de riesgos y recomendaciones"
      className="mt-3.5 space-y-2.5 border-t border-border-hairline pt-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="group flex cursor-pointer items-center gap-2 text-left focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none rounded-md"
        >
          <span className="text-xs font-semibold text-ink-primary transition-colors group-hover:text-accent-ink">
            Resumen ejecutivo ({points.length})
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${overallTone}`}>
            <OverallIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{overallLabel}</span>
          </span>
        </button>

        <div className="flex items-center gap-3 text-[11px] text-ink-muted">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex cursor-pointer items-center gap-1 font-medium text-accent-ink hover:underline focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none rounded-md"
          >
            <span>{expanded ? 'Ocultar detalle' : `Ver detalle (${points.length})`}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex cursor-pointer items-center gap-1 font-medium text-ink-secondary transition-colors hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none rounded-md"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-[var(--color-success)]" aria-hidden="true" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" aria-hidden="true" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {expanded ? (
        <ol className="divide-y divide-border-hairline">
          {points.map((pt, idx) => {
            const sevTone =
              pt.severity === 'high'
                ? 'text-[var(--color-error)]'
                : pt.severity === 'medium'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-[var(--color-success)]';
            const sevLabel =
              pt.severity === 'high' ? 'Riesgo alto' : pt.severity === 'medium' ? 'Atención' : 'Preventivo';
            return (
              <li key={pt.title} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                <span className="w-5 shrink-0 pt-0.5 font-mono text-[11px] font-semibold text-ink-subtle tabular-nums">
                  0{idx + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-ink-primary">{pt.title}</span>
                    <span className={`text-[11px] font-medium ${sevTone}`}>{sevLabel}</span>
                  </div>
                  <p className="leading-relaxed text-ink-secondary">
                    <span className="font-medium text-ink-primary">Riesgo: </span>
                    {pt.risk}
                  </p>
                  <p className="leading-relaxed text-ink-secondary">
                    <span className="font-medium text-accent-ink">Recomendación: </span>
                    {pt.recommendation}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}
