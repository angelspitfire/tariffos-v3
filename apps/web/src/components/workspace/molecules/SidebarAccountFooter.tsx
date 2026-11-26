'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CreditCard, LogOut, Settings, Sparkles } from 'lucide-react';
import type { ApprovalWorkflowMode, UserProfileSettings } from '@tariffos/shared-types';
import type { WorkspacePlanStatus } from '@/lib/workspace/plan-status';
import { getInitials } from '@/lib/workspace/thread-meta';

export interface SidebarAccountFooterProps {
  profile: UserProfileSettings;
  plan: WorkspacePlanStatus;
  onChangeApprovalMode: (mode: ApprovalWorkflowMode) => void;
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

export function SidebarAccountFooter({ profile, plan, onChangeApprovalMode }: SidebarAccountFooterProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const showPlanCard = plan.isTrial || plan.nearLimit;

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
    <div ref={rootRef} className="relative shrink-0 space-y-2 border-t border-line-frost p-2.5">
      {showPlanCard ? (
        <section
          aria-label="Consumo del plan"
          className="rounded-card border border-accent-border bg-accent-soft/50 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-primary">
              <Sparkles className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
              {plan.planName}
            </span>
            {plan.isTrial ? (
              <span className="rounded-full border border-border-subtle bg-surface-panel px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                Trial
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-ink-muted tabular-nums">
            <span>
              {plan.quotaUsed} / {plan.quotaLimit} clasif.
            </span>
            <span>{plan.usagePct}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-subtle">
            <div className={`h-full rounded-full ${usageBarTone(plan)}`} style={{ width: `${Math.max(plan.usagePct, 4)}%` }} />
          </div>
          <Link
            href="/activate-plan"
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-surface-inverted px-3 py-2 text-xs font-semibold text-ink-on-inverted transition-colors hover:bg-surface-inverted-hover"
          >
            <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
            Activar plan
          </Link>
        </section>
      ) : null}

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
          <span className="block truncate text-xs font-semibold text-ink-primary">{profile.fullName}</span>
          {showPlanCard ? (
            <span className="block truncate text-[10px] text-ink-muted">{profile.email}</span>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-[10px] text-ink-muted">
                <span className="truncate">{plan.planName}</span>
                <span className="font-mono tabular-nums">
                  {plan.quotaUsed}/{plan.quotaLimit}
                </span>
              </span>
              <span className="mt-1 block h-1 overflow-hidden rounded-full bg-surface-subtle">
                <span className={`block h-full rounded-full ${usageBarTone(plan)}`} style={{ width: `${Math.max(plan.usagePct, 4)}%` }} />
              </span>
            </>
          )}
        </span>
        <Settings className="h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
      </button>

      {menuOpen ? (
        <div className="absolute right-2.5 bottom-full left-2.5 z-40 mb-1 space-y-2.5 rounded-card border border-border-subtle bg-surface-panel p-3 text-xs shadow-elev-2">
          <div>
            <div className="font-semibold text-ink-primary">{profile.fullName}</div>
            <div className="text-[11px] text-ink-muted">{profile.email}</div>
            {profile.brokerLicense ? <div className="text-[11px] text-ink-subtle">{profile.brokerLicense}</div> : null}
          </div>
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
          <div className="flex flex-col gap-0.5 border-t border-border-hairline pt-2">
            <Link href="/activate-plan" className="rounded-lg px-2 py-1.5 text-ink-primary hover:bg-surface-hover">
              Plan y facturación
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-ink-muted hover:bg-surface-hover hover:text-rose-600"
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
