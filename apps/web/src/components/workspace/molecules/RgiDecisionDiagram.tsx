'use client';

import { GitBranch } from 'lucide-react';
import type { A2UIRgiPathStep } from '@tariffos/shared-types';

export interface RgiDecisionDiagramProps {
  hsCode: string;
  confidencePct?: number;
  rgiSteps: readonly A2UIRgiPathStep[];
  flagsCount?: number;
  unresolvedCount?: number;
  onOpenRgi?: () => void;
}

function truncateLabel(text: string, maxLen: number): string {
  const clean = text.trim();
  return clean.length > maxLen ? `${clean.slice(0, maxLen - 1)}…` : clean;
}

export function RgiDecisionDiagram({
  hsCode,
  confidencePct,
  rgiSteps,
  flagsCount = 0,
  unresolvedCount = 0,
  onOpenRgi,
}: RgiDecisionDiagramProps) {
  if (rgiSteps.length === 0) return null;

  const visibleSteps = rgiSteps.slice(0, 3);
  const showFlagsNode = flagsCount > 0 || unresolvedCount > 0;
  const nodeWidth = 164;
  const gap = 36;
  const finalWidth = 172;
  const flagsWidth = 136;

  const stepSlots = visibleSteps.map((step, idx) => ({
    step,
    x: 10 + idx * (nodeWidth + gap),
  }));
  const finalX = 10 + visibleSteps.length * (nodeWidth + gap);
  const flagsX = finalX + finalWidth + gap;
  const viewWidth = showFlagsNode ? flagsX + flagsWidth + 10 : finalX + finalWidth + 10;

  return (
    <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
          <GitBranch className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
          Diagrama de decisión RGI
        </h3>
        {onOpenRgi ? (
          <button
            type="button"
            onClick={onOpenRgi}
            className="no-print cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap text-accent-ink transition-colors hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            Ver comparador completo
          </button>
        ) : null}
      </div>

      <div className="mt-2">
        <svg
          viewBox={`0 0 ${viewWidth} 96`}
          className="block h-auto w-full"
          role="img"
          aria-label={`Diagrama de decisión RGI de ${hsCode}`}
        >
          {stepSlots.map(({ step, x }) => (
            <g key={`${step.rule}-${x}`}>
              <rect
                x={x}
                y={12}
                width={nodeWidth}
                height={68}
                rx={10}
                className="fill-surface-muted stroke-border-strong"
                strokeWidth={1.5}
              />
              <text
                x={x + nodeWidth / 2}
                y={38}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                className="fill-ink-primary"
              >
                {truncateLabel(step.rule, 20)}
              </text>
              <text
                x={x + nodeWidth / 2}
                y={58}
                textAnchor="middle"
                fontSize={10.5}
                className="fill-ink-secondary"
              >
                {truncateLabel(step.conclusion ?? step.application, 24)}
              </text>
              <line
                x1={x + nodeWidth}
                y1={46}
                x2={x + nodeWidth + gap - 8}
                y2={46}
                className="stroke-ink-muted"
                strokeWidth={1.5}
              />
              <polygon
                points={`${x + nodeWidth + gap - 8},41 ${x + nodeWidth + gap},46 ${x + nodeWidth + gap - 8},51`}
                className="fill-ink-muted"
              />
            </g>
          ))}

          <g>
            <rect
              x={finalX}
              y={10}
              width={finalWidth}
              height={72}
              rx={10}
              className="fill-emerald-500/12 stroke-emerald-600 dark:stroke-emerald-400"
              strokeWidth={1.75}
            />
            <text
              x={finalX + finalWidth / 2}
              y={40}
              textAnchor="middle"
              fontSize={12.5}
              fontWeight={700}
              className="fill-emerald-800 dark:fill-emerald-200 font-mono"
            >
              {hsCode}
            </text>
            <text
              x={finalX + finalWidth / 2}
              y={60}
              textAnchor="middle"
              fontSize={10.5}
              className="fill-emerald-700 dark:fill-emerald-300"
            >
              {confidencePct !== undefined ? `Confianza ${confidencePct}%` : 'Partida final'}
            </text>
          </g>

          {showFlagsNode ? (
            <g>
              <line
                x1={finalX + finalWidth}
                y1={46}
                x2={flagsX - 8}
                y2={46}
                className="stroke-ink-muted"
                strokeWidth={1.5}
              />
              <polygon
                points={`${flagsX - 8},41 ${flagsX},46 ${flagsX - 8},51`}
                className="fill-ink-muted"
              />
              <rect
                x={flagsX}
                y={10}
                width={flagsWidth}
                height={72}
                rx={10}
                className="fill-amber-500/12 stroke-amber-600 dark:stroke-amber-400"
                strokeWidth={1.75}
              />
              <text
                x={flagsX + flagsWidth / 2}
                y={40}
                textAnchor="middle"
                fontSize={11.5}
                fontWeight={700}
                className="fill-amber-900 dark:fill-amber-200"
              >
                Flags y Alcance
              </text>
              <text
                x={flagsX + flagsWidth / 2}
                y={59}
                textAnchor="middle"
                fontSize={10}
                className="fill-amber-800 dark:fill-amber-300"
              >
                {flagsCount} alertas, {unresolvedCount} pend.
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </section>
  );
}
