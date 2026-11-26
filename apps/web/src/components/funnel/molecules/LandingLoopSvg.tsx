'use client';

import type { RefObject } from 'react';

export interface LoopStage {
  readonly id: string;
  readonly labelTop: string;
  readonly labelBottom: string;
  readonly x: number;
  readonly y: number;
  readonly dotX: number;
  readonly dotY: number;
  readonly peak: number;
  readonly align: 'start' | 'end';
}

export const FIGURE_EIGHT_PATH =
  'M 600 180 ' +
  'C 645 92, 710 55, 765 55 ' +
  'C 835 55, 890 110, 890 180 ' +
  'C 890 250, 835 305, 765 305 ' +
  'C 710 305, 645 268, 600 180 ' +
  'C 555 92, 490 55, 435 55 ' +
  'C 365 55, 310 110, 310 180 ' +
  'C 310 250, 365 305, 435 305 ' +
  'C 490 305, 555 268, 600 180 Z';

export const LOOP_STAGES: readonly LoopStage[] = [
  {
    id: 'expediente',
    labelTop: 'INGESTA',
    labelBottom: 'EXPEDIENTE',
    x: 342,
    y: 174,
    dotX: 310,
    dotY: 180,
    peak: 0.75,
    align: 'start',
  },
  {
    id: 'hitl',
    labelTop: 'VALIDA',
    labelBottom: 'FICHA HITL',
    x: 560,
    y: 174,
    dotX: 590,
    dotY: 180,
    peak: 0.0,
    align: 'end',
  },
  {
    id: 'rgi',
    labelTop: 'APLICA',
    labelBottom: 'MOTOR RGI',
    x: 640,
    y: 174,
    dotX: 610,
    dotY: 180,
    peak: 0.5,
    align: 'start',
  },
  {
    id: 'dictamen',
    labelTop: 'EMITE',
    labelBottom: 'DICTAMEN PDF',
    x: 858,
    y: 174,
    dotX: 890,
    dotY: 180,
    peak: 0.25,
    align: 'end',
  },
] as const;

export interface LandingLoopSvgProps {
  pathRef: RefObject<SVGPathElement | null>;
  trailRef: RefObject<SVGPathElement | null>;
  glowRef: RefObject<SVGCircleElement | null>;
  dotRef: RefObject<SVGCircleElement | null>;
  activeStageIndex: number;
  onJumpToStage: (idx: number) => void;
}

export function LandingLoopSvg({
  pathRef,
  trailRef,
  glowRef,
  dotRef,
  activeStageIndex,
  onJumpToStage,
}: LandingLoopSvgProps) {
  return (
    <svg
      viewBox="0 0 1200 360"
      role="img"
      aria-label="Ciclo continuo de TariffOS: Ingesta de expediente, Validación HITL, Motor RGI y Dictamen PDF"
      className="relative z-10 w-full h-auto overflow-visible"
    >
      <defs>
        <linearGradient id="tariffos-comet" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent-brand)" stopOpacity="0" />
          <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--accent-brand)" stopOpacity="1" />
        </linearGradient>
        <radialGradient id="tariffos-dot-glow">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.65" />
          <stop offset="55%" stopColor="var(--accent-brand)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent-brand)" stopOpacity="0" />
        </radialGradient>
        <filter id="tariffos-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <text
        x="108"
        y="274"
        textAnchor="middle"
        className="fill-white/90 dark:fill-white/[0.11] font-sans font-semibold tracking-[-0.04em]"
        style={{ fontSize: '285px' }}
        aria-hidden="true"
      >
        T
      </text>
      <text
        x="1092"
        y="274"
        textAnchor="middle"
        className="fill-white/90 dark:fill-white/[0.11] font-sans font-semibold tracking-[-0.04em]"
        style={{ fontSize: '285px' }}
        aria-hidden="true"
      >
        S
      </text>

      <path
        d={FIGURE_EIGHT_PATH}
        fill="none"
        className="stroke-black/[0.04] dark:stroke-black/30"
        strokeWidth="44"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0, 6)"
      />

      <path
        ref={pathRef}
        d={FIGURE_EIGHT_PATH}
        fill="none"
        className="stroke-white/95 dark:stroke-white/[0.14]"
        strokeWidth="36"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={FIGURE_EIGHT_PATH}
        fill="none"
        className="stroke-black/[0.05] dark:stroke-white/[0.10]"
        strokeWidth="1"
      />

      <path
        ref={trailRef}
        d={FIGURE_EIGHT_PATH}
        fill="none"
        stroke="url(#tariffos-comet)"
        strokeWidth="4.5"
        strokeLinecap="round"
        filter="url(#tariffos-blur)"
      />

      <circle
        ref={glowRef}
        cx="600"
        cy="180"
        r="46"
        fill="url(#tariffos-dot-glow)"
        aria-hidden="true"
      />

      <circle
        ref={dotRef}
        cx="600"
        cy="180"
        r="5.5"
        className="fill-ink-primary"
        aria-hidden="true"
      />

      <circle
        cx="600"
        cy="180"
        r="6"
        className="fill-ink-primary/80"
        aria-hidden="true"
      />

      {LOOP_STAGES.map((stage, idx) => {
        const isActive = idx === activeStageIndex;
        return (
          <g
            key={stage.id}
            onClick={() => onJumpToStage(idx)}
            className="cursor-pointer"
          >
            <circle
              cx={stage.dotX}
              cy={stage.dotY}
              r={isActive ? 4 : 2.5}
              className={
                isActive
                  ? 'fill-accent-brand transition-all duration-200'
                  : 'fill-ink-muted/60 transition-all duration-200'
              }
            />
            <text
              x={stage.x}
              y={stage.y}
              textAnchor={stage.align}
              className={`font-mono text-[12px] tracking-[0.05em] transition-opacity duration-200 ${
                isActive
                  ? 'fill-ink-primary font-semibold opacity-100'
                  : 'fill-ink-secondary opacity-50 hover:opacity-80'
              }`}
            >
              <tspan x={stage.x} dy="0">
                {stage.labelTop}
              </tspan>
              <tspan x={stage.x} dy="15">
                {stage.labelBottom}
              </tspan>
            </text>
          </g>
        );
      })}
    </svg>
  );
}
