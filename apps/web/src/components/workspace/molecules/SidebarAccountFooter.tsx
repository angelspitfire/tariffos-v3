'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, LogOut, Settings, Sparkles } from 'lucide-react';
import type { ApprovalWorkflowMode, UserProfileSettings } from '@tariffos/shared-types';
import { clearMockSession } from '@/lib/funnel/funnel-storage';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { WorkspacePlanStatus } from '@/lib/workspace/plan-status';
import { getInitials } from '@/lib/workspace/thread-meta';

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
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
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

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      clearMockSession();
      if (isCloudModeEnabled()) {
        await createSupabaseBrowserClient().auth.signOut();
      }
    } catch {
      // Proceed to login screen even if client signOut hits a transient failure.
    } finally {
      setMenuOpen(false);
      setSigningOut(false);
      router.push('/login');
    }
  };

  return (
    <div ref={rootRef} className="relative shrink-0 border-t border-line-frost p-2.5">
      <button
        type="button"
        onClick={() => setMenuOpen((p) => !p)}
        aria-label="Cuenta y ajustes"
        aria-expanded={menuOpen}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-card border border-border-subtle bg-surface-panel p-2 text-left transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-brand text-[10px] font-bold text-white">
          {getInitials(profile.fullName)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-1.5">
            <span className="truncate text-xs font-semibold text-ink-primary">{profile.fullName}</span>
            {plan.billingStatus === 'CANCELED' ? (
              <span className="shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300">
                De baja
              </span>
            ) : plan.billingStatus === 'PAST_DUE' ? (
              <span className="shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                Pendiente
              </span>
            ) : plan.isTrial || plan.isPilot ? (
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold tabular-nums ${
                  plan.exhausted
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    : 'bg-accent-soft text-accent-ink'
                }`}
              >
                {plan.isTrial ? 'Trial' : 'Piloto'}
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
                {plan.planName}
              </span>
              <span className="font-mono text-[10px] text-ink-muted tabular-nums">
                {plan.quotaUsed} / {plan.isUnlimited ? '∞' : plan.quotaLimit} clasif.
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-subtle">
              <div
                className={`h-full rounded-full ${usageBarTone(plan)}`}
                style={{ width: `${Math.max(plan.usagePct, 4)}%` }}
              />
            </div>
            <Link
              href={plan.isUnlimited ? '/admin' : '/activate-plan'}
              onClick={() => setMenuOpen(false)}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-surface-inverted px-3 py-1.5 text-[11px] font-semibold text-ink-on-inverted transition-colors hover:bg-surface-inverted-hover"
            >
              <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
              {plan.isUnlimited
                ? 'Consola Admin'
                : plan.isTrial || plan.isPilot || plan.billingStatus === 'PAST_DUE'
                  ? 'Activar plan'
                  : 'Gestionar plan'}
            </Link>
          </section>

          <label className="block space-y-1">
            <span className="block text-[11px] font-medium text-ink-secondary">Política de sellado</span>
            <select
              value={profile.approvalWorkflowMode}
              onChange={(e) => onChangeApprovalMode(e.target.value as ApprovalWorkflowMode)}
              className="w-full rounded-field border border-border-subtle bg-surface-input px-2 py-1.5 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
            >
              {APPROVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface-panel text-ink-primary">
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
            <button
              type="button"
              disabled={signingOut}
              onClick={() => void handleSignOut()}
              className="inline-flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-ink-muted hover:bg-surface-hover hover:text-rose-600 disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              {signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
