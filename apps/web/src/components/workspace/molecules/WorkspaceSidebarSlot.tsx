'use client';

import type { ApprovalWorkflowMode, UserProfileSettings } from '@tariffos/shared-types';
import type { WorkspacePlanStatus } from '@/lib/workspace/plan-status';
import type { WorkspaceThread } from '@/lib/workspace/types';
import { ThreadSidebar } from '../organisms/ThreadSidebar';

export interface WorkspaceSidebarSlotProps {
  desktopOpen: boolean;
  mobileOpen: boolean;
  threads: readonly WorkspaceThread[];
  threadsLoading?: boolean;
  activeThreadId: string | null;
  profile: UserProfileSettings;
  plan: WorkspacePlanStatus;
  skuCount: number;
  dashboardActive: boolean;
  onToggleDesktop: () => void;
  onCloseMobile: () => void;
  onNewThread: () => void;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onOpenDashboard: () => void;
  onOpenSkuCatalog: () => void;
  onOpenSettings?: () => void;
  onChangeApprovalMode: (mode: ApprovalWorkflowMode) => void;
}

/** Renders the persistent desktop sidebar (expanded or rail) and the mobile slide-over drawer. */
export function WorkspaceSidebarSlot({
  desktopOpen,
  mobileOpen,
  onToggleDesktop,
  onCloseMobile,
  onNewThread,
  onSelectThread,
  onOpenDashboard,
  onOpenSkuCatalog,
  ...shared
}: WorkspaceSidebarSlotProps) {
  return (
    <>
      <div className="hidden h-full lg:block">
        <ThreadSidebar
          {...shared}
          open={desktopOpen}
          onToggle={onToggleDesktop}
          onNewThread={onNewThread}
          onSelectThread={onSelectThread}
          onOpenDashboard={onOpenDashboard}
          onOpenSkuCatalog={onOpenSkuCatalog}
        />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 flex lg:hidden" aria-label="Chats de despacho">
          <div className="h-full shadow-2xl">
            <ThreadSidebar
              {...shared}
              open
              drawer
              onToggle={onCloseMobile}
              onNewThread={() => {
                onNewThread();
                onCloseMobile();
              }}
              onSelectThread={(id) => {
                onSelectThread(id);
                onCloseMobile();
              }}
              onOpenDashboard={() => {
                onOpenDashboard();
                onCloseMobile();
              }}
              onOpenSkuCatalog={() => {
                onOpenSkuCatalog();
                onCloseMobile();
              }}
            />
          </div>
          <button
            type="button"
            aria-label="Cerrar historial"
            onClick={onCloseMobile}
            className="flex-1 bg-slate-950/40 backdrop-blur-[1px]"
          />
        </div>
      ) : null}
    </>
  );
}
