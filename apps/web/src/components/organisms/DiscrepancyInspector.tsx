import { DiscrepancyReport } from '@/types/domain';
import { SkeletonCard, SkeletonText } from '@/components/atoms/Skeleton';
import { AlertTriangle } from 'lucide-react';

function severityBadge(severity: string) {
  if (severity === 'critical') {
    return 'px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--danger-subtle)] text-[var(--danger-text)] border border-[var(--danger-border)]';
  }
  return 'px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--warning-subtle)] text-[var(--warning-text)] border border-[var(--warning-border)]';
}

export function DiscrepancyInspector({ payload, isLoading = false }: { payload: DiscrepancyReport; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <SkeletonCard>
        <SkeletonText lines={4} />
      </SkeletonCard>
    );
  }

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--danger-border)] rounded-xl p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--danger-subtle)', color: 'var(--danger-text)' }}>
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[var(--text-hi)]">Auditoría Cruzada: Factura vs BoL</h4>
          <p className="text-[11px] text-[var(--text-lo)]">{payload.discrepancies.length} inconsistencias detectadas</p>
        </div>
      </div>
      <div className="space-y-2">
        {payload.discrepancies.map((disc, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-card)]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--text-hi)]">{disc.field}</p>
                <p className="text-[11px] text-[var(--text-lo)] mt-0.5">
                  Esperado: <span className="font-mono-numbers text-[var(--text-hi)]">{disc.expected}</span> · 
                  Encontrado: <span className="font-mono-numbers text-[var(--danger-text)]">{disc.found}</span>
                </p>
              </div>
              <span className={severityBadge(disc.severity)}>
                {disc.severity}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-2">{disc.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
