'use client';

import Link from 'next/link';
import { BookmarkCheck, CreditCard, LayoutDashboard, MessageSquare, PanelLeftOpen, Plus } from 'lucide-react';
import type { WorkspacePlanStatus } from '@/lib/workspace/plan-status';
import { RailTooltip } from '../atoms/RailTooltip';

export interface SidebarRailProps {
  threadCount: number;
  skuCount: number;
  dashboardActive: boolean;
  initials: string;
  plan: WorkspacePlanStatus;
  onExpand: () => void;
  onNewThread: () => void;
  onOpenDashboard: () => void;
  onOpenSkuCatalog: () => void;
}

const RAIL_ICON_BTN =
  'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-subtle hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none';

function planTone(plan: WorkspacePlanStatus): string {
  if (plan.exhausted) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
  if (plan.isTrial || plan.nearLimit) return 'bg-accent-soft text-accent-ink';
  return 'text-ink-secondary hover:bg-surface-hover';
}

/** 56px collapsed sidebar: primary actions as icons with hover tooltips. */
export function SidebarRail({
  threadCount,
  skuCount,
  dashboardActive,
  initials,
  plan,
  onExpand,
  onNewThread,
  onOpenDashboard,
  onOpenSkuCatalog,
}: SidebarRailProps) {
  return (
    <div className="flex h-full w-14 flex-col items-center border-r border-line-frost bg-surface-frost backdrop-blur-xl">
      <div className="flex h-12 w-full shrink-0 items-center justify-center border-b border-line-frost">
        <RailTooltip label="Expandir barra lateral">
          <button type="button" onClick={onExpand} aria-label="Expandir barra lateral" className={`${RAIL_ICON_BTN} rounded-full`}>
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          </button>
        </RailTooltip>
      </div>

      <div className="flex w-full flex-1 flex-col items-center gap-2 py-3">
        <RailTooltip label="Nuevo chat">
          <button
            type="button"
            onClick={onNewThread}
            aria-label="Nuevo chat"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-surface-inverted text-ink-on-inverted transition-colors hover:bg-surface-inverted-hover"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </RailTooltip>

        <RailTooltip label="Dashboard">
          <button
            type="button"
            onClick={onOpenDashboard}
            aria-label="Dashboard"
            aria-current={dashboardActive ? 'page' : undefined}
            className={`${RAIL_ICON_BTN} ${dashboardActive ? 'bg-accent-soft text-accent-ink' : ''}`}
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          </button>
        </RailTooltip>

        <RailTooltip label={`Catálogo SKU (${skuCount})`}>
          <button type="button" onClick={onOpenSkuCatalog} aria-label={`Catálogo SKU (${skuCount})`} className={RAIL_ICON_BTN}>
            <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
          </button>
        </RailTooltip>

        <div className="my-1 w-6 border-t border-border-hairline" />

        <RailTooltip label={`Historial de chats (${threadCount})`}>
          <button type="button" onClick={onExpand} aria-label={`Historial de chats (${threadCount})`} className={`${RAIL_ICON_BTN} flex-col gap-0.5`}>
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            {threadCount > 0 ? (
              <span className="font-mono text-[10px] leading-none font-semibold text-ink-muted tabular-nums">{threadCount}</span>
            ) : null}
          </button>
        </RailTooltip>
      </div>

      <div className="flex w-full shrink-0 flex-col items-center gap-2 border-t border-line-frost p-2.5">
        <RailTooltip label={`${plan.planName} · ${plan.quotaUsed}/${plan.quotaLimit}`}>
          <Link
            href="/activate-plan"
            aria-label={`${plan.planName} (${plan.quotaUsed}/${plan.quotaLimit})`}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${planTone(plan)}`}
          >
            <CreditCard className="h-4 w-4" aria-hidden="true" />
          </Link>
        </RailTooltip>
        <RailTooltip label="Cuenta y ajustes">
          <button
            type="button"
            onClick={onExpand}
            aria-label="Cuenta y ajustes"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-accent-brand text-[11px] font-bold text-white transition-transform hover:scale-105"
          >
            {initials}
          </button>
        </RailTooltip>
      </div>
    </div>
  );
}
