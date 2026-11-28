import { deriveThreadProcessSnapshot, formatRelativeThreadTime } from './thread-process-meta';
import type { WorkspaceThread } from './types';

export interface ThreadMeta {
  /** HS code of the latest verdict, or a batch summary label. */
  headline: string | null;
  timeLabel: string;
}

export function getThreadMeta(thread: WorkspaceThread, nowMs = Date.now()): ThreadMeta {
  const snapshot = deriveThreadProcessSnapshot(thread);
  return {
    headline: snapshot.primaryHsCode,
    timeLabel: formatRelativeThreadTime(thread.updatedAt, nowMs),
  };
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
  return initials || 'TA';
}
