import { DataVisualizerPayload } from '@/types/generative-payloads';
import { SkeletonCard, SkeletonText } from '@/components/atoms/Skeleton';
import { BarChart, LineChart, PieChart, BarChart2 } from 'lucide-react';

const chartIcons = {
  bar: BarChart,
  line: LineChart,
  pie: PieChart,
  area: BarChart2,
} as const;

export function DataVisualizer({ payload, isLoading = false }: { payload: DataVisualizerPayload; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <SkeletonCard>
        <SkeletonText lines={3} />
        <div className="h-48 mt-4 animate-pulse bg-[var(--surface-elevated)] rounded" />
      </SkeletonCard>
    );
  }

  // Use series[0]?.type or default to 'bar' for chart type
  const chartType = (payload.series[0] as { type?: string } | undefined)?.type || 'bar';
  const Icon = chartIcons[chartType as keyof typeof chartIcons] || BarChart;

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--info-subtle)', color: 'var(--info-text)' }}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-hi)]">{payload.title ?? 'Visualización de Datos'}</h4>
            <p className="text-[11px] text-[var(--text-lo)]">{payload.subtitle ?? ''}</p>
          </div>
        </div>
      </div>

      <div className="h-64" style={{ background: 'var(--surface-elevated)', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
        <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
          <p>Chart visualization: {chartType}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border-divider)]">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Datos</p>
        <div className="grid gap-2 md:grid-cols-2">
          {payload.data.map((point, idx) => {
            const entries = Object.entries(point);
            const label = entries[0]?.[0] ?? '';
            const value = entries[0]?.[1] ?? '';
            return (
              <div key={idx} className="p-2 rounded" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-card)' }}>
                <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
                <p className="text-sm font-mono-numbers text-[var(--text-hi)]">{value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
