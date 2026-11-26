'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CreditCard, LogOut, Settings, Sparkles } from 'lucide-react';
import type { ApprovalWorkflowMode, UserProfileSettings } from '@tariffos/shared-types';
import {
  mergeCloudUsageIntoPlanStatus,
  type WorkspacePlanStatus,
} from '@/lib/workspace/plan-status';
import { getInitials } from '@/lib/workspace/thread-meta';
import { useCloudUsageSnapshot } from '@/lib/workspace/use-cloud-usage';

export interface SidebarAccountFooterProps {
  profile: UserProfileSettings;
  plan: WorkspacePlanStatus;
  onChangeApprovalMode: (mode: ApprovalWorkflowMode) => void;
  onOpenSettings?: () => void;
}

const APPROVAL_OPTIONS: ReadonlyArray<{ value: ApprovalWorkflowMode; label: string }> = [
  { value: 'agent_decides', label: 'Agente decide revisión' },
  { value: 'direct_seal', label: 'Sellado directo' },
  { value: 'always_review', label: 'Revisión obligatoria' },
];

function usageBarTone(plan: WorkspacePlanStatus): string {
  if (plan.exhausted) return 'bg-rose-500';
  if (plan.nearLimit) return 'bg-amber-500';
  return 'bg-accent-brand';
}

export function SidebarAccountFooter({
  profile,
  plan,
  onChangeApprovalMode,
  onOpenSettings,
}: SidebarAccountFooterProps) {
  const cloudUsage = useCloudUsageSnapshot();
  const effectivePlan = mergeCloudUsageIntoPlanStatus(plan, cloudUsage);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [menuOpen]);

  return (
    <div ref={rootRef} className="relative shrink-0 border-t border-line-frost p-2.5">
      <button
        type="button"
        onClick={() => setMenuOpen((p) => !p)}
        aria-label="Cuenta y ajustes"
        aria-expanded={menuOpen}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-card border border-border-subtle bg-surface-panel p-2 text-left transition-colors hover:bg-surface-hover"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-brand text-[10px] font-bold text-white">
          {getInitials(profile.fullName)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-1.5">
            <span className="truncate text-xs font-semibold text-ink-primary">{profile.fullName}</span>
            {effectivePlan.billingStatus === 'CANCELED' ? (
              <span className="shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300">
                De baja
              </span>
            ) : effectivePlan.billingStatus === 'PAST_DUE' ? (
              <span className="shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                Pendiente
              </span>
            ) : effectivePlan.isTrial || effectivePlan.isPilot ? (
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold tabular-nums ${
                  effectivePlan.exhausted
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    : 'bg-accent-soft text-accent-ink'
                }`}
              >
                {effectivePlan.isTrial ? 'Trial' : 'Piloto'}
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block truncate text-[10px] text-ink-muted">{profile.email}</span>
        </span>
        <Settings className="h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
      </button>

      {menuOpen ? (
        <div className="absolute right-2.5 bottom-full left-2.5 z-40 mb-1.5 space-y-3 rounded-card border border-border-subtle bg-surface-panel p-3 text-xs shadow-elev-2">
          <div>
            <div className="font-semibold text-ink-primary">{profile.fullName}</div>
            <div className="text-[11px] text-ink-muted">{profile.email}</div>
            {profile.brokerLicense ? <div className="text-[11px] text-ink-subtle">{profile.brokerLicense}</div> : null}
          </div>

          <section
            aria-label="Consumo del plan"
            className="rounded-field border border-accent-border/70 bg-accent-soft/45 p-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-semibold text-ink-primary">
                <Sparkles className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
                {effectivePlan.planName}
              </span>
              <span className="font-mono text-[10px] text-ink-muted tabular-nums">
                {effectivePlan.quotaUsed} / {effectivePlan.quotaLimit} clasif.
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-subtle">
              <div
                className={`h-full rounded-full ${usageBarTone(effectivePlan)}`}
                style={{ width: `${Math.max(effectivePlan.usagePct, 4)}%` }}
              />
            </div>
            <Link
              href="/activate-plan"
              onClick={() => setMenuOpen(false)}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-surface-inverted px-3 py-1.5 text-[11px] font-semibold text-ink-on-inverted transition-colors hover:bg-surface-inverted-hover"
            >
              <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
              {effectivePlan.isTrial || effectivePlan.isPilot || effectivePlan.billingStatus === 'PAST_DUE'
                ? 'Activar plan'
                : 'Gestionar plan'}
            </Link>
          </section>

          <label className="block space-y-1">
            <span className="block text-[11px] font-medium text-ink-secondary">Política de sellado</span>
            <select
              value={profile.approvalWorkflowMode}
              onChange={(e) => onChangeApprovalMode(e.target.value as ApprovalWorkflowMode)}
              className="w-full rounded-field border border-border-subtle bg-surface-input px-2 py-1.5 text-xs text-ink-primary"
            >
              {APPROVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-0.5 border-t border-border-hairline pt-2">
            {onOpenSettings ? (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSettings();
                }}
                className="inline-flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-ink-primary hover:bg-surface-hover"
              >
                <Settings className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                Configuración
              </button>
            ) : null}
            <Link
              href="/login"
              className="inline-flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-ink-muted hover:bg-surface-hover hover:text-rose-600"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Cerrar sesión
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
