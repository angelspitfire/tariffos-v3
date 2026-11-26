'use client';

import type { FormEvent } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { HERO_SAMPLE_CASES } from '@/lib/funnel/hero-samples';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelButton } from '../atoms/FunnelButton';

export interface LandingHeroPreviewProps {
  heroPrompt: string;
  onChangePrompt: (value: string) => void;
  onSubmitPrompt: (e: FormEvent) => void;
  isAuthenticated?: boolean;
}

export function LandingHeroPreview({
  heroPrompt,
  onChangePrompt,
  onSubmitPrompt,
  isAuthenticated = false,
}: LandingHeroPreviewProps) {
  const prefersReducedMotion = useReducedMotion();
  const normalized = heroPrompt.toLowerCase();

  const activeCase =
    normalized.includes('laptop') || normalized.includes('dell')
      ? HERO_SAMPLE_CASES[1]
      : normalized.includes('aceite') || normalized.includes('oliva')
      ? HERO_SAMPLE_CASES[2]
      : HERO_SAMPLE_CASES[0];

  return (
    <div
      data-slot="hero"
      data-kind="product"
      className="rounded-[28px] border border-black/[0.07] dark:border-white/[0.09] bg-white/80 dark:bg-white/[0.045] backdrop-blur-md p-5 sm:p-8 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.16)] space-y-6"
    >
      <div className="space-y-3">
        <form
          onSubmit={onSubmitPrompt}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <div className="flex-1 flex items-center gap-3 px-4 min-h-[52px] rounded-full border border-black/[0.10] dark:border-white/[0.12] bg-white dark:bg-[#0f1626] focus-within:outline-2 focus-within:outline-accent-brand focus-within:outline-offset-[-2px] min-w-0">
            <Search className="w-4 h-4 text-accent-ink shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={heroPrompt}
              onChange={(e) => onChangePrompt(e.target.value)}
              placeholder="Describe una mercancía para clasificar ahora..."
              aria-label="Describe una mercancía para probar TariffOS"
              className="w-full bg-transparent text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none min-w-0"
            />
          </div>
          <FunnelButton
            type="submit"
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="shrink-0 min-h-[52px] rounded-full px-6 whitespace-nowrap"
          >
            {isAuthenticated ? 'Clasificar en workspace' : 'Activar Piloto'}
          </FunnelButton>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-ink-muted mr-1">Prueba con:</span>
          {HERO_SAMPLE_CASES.map((sample) => {
            const isSelected = activeCase.key === sample.key;
            return (
              <button
                key={sample.key}
                type="button"
                onClick={() => onChangePrompt(sample.prompt)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-ink-primary text-ink-on-inverted'
                    : 'bg-black/[0.045] dark:bg-white/[0.07] text-ink-secondary hover:text-ink-primary hover:bg-black/[0.08] dark:hover:bg-white/[0.12]'
                }`}
              >
                {sample.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeCase.key}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2"
        >
          <div className="lg:col-span-7 rounded-[22px] bg-white/90 dark:bg-[#0e1424]/90 border border-black/[0.05] dark:border-white/[0.07] p-5 sm:p-6 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 font-mono text-xs text-ink-muted">
                  <span className="font-semibold text-ink-primary">{activeCase.expediente}</span>
                  <span aria-hidden="true">/</span>
                  <span>{activeCase.jurisdiction}</span>
                </div>
                <FunnelBadge variant="success">Confianza {activeCase.confidence}%</FunnelBadge>
              </div>

              <p className="text-sm text-ink-secondary leading-relaxed">
                {activeCase.merchandise}
              </p>

              <div className="pt-2 space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-ink">
                  <Scale className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  Partida arancelaria determinada
                </div>
                <div className="font-mono text-2xl sm:text-4xl font-bold tracking-tight text-ink-primary tabular-nums break-words">
                  {activeCase.hsCode}
                </div>
                <p className="text-sm text-ink-secondary">{activeCase.hsDescription}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.07]">
              <div className="flex flex-wrap gap-1.5">
                {activeCase.badges.map((b, idx) => (
                  <FunnelBadge key={b} variant={idx < 2 ? 'accent' : 'neutral'}>
                    {b}
                  </FunnelBadge>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-accent-ink">
                <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {activeCase.latency}
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-[22px] bg-white/90 dark:bg-[#0e1424]/90 border border-black/[0.05] dark:border-white/[0.07] p-5 sm:p-6 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] tracking-[0.06em] text-ink-muted">
                  CARGA TRIBUTARIA
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-ink">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  Arancel vigente
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 items-end h-32 pt-2">
                {activeCase.taxes.map((tax) => (
                  <div
                    key={tax.label}
                    className="flex flex-col items-center justify-end h-full gap-2"
                  >
                    <span className="font-mono text-sm font-bold text-ink-primary tabular-nums">
                      {tax.value}
                    </span>
                    <div className="w-full max-w-[38px] h-20 rounded-full bg-black/[0.05] dark:bg-white/[0.07] p-1 flex items-end">
                      <motion.div
                        initial={prefersReducedMotion ? false : { scaleY: 0.2 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: `${tax.pct}%` }}
                        className="w-full rounded-full bg-accent-brand origin-bottom"
                      />
                    </div>
                    <span className="text-[11px] text-ink-muted text-center leading-tight">
                      {tax.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.07] text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  className="w-4 h-4 text-accent-ink shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <div className="font-semibold text-ink-primary">
                    Validación pericial completada
                  </div>
                  <p className="text-ink-muted mt-0.5">{activeCase.hitlNote}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FileCheck2
                  className="w-4 h-4 text-accent-ink shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <div className="font-semibold text-ink-primary">
                    Dictamen técnico PDF auditable
                  </div>
                  <p className="text-ink-muted mt-0.5">
                    Listo para sellar con patente y firma gráfica.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
