'use client';

import type { AdminAiQualityModelStat } from '@tariffos/shared-types';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';

export function AiQualitySummaryCards({ stats }: { stats: AdminAiQualityModelStat[] }) {
  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {stats.map((stat) => (
        <FunnelCard key={`${stat.provider}-${stat.model}`} padding="p-4" className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-accent-ink">
              {stat.provider}
            </span>
            <span className="text-[11px] font-mono text-ink-muted">{stat.count} casos</span>
          </div>
          <div className="text-xs font-mono font-bold text-ink-primary truncate" title={stat.model}>
            {stat.model}
          </div>
          <div className="flex items-center justify-between text-[11px] text-ink-secondary pt-1">
            <span>Confianza media: <strong>{stat.avgConfidencePct}%</strong></span>
            <span>Verificado DB: <strong>{stat.verifiedRatePct}%</strong></span>
          </div>
        </FunnelCard>
      ))}
    </div>
  );
}
