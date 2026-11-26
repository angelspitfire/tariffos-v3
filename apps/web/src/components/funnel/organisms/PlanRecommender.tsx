'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { SubscriptionPlanConfig } from '@tariffos/shared-types';
import {
  recommendSubscriptionPlan,
  type PlanRecommendation,
  type RecommenderCapability,
  type RecommenderTeamSize,
  type RecommenderVolumeTier,
} from '@/lib/funnel/plan-recommender';
import {
  RECOMMENDER_EXTRA_CAPABILITIES,
  RECOMMENDER_TEAM_OPTIONS,
  RECOMMENDER_VOLUME_OPTIONS,
} from '@/lib/funnel/plan-recommender-options';
import { PlanRecommendationCard } from '../molecules/PlanRecommendationCard';

export interface PlanRecommenderProps {
  plans: readonly SubscriptionPlanConfig[];
  paidOnly?: boolean;
  defaultOpen?: boolean;
  onApplyRecommendation: (recommendation: PlanRecommendation) => void;
}

export function PlanRecommender({
  plans,
  paidOnly = false,
  defaultOpen = false,
  onApplyRecommendation,
}: PlanRecommenderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [monthlyVolume, setMonthlyVolume] = useState<RecommenderVolumeTier>(
    paidOnly ? 'medium' : 'low',
  );
  const [teamSize, setTeamSize] = useState<RecommenderTeamSize>('solo');
  const [needsBatch, setNeedsBatch] = useState(false);
  const [capabilities, setCapabilities] = useState<RecommenderCapability[]>([]);

  const visibleVolumes = RECOMMENDER_VOLUME_OPTIONS.filter(
    (v) => !(paidOnly && v.paidOnlyHide),
  );

  const toggleCapability = (cap: RecommenderCapability) => {
    setCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap],
    );
  };

  const recommendation = useMemo(
    () =>
      recommendSubscriptionPlan(
        { monthlyVolume, teamSize, needsBatch, capabilities, paidOnly },
        plans,
      ),
    [capabilities, monthlyVolume, needsBatch, paidOnly, plans, teamSize],
  );

  const matchedPlan = plans.find((p) => p.planId === recommendation.planId);

  return (
    <div
      id="recomendador"
      className="rounded-xl border border-accent-border bg-accent-soft/45 overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-accent-soft/70 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-accent-brand/15 text-accent-ink flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-ink-primary">
              ¿No sabes qué plan elegir? Usa el recomendador rápido
            </div>
            <div className="text-[11px] text-ink-muted truncate">
              Indica volumen, equipo y necesidades de lotes para sugerirte el plan óptimo.
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-ink shrink-0">
          {isOpen ? 'Ocultar' : 'Recomendar plan'}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {isOpen ? (
        <div className="px-4 pb-4 pt-2 border-t border-accent-border/60 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7 space-y-3">
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                1. Clasificaciones estimadas por mes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {visibleVolumes.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMonthlyVolume(opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      monthlyVolume === opt.id
                        ? 'bg-surface-inverted text-ink-on-inverted border-transparent'
                        : 'bg-surface-panel text-ink-secondary border-border-subtle hover:border-border-strong'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                2. Tamaño del equipo
              </div>
              <div className="flex flex-wrap gap-1.5">
                {RECOMMENDER_TEAM_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTeamSize(opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      teamSize === opt.id
                        ? 'bg-surface-inverted text-ink-on-inverted border-transparent'
                        : 'bg-surface-panel text-ink-secondary border-border-subtle hover:border-border-strong'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                3. Capacidades clave
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  aria-pressed={needsBatch}
                  onClick={() => setNeedsBatch((prev) => !prev)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                    needsBatch
                      ? 'bg-accent-brand/15 text-accent-ink border-accent-brand'
                      : 'bg-surface-panel text-ink-secondary border-border-subtle hover:border-border-strong'
                  }`}
                >
                  Carga por lotes (Excel/CSV)
                </button>
                {RECOMMENDER_EXTRA_CAPABILITIES.map((opt) => {
                  const active = capabilities.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleCapability(opt.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        active
                          ? 'bg-accent-brand/15 text-accent-ink border-accent-brand'
                          : 'bg-surface-panel text-ink-secondary border-border-subtle hover:border-border-strong'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <PlanRecommendationCard
            recommendation={recommendation}
            matchedPlan={matchedPlan}
            onApply={() => onApplyRecommendation(recommendation)}
          />
        </div>
      ) : null}
    </div>
  );
}
