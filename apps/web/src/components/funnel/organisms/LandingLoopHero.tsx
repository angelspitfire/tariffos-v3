'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { LOOP_STAGES, LandingLoopSvg } from '../molecules/LandingLoopSvg';

function circularDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 1;
  return Math.min(diff, 1 - diff);
}

export function LandingLoopHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  const prefersReducedMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState<boolean>(() => Boolean(prefersReducedMotion));
  const [activeStageIndex, setActiveStageIndex] = useState<number>(1);

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const progressRef = useRef(0.12);

  useEffect(() => {
    const container = containerRef.current;
    const pathEl = pathRef.current;
    if (
      !container ||
      !pathEl ||
      typeof pathEl.getTotalLength !== 'function' ||
      typeof pathEl.getPointAtLength !== 'function'
    ) {
      return;
    }

    const totalLen = pathEl.getTotalLength();
    if (!Number.isFinite(totalLen) || totalLen <= 0) return;
    const trailLen = totalLen * 0.16;

    let isVisible = true;
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              if (entry) isVisible = entry.isIntersecting;
            },
            { threshold: 0.05 },
          )
        : null;
    io?.observe(container);

    const paintAt = (t: number) => {
      const len = (t % 1) * totalLen;
      const pt = pathEl.getPointAtLength(len);

      if (dotRef.current) {
        dotRef.current.setAttribute('cx', pt.x.toFixed(2));
        dotRef.current.setAttribute('cy', pt.y.toFixed(2));
      }
      if (glowRef.current) {
        glowRef.current.setAttribute('cx', pt.x.toFixed(2));
        glowRef.current.setAttribute('cy', pt.y.toFixed(2));
      }
      if (trailRef.current) {
        trailRef.current.setAttribute('stroke-dasharray', `${trailLen} ${totalLen}`);
        trailRef.current.setAttribute('stroke-dashoffset', `${-(len - trailLen)}`);
      }

      let bestIdx = 0;
      let bestDist = 1;
      for (let i = 0; i < LOOP_STAGES.length; i++) {
        const stage = LOOP_STAGES[i];
        if (!stage) continue;
        const d = circularDistance(t, stage.peak);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      setActiveStageIndex((prev) => (prev === bestIdx ? prev : bestIdx));
    };

    paintAt(progressRef.current);

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!isVisible || isPausedRef.current) return;
      progressRef.current = (progressRef.current + dt * 0.085) % 1;
      paintAt(progressRef.current);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      io?.disconnect();
    };
  }, []);

  const jumpToStage = (idx: number) => {
    setIsPaused(true);
    setActiveStageIndex(idx);
    const stage = LOOP_STAGES[idx];
    if (!stage) return;
    progressRef.current = stage.peak;
    const pathEl = pathRef.current;
    if (
      !pathEl ||
      typeof pathEl.getTotalLength !== 'function' ||
      typeof pathEl.getPointAtLength !== 'function'
    ) {
      return;
    }
    const totalLen = pathEl.getTotalLength();
    const trailLen = totalLen * 0.16;
    const len = stage.peak * totalLen;
    const pt = pathEl.getPointAtLength(len);
    dotRef.current?.setAttribute('cx', pt.x.toFixed(2));
    dotRef.current?.setAttribute('cy', pt.y.toFixed(2));
    glowRef.current?.setAttribute('cx', pt.x.toFixed(2));
    glowRef.current?.setAttribute('cy', pt.y.toFixed(2));
    if (trailRef.current) {
      trailRef.current.setAttribute('stroke-dasharray', `${trailLen} ${totalLen}`);
      trailRef.current.setAttribute('stroke-dashoffset', `${-(len - trailLen)}`);
    }
  };

  return (
    <div
      ref={containerRef}
      data-loop=""
      className="relative w-full max-w-[1380px] mx-auto select-none pt-2 pb-4"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-[68%] h-[72%] rounded-full blur-3xl opacity-55 dark:opacity-35 bg-[radial-gradient(ellipse_at_40%_45%,rgba(56,189,248,0.28),transparent_60%),radial-gradient(ellipse_at_62%_55%,rgba(37,99,235,0.28),transparent_60%)]"
      />

      <LandingLoopSvg
        pathRef={pathRef}
        trailRef={trailRef}
        glowRef={glowRef}
        dotRef={dotRef}
        activeStageIndex={activeStageIndex}
        onJumpToStage={jumpToStage}
      />

      <div className="flex justify-center mt-2">
        <button
          type="button"
          data-loop-toggle=""
          onClick={() => setIsPaused((prev) => !prev)}
          aria-label={isPaused ? 'Reanudar ciclo animado' : 'Pausar ciclo animado'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono text-ink-muted hover:text-ink-primary bg-white/55 dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-sm transition-colors cursor-pointer"
        >
          {isPaused ? (
            <>
              <Play className="w-3 h-3" aria-hidden="true" />
              <span>Reanudar ciclo</span>
            </>
          ) : (
            <>
              <Pause className="w-3 h-3" aria-hidden="true" />
              <span>Pausar ciclo</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
