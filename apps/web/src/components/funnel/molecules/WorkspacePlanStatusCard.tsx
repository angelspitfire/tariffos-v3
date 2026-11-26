import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import type {
  WorkspacePlanLifecycleStatus,
  WorkspacePlanStatusSnapshot,
} from '@/lib/funnel/billing-port';
import { FunnelBadge, type FunnelBadgeVariant } from '../atoms/FunnelBadge';
import { FunnelCard } from '../atoms/FunnelCard';

const STATUS_BADGE_MAP: Record<
  WorkspacePlanLifecycleStatus,
  { label: string; variant: FunnelBadgeVariant }
> = {
  trial: { label: 'Trial gratuito', variant: 'neutral' },
  quota_reached: { label: 'Cuota alcanzada', variant: 'warning' },
  pending_verification: { label: 'En verificación', variant: 'warning' },
  active: { label: 'Plan activo', variant: 'success' },
  rejected: { label: 'Pago rechazado', variant: 'danger' },
};

export interface WorkspacePlanStatusCardProps {
  snapshot: WorkspacePlanStatusSnapshot;
  showWorkspaceLink?: boolean;
}

export function WorkspacePlanStatusCard({
  snapshot,
  showWorkspaceLink = true,
}: WorkspacePlanStatusCardProps) {
  const badge = STATUS_BADGE_MAP[snapshot.status];
  const progressPct =
    snapshot.quotaLimit > 0
      ? Math.min(100, Math.round((snapshot.quotaUsed / snapshot.quotaLimit) * 100))
      : 0;

  return (
    <FunnelCard padding="p-4" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Estado de suscripción
          </div>
          <div className="text-sm font-bold text-ink-primary">{snapshot.planName}</div>
        </div>
        <FunnelBadge variant={badge.variant}>{badge.label}</FunnelBadge>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-ink-secondary">
          <span>Cuota mensual</span>
          <span className="font-mono font-semibold tabular-nums">
            {snapshot.quotaUsed} / {snapshot.quotaLimit.toLocaleString('en-US')}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-subtle overflow-hidden">
          <div
            className="h-full rounded-full bg-accent-brand transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {snapshot.pendingActivation ? (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5">
          <div className="font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Activación solicitada: {snapshot.pendingActivation.planName}</span>
          </div>
          <div className="font-mono">
            Ref. {snapshot.pendingActivation.referenceCode} ·{' '}
            {snapshot.pendingActivation.amount.toLocaleString('en-US')}{' '}
            {snapshot.pendingActivation.currency}
          </div>
        </div>
      ) : null}

      {snapshot.rejectionReason ? (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{snapshot.rejectionReason}</span>
        </div>
      ) : null}

      {snapshot.status === 'active' ? (
        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Todas las funciones del plan están habilitadas.</span>
        </div>
      ) : null}

      {showWorkspaceLink ? (
        <div className="pt-1 flex items-center justify-between gap-2 text-xs">
          <Link
            href="/app"
            className="inline-flex items-center gap-1 font-semibold text-accent-ink hover:underline"
          >
            <span>Abrir workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/admin/billing"
            className="text-[11px] text-ink-muted hover:text-ink-primary transition-colors"
          >
            Cola admin
          </Link>
        </div>
      ) : null}
    </FunnelCard>
  );
}
