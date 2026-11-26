'use client';

import type { SampleBatchDocument, SampleMerchandise } from '@/lib/workspace/jurisdictions';
import type { WorkspaceThread } from '@/lib/workspace/types';
import { ThreadSidebar } from '../organisms/ThreadSidebar';

export interface WorkspaceSidebarSlotProps {
  desktopOpen: boolean;
  mobileOpen: boolean;
  threads: readonly WorkspaceThread[];
  activeThreadId: string | null;
  onCloseMobile: () => void;
  onNewThread: () => void;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onRunSample: (sample: SampleMerchandise) => void;
  onRunBatchSample: (batch: SampleBatchDocument) => void;
}

export function WorkspaceSidebarSlot({
  desktopOpen,
  mobileOpen,
  threads,
  activeThreadId,
  onCloseMobile,
  onNewThread,
  onSelectThread,
  onDeleteThread,
  onRunSample,
  onRunBatchSample,
}: WorkspaceSidebarSlotProps) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 top-12 z-40 flex lg:hidden">
          <div className="h-full shadow-2xl">
            <ThreadSidebar
              open
              threads={threads}
              activeThreadId={activeThreadId}
              onNewThread={() => {
                onNewThread();
                onCloseMobile();
              }}
              onSelectThread={(id) => {
                onSelectThread(id);
                onCloseMobile();
              }}
              onDeleteThread={onDeleteThread}
              onRunSample={(s) => {
                onCloseMobile();
                onRunSample(s);
              }}
              onRunBatchSample={(b) => {
                onCloseMobile();
                onRunBatchSample(b);
              }}
            />
          </div>
          <button
            type="button"
            aria-label="Cerrar historial"
            onClick={onCloseMobile}
            className="flex-1 bg-black/30 backdrop-blur-[1px]"
          />
        </div>
      )}

      <div className="hidden h-full lg:block">
        <ThreadSidebar
          open={desktopOpen}
          threads={threads}
          activeThreadId={activeThreadId}
          onNewThread={onNewThread}
          onSelectThread={onSelectThread}
          onDeleteThread={onDeleteThread}
          onRunSample={onRunSample}
          onRunBatchSample={onRunBatchSample}
        />
      </div>
    </>
  );
}
