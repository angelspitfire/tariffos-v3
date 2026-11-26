'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  BookMarked,
  Moon,
  PanelLeft,
  Sun,
  UserCircle2,
  Zap,
} from 'lucide-react';
import type { ApprovalWorkflowMode, JurisdictionConfig, UserProfileSettings } from '@tariffos/shared-types';
import { JURISDICTIONS } from '@/lib/workspace/jurisdictions';

export interface WorkspaceHeader48Props {
  jurisdiction: JurisdictionConfig;
  profile: UserProfileSettings;
  skuCount: number;
  analyticsOpen: boolean;
  isDark: boolean;
  onToggleSidebar: () => void;
  onChangeJurisdiction: (jurisdictionId: string) => void;
  onOpenSkuCatalog: () => void;
  onToggleAnalytics: () => void;
  onToggleTheme: () => void;
  onChangeApprovalMode: (mode: ApprovalWorkflowMode) => void;
}

const APPROVAL_OPTIONS: Array<{ value: ApprovalWorkflowMode; label: string }> = [
  { value: 'agent_decides', label: 'Agente decide revisión' },
  { value: 'direct_seal', label: 'Sellado directo (sin pausa)' },
  { value: 'always_review', label: 'Revisión obligatoria siempre' },
];

export function WorkspaceHeader48({
  jurisdiction,
  profile,
  skuCount,
  analyticsOpen,
  isDark,
  onToggleSidebar,
  onChangeJurisdiction,
  onOpenSkuCatalog,
  onToggleAnalytics,
  onToggleTheme,
  onChangeApprovalMode,
}: WorkspaceHeader48Props) {
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="no-print flex h-12 shrink-0 items-center justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl px-3">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Alternar historial de clasificaciones"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition hover:bg-surface-hover hover:text-ink-primary"
        >
          <PanelLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <Link href="/" className="hidden items-center gap-2 text-sm font-semibold text-ink-primary sm:inline-flex">
          <span className="inline-flex items-center justify-center w-6 h-5 rounded-full bg-surface-inverted text-ink-on-inverted shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 -ml-0.5" />
          </span>
          <span className="tracking-tight">TariffOS</span>
        </Link>

        <span className="hidden h-4 w-px bg-border-subtle sm:inline-block" aria-hidden="true" />

        <label className="sr-only" htmlFor="workspace-jurisdiction-select">
          Jurisdicción aduanera
        </label>
        <select
          id="workspace-jurisdiction-select"
          value={jurisdiction.id}
          onChange={(e) => onChangeJurisdiction(e.target.value)}
          className="h-8 max-w-44 rounded-lg border border-border-subtle bg-surface-muted px-2 text-xs font-medium text-ink-primary outline-none focus:border-accent-brand sm:max-w-56"
        >
          {JURISDICTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.countryCode} · {item.country} ({item.authority})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          href="/activate-plan"
          className="hidden items-center gap-1 rounded-full border border-accent-border bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent-ink transition hover:bg-accent-brand hover:text-white md:inline-flex"
        >
          <Zap className="h-3 w-3" aria-hidden="true" />
          <span>Plan Pro · Activar</span>
        </Link>

        <button
          type="button"
          onClick={onOpenSkuCatalog}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-2.5 text-xs font-medium text-ink-primary transition hover:bg-surface-hover"
        >
          <BookMarked className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
          <span className="hidden sm:inline">SKUs</span>
          <span className="rounded-full bg-surface-panel px-1.5 font-mono text-[10px] text-ink-muted">
            {skuCount}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleAnalytics}
          aria-pressed={analyticsOpen}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition ${
            analyticsOpen
              ? 'border-accent-brand bg-accent-brand text-white'
              : 'border-border-subtle bg-surface-muted text-ink-primary hover:bg-surface-hover'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden md:inline">Analítica</span>
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition hover:bg-surface-hover hover:text-ink-primary"
        >
          {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setAccountOpen((prev) => !prev)}
            aria-label="Menú de cuenta"
            aria-expanded={accountOpen}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-2 text-xs font-medium text-ink-primary transition hover:bg-surface-hover"
          >
            <UserCircle2 className="h-4 w-4 text-ink-muted shrink-0" aria-hidden="true" />
            <span className="hidden max-w-44 truncate lg:inline whitespace-nowrap">{profile.fullName}</span>
          </button>

          {accountOpen && (
            <div className="absolute right-0 z-30 mt-1.5 w-64 rounded-xl border border-border-subtle bg-surface-panel p-3 text-xs shadow-lg">
              <div className="border-b border-border-hairline pb-2">
                <div className="font-semibold text-ink-primary">{profile.fullName}</div>
                <div className="text-[11px] text-ink-muted">{profile.email}</div>
                <div className="mt-0.5 text-[11px] text-ink-subtle">{profile.brokerLicense}</div>
              </div>

              <div className="mt-2.5 space-y-1.5">
                <label
                  htmlFor="workspace-approval-policy"
                  className="block text-[11px] font-medium text-ink-secondary"
                >
                  Política de sellado de dictámenes
                </label>
                <select
                  id="workspace-approval-policy"
                  value={profile.approvalWorkflowMode}
                  onChange={(e) => onChangeApprovalMode(e.target.value as ApprovalWorkflowMode)}
                  className="w-full rounded-lg border border-border-subtle bg-surface-input px-2 py-1.5 text-xs text-ink-primary"
                >
                  {APPROVAL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 flex flex-col gap-1 border-t border-border-hairline pt-2">
                <Link
                  href="/activate-plan"
                  onClick={() => setAccountOpen(false)}
                  className="rounded-lg px-2 py-1.5 text-ink-primary hover:bg-surface-hover"
                >
                  Gestionar plan y facturación
                </Link>
                <Link
                  href="/login"
                  onClick={() => setAccountOpen(false)}
                  className="rounded-lg px-2 py-1.5 text-ink-muted hover:bg-surface-hover hover:text-ink-primary"
                >
                  Cambiar cuenta / Sesión
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
