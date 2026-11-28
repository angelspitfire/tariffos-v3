'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SHOWCASE_CARDS } from '@/lib/funnel/showcase-data';

export function LandingShowcaseCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? SHOWCASE_CARDS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % SHOWCASE_CARDS.length);
  };

  return (
    <section id="capacidades" className="py-20 sm:py-28">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-[clamp(2rem,3vw+0.8rem,3.25rem)] font-medium tracking-[-0.03em] text-ink-primary leading-[1.08] [text-wrap:balance] mx-auto">
            Más rigor técnico que cualquier clasificador genérico
          </h2>
          <p className="text-base text-ink-secondary leading-relaxed">
            Cada etapa deja rastro documental para defender tu criterio ante fiscalizaciones y acelerar los despachos de tu equipo.
          </p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SHOWCASE_CARDS.map((card, idx) => {
              const Icon = card.icon;
              const isFocused = idx === activeIndex;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`group text-left rounded-[24px] p-6 sm:p-7 border cursor-pointer flex flex-col justify-between gap-6 tos-card-lift ${
                    isFocused
                      ? 'bg-surface-panel border-accent-brand/60 ring-1 ring-accent-brand/20 tos-comet-border'
                      : 'bg-surface-panel border-border-subtle'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/[0.045] dark:bg-white/[0.07] text-ink-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-accent-ink shrink-0" aria-hidden="true" />
                        <h3 className="text-lg font-semibold tracking-tight text-ink-primary leading-snug">
                          {card.title}
                        </h3>
                      </div>
                      <p className="text-sm text-ink-secondary leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-hairline flex items-end justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs font-medium text-ink-muted">
                        {card.metricLabel}
                      </div>
                      <div className="font-mono text-xl font-bold text-ink-primary tabular-nums">
                        {card.metricValue}
                      </div>
                      <div className="text-xs font-medium text-accent-ink">
                        {card.metricDelta}
                      </div>
                    </div>

                    <div aria-hidden="true" className="flex items-end gap-1.5 h-12 shrink-0">
                      {card.bars.map((val, bIdx) => (
                        <span
                          key={bIdx}
                          style={{ height: `${Math.max(20, val)}%` }}
                          className={`w-2 rounded-full transition-colors ${
                            bIdx === card.bars.length - 1
                              ? 'bg-accent-brand'
                              : bIdx >= card.bars.length - 3
                              ? 'bg-accent-brand/45'
                              : 'bg-black/[0.10] dark:bg-white/[0.14]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Módulo anterior"
              className="w-9 h-9 rounded-full inline-flex items-center justify-center bg-white/75 dark:bg-white/[0.06] border border-black/[0.07] dark:border-white/[0.09] text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            <div
              role="tablist"
              aria-label="Indicadores de módulo"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08]"
            >
              {SHOWCASE_CARDS.map((card, idx) => (
                <button
                  key={card.id}
                  type="button"
                  role="tab"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Ver ${card.title}`}
                  aria-selected={idx === activeIndex}
                  className={`h-2 rounded-full transition-colors duration-200 cursor-pointer ${
                    idx === activeIndex
                      ? 'w-6 bg-accent-brand'
                      : 'w-2 bg-border-strong hover:bg-ink-muted'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Siguiente módulo"
              className="w-9 h-9 rounded-full inline-flex items-center justify-center bg-white/75 dark:bg-white/[0.06] border border-black/[0.07] dark:border-white/[0.09] text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
