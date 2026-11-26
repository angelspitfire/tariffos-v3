'use client';

import { BookmarkCheck, LayoutDashboard, PanelLeftClose, Plus, X } from 'lucide-react';
import type { ApprovalWorkflowMode, UserProfileSettings } from '@tariffos/shared-types';
import { BrandMark } from '@/components/funnel/atoms/BrandMark';
import type { WorkspacePlanStatus } from '@/lib/workspace/plan-status';
import { getInitials } from '@/lib/workspace/thread-meta';
import type { WorkspaceThread } from '@/lib/workspace/types';
import { SidebarAccountFooter } from '../molecules/SidebarAccountFooter';
import { SidebarRail } from '../molecules/SidebarRail';
import { ThreadHistoryList } from '../molecules/ThreadHistoryList';

export interface ThreadSidebarProps {
  /** Expanded (256px) when true, 56px icon rail when false. */
  open: boolean;
  /** Mobile drawer variant: always expanded, shows a close button. */
  drawer?: boolean;
  threads: readonly WorkspaceThread[];
  activeThreadId: string | null;
  profile: UserProfileSettings;
  plan: WorkspacePlanStatus;
  skuCount: number;
  dashboardActive: boolean;
  onToggle: () => void;
  onNewThread: () => void;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onOpenDashboard: () => void;
  onOpenSkuCatalog: () => void;
  onChangeApprovalMode: (mode: ApprovalWorkflowMode) => void;
}

const NAV_BTN =
  'flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-1.5 text-left text-xs font-medium transition-colors';

export function ThreadSidebar({
  open,
  drawer = false,
  threads,
  activeThreadId,
  profile,
  plan,
  skuCount,
  dashboardActive,
  onToggle,
  onNewThread,
  onSelectThread,
  onDeleteThread,
  onOpenDashboard,
  onOpenSkuCatalog,
  onChangeApprovalMode,
}: ThreadSidebarProps) {
  if (!open && !drawer) {
    return (
      <SidebarRail
        threadCount={threads.length}
        skuCount={skuCount}
        dashboardActive={dashboardActive}
        initials={getInitials(profile.fullName)}
        plan={plan}
        onExpand={onToggle}
        onNewThread={onNewThread}
        onOpenDashboard={onOpenDashboard}
        onOpenSkuCatalog={onOpenSkuCatalog}
      />
    );
  }

  return (
    <aside
      aria-label="Historial y navegación"
      className="no-print flex h-full w-64 shrink-0 flex-col border-r border-line-frost bg-surface-frost backdrop-blur-xl"
    >
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-line-frost px-3.5">
        <BrandMark size="sm" showBadge={false} />
        <button
          type="button"
          onClick={onToggle}
          aria-label={drawer ? 'Cerrar barra lateral' : 'Minimizar barra lateral'}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary"
        >
          {drawer ? <X className="h-4 w-4" aria-hidden="true" /> : <PanelLeftClose className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>

      <div className="shrink-0 space-y-1 border-b border-border-hairline p-3">
        <button
          type="button"
          onClick={onNewThread}
          className="mb-1.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-surface-inverted px-3.5 py-2 text-xs font-semibold text-ink-on-inverted transition-colors hover:bg-surface-inverted-hover active:translate-y-px"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Nuevo chat
        </button>
        <button
          type="button"
          onClick={onOpenDashboard}
          aria-current={dashboardActive ? 'page' : undefined}
          className={`${NAV_BTN} ${
            dashboardActive
              ? 'bg-accent-soft font-semibold text-accent-ink'
              : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
          }`}
        >
          <span className="inline-flex items-center gap-2.5">
            <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
            Dashboard
          </span>
        </button>
        <button
          type="button"
          onClick={onOpenSkuCatalog}
          className={`${NAV_BTN} text-ink-secondary hover:bg-surface-hover hover:text-ink-primary`}
        >
          <span className="inline-flex items-center gap-2.5">
            <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Catálogo SKU
          </span>
          {skuCount > 0 ? (
            <span className="rounded-full bg-surface-subtle px-2 py-0.5 font-mono text-[10px] text-ink-muted tabular-nums">
              {skuCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        <ThreadHistoryList
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={onSelectThread}
          onDeleteThread={onDeleteThread}
        />
      </div>

      <SidebarAccountFooter profile={profile} plan={plan} onChangeApprovalMode={onChangeApprovalMode} />
    </aside>
  );
}
