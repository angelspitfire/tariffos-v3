'use client';

import { useMemo, useState } from 'react';
import { BarChart3, Clock, Layers, TrendingUp, X } from 'lucide-react';
import type { SkuPrecedent } from '@tariffos/shared-types';
import { computeWorkspaceAnalytics } from '@/lib/workspace/analytics-metrics';
import type { AnalyticsTabId, WorkspaceThread } from '@/lib/workspace/types';
import { RecentRulingsComparePanel } from '../molecules/RecentRulingsComparePanel';

export interface AnalyticsWorkspaceViewProps {
  threads: readonly WorkspaceThread[];
  skuPrecedents: readonly SkuPrecedent[];
  onClose: () => void;
}

const TABS: Array<{ id: AnalyticsTabId; label: string }> = [
  { id: 'summary', label: 'Resumen Ejecutivo' },
  { id: 'hs_distribution', label: 'Distribución SA' },
  { id: 'hitl_timings', label: 'Tiempos y HITL' },
  { id: 'recent_compare', label: 'Comparar dictámenes' },
];

export function AnalyticsWorkspaceView({ threads, skuPrecedents, onClose }: AnalyticsWorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsTabId>('summary');
  const metrics = useMemo(() => computeWorkspaceAnalytics(threads, skuPrecedents), [threads, skuPrecedents]);
  const maxMonthly = Math.max(1, ...metrics.monthlyTrend.map((m) => m.total));

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    if (e.key === 'ArrowRight') { e.preventDefault(); setActiveTab(TABS[(idx + 1) % TABS.length]!.id); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setActiveTab(TABS[(idx - 1 + TABS.length) % TABS.length]!.id); }
  };

  return (
    <div className="flex h-full flex-col bg-surface-app">
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-panel px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent-ink" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-ink-primary">Analítica Operativa</h2>
        </div>
        <button type="button" onClick={onClose} className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-subtle px-2.5 py-1 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none">
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Volver al workspace
        </button>
      </div>

      <div role="tablist" aria-label="Secciones de analítica operativa" onKeyDown={onTabKeyDown} className="flex gap-1 overflow-x-auto border-b border-border-subtle bg-surface-panel px-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 cursor-pointer border-b-2 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${
              activeTab === tab.id ? 'border-accent-brand text-accent-ink' : 'border-transparent text-ink-muted hover:text-ink-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
                <div className="text-xs text-ink-muted">Clasificaciones emitidas</div>
                <div className="mt-1 font-mono text-2xl font-bold text-ink-primary tabular-nums">
                  {metrics.totalClassifications}
                </div>
              </div>
              <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
                <div className="text-xs text-ink-muted">Dictámenes sellados ({metrics.approvalRatePct}%)</div>
                <div className="mt-1 font-mono text-2xl font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                  {metrics.approvedDossiers}
                </div>
              </div>
              <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
                <div className="text-xs text-ink-muted">Intervenciones HITL</div>
                <div className="mt-1 font-mono text-2xl font-bold text-amber-600 tabular-nums dark:text-amber-400">
                  {metrics.hitlInterventions}
                </div>
              </div>
              <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
                <div className="text-xs text-ink-muted">Precedentes SKU activos</div>
                <div className="mt-1 font-mono text-2xl font-bold text-accent-ink tabular-nums">
                  {metrics.skuPrecedentsCount}
                </div>
              </div>
            </div>

            <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
                <TrendingUp className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
                Actividad mensual y tasa Fast-Path ({metrics.fastPathRatePct}%)
              </h3>
              {metrics.monthlyTrend.length === 0 ? (
                <p className="mt-3 text-xs text-ink-muted">Sin actividad mensual registrada aún.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {metrics.monthlyTrend.map((m) => (
                    <div key={m.monthKey} className="space-y-1 text-xs">
                      <div className="flex justify-between font-mono text-ink-primary">
                        <span>{m.monthKey}</span>
                        <span className="tabular-nums">
                          {m.total} clasif. · {m.approved} sellados
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
                        <div
                          className="h-full rounded-full bg-accent-brand"
                          style={{ width: `${Math.max(8, Math.round((m.total / maxMonthly) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'hs_distribution' && (
          <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
              <Layers className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
              Capítulos SA más clasificados
            </h3>
            {metrics.chapterDistribution.length === 0 ? (
              <p className="mt-4 text-xs text-ink-muted">
                Aún no hay suficientes clasificaciones para graficar distribución por capítulo.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {metrics.chapterDistribution.map((row) => (
                  <li key={row.chapter} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium text-ink-primary">
                      <span className="font-mono">{row.chapter}</span>
                      <span className="font-mono tabular-nums">
                        {row.count} ({row.sharePct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                      <div
                        className="h-full rounded-full bg-accent-brand"
                        style={{ width: `${Math.max(6, row.sharePct)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {activeTab === 'hitl_timings' && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                <Clock className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
                Latencia promedio
              </div>
              <div className="mt-1 font-mono text-xl font-bold text-ink-primary tabular-nums">
                {metrics.avgLatencyMs > 0 ? `${(metrics.avgLatencyMs / 1000).toFixed(2)} s` : '—'}
              </div>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
              <div className="text-xs text-ink-muted">Resolución directa (Fast-Path)</div>
              <div className="mt-1 font-mono text-xl font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                {metrics.hitlBreakdown.fastPathCount}
              </div>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
              <div className="text-xs text-ink-muted">Ítems en lotes procesados</div>
              <div className="mt-1 font-mono text-xl font-bold text-ink-primary tabular-nums">
                {metrics.hitlBreakdown.batchItemsCount}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recent_compare' && (
          <RecentRulingsComparePanel rulings={metrics.recentRulings} />
        )}
      </div>
    </div>
  );
}
