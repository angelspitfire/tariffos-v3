import { PermitsMatrixPayload, LineCompliance } from '@/types/permits';
import { SkeletonCard, SkeletonText, SkeletonTable } from '@/components/atoms/Skeleton';
import { ShieldCheck, AlertCircle, Clock, FileText } from 'lucide-react';

const statusConfig = {
  approved: { label: 'Aprobado', bg: 'bg-[var(--success-subtle)] text-[var(--success-text)] border-[var(--success-border)]', icon: ShieldCheck },
  pending: { label: 'En Trámite', bg: 'bg-[var(--warning-subtle)] text-[var(--warning-text)] border-[var(--warning-border)]', icon: Clock },
  blocking: { label: 'Bloqueante', bg: 'bg-[var(--danger-subtle)] text-[var(--danger-text)] border-[var(--danger-border)]', icon: AlertCircle },
  not_required: { label: 'No Requerido', bg: 'bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border-card)]', icon: FileText },
} as const;

function statusBadgeClassName(status: LineCompliance['overallStatus']) {
  const cfg = statusConfig[status];
  return 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium ' + cfg.bg;
}

function statusIcon(status: LineCompliance['overallStatus']) {
  const cfg = statusConfig[status];
  return <cfg.icon className="w-3 h-3 shrink-0" />;
}

export function PermitsComplianceMatrix({ payload, isLoading = false }: { payload: PermitsMatrixPayload; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <SkeletonCard>
          <SkeletonText lines={2} />
        </SkeletonCard>
        <SkeletonTable rows={5} columns={6} />
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--purple-subtle)', color: 'var(--purple-text)' }}>
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-hi)]">Matriz de Cumplimiento No Arancelario</h4>
            <p className="text-[11px] text-[var(--text-lo)]">{payload.totalPermits} aprobaciones · {payload.lines.length} líneas evaluadas</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-[var(--danger-subtle)] text-[var(--danger-text)] font-bold uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {payload.blockingCount} bloqueante
          </span>
          <span className="px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)]">
            VUCE sincronizada hace 5m
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-divider)] text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              <th className="py-2 px-3 text-left">Línea</th>
              <th className="py-2 px-3 text-left">Producto</th>
              <th className="py-2 px-3 text-left">Agencia</th>
              <th className="py-2 px-3 text-left">Permiso</th>
              <th className="py-2 px-3 text-center">Estado</th>
              <th className="py-2 px-3 text-left">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-divider)]">
            {payload.lines.map((line, idx) => (
              <tr key={line.lineItemId} className="hover:bg-[var(--surface-elevated)] transition-colors">
                <td className="py-2 px-3 font-mono-numbers text-[var(--text-muted)]">{idx + 1}</td>
                <td className="py-2 px-3 text-[var(--text-hi)] max-w-xs truncate" title={line.productDescription}>{line.productDescription}</td>
                <td className="py-2 px-3 text-[var(--text-mid)] font-medium">{line.permits[0]?.agency ?? 'N/A'}</td>
                <td className="py-2 px-3 text-[var(--text-lo)]">{line.permits[0]?.name ?? 'N/A'}</td>
                <td className="py-2 px-3 text-center">
                  <span className={statusBadgeClassName(line.overallStatus)}>
                    {statusIcon(line.overallStatus)}
                    {statusConfig[line.overallStatus].label}
                  </span>
                </td>
                <td className="py-2 px-3 text-[var(--text-lo)]">{line.permits[0]?.notes ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
