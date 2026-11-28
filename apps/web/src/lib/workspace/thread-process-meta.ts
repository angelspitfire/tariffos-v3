import type {
  DossierReviewStatus,
  OperationalStatus,
  ProcessItemProgress,
  ProcessKind,
  ProcessScopeFilter,
} from '@tariffos/shared-types';
import type { WorkspaceThread } from './types';

const MS_DAY = 86_400_000;
const MS_48H = 48 * 3_600_000;
const MAX_QUICK_LOOKUPS = 8;

export interface ThreadProcessSnapshot {
  processKind: ProcessKind;
  operationalStatus: OperationalStatus;
  primaryHsCode: string | null;
  itemProgress: ProcessItemProgress | null;
}

export interface SidebarGroupedThreads {
  buckets: {
    today: WorkspaceThread[];
    yesterday: WorkspaceThread[];
    older: WorkspaceThread[];
  };
  recentQuickLookups: WorkspaceThread[];
  activeCount: number;
  sealedCount: number;
}

export interface ProcessHubFilters {
  status?: OperationalStatus | 'all';
  kind?: ProcessKind | 'all';
  clientRef?: string | 'all';
  query?: string;
  includeArchived?: boolean;
  scope?: ProcessScopeFilter;
  currentUserId?: string;
}

/** Derives operational kind, status, HS headline, and batch progress from a thread. */
export function deriveThreadProcessSnapshot(thread: WorkspaceThread): ThreadProcessSnapshot {
  let primaryHsCode = thread.primaryHsCode ?? null;
  let itemProgress = thread.itemProgress ?? null;
  let inferredKind: ProcessKind | null = null;
  let reviewStatus: DossierReviewStatus | null = null;
  let hasQuestionnaire = false;
  let hasCalculator = false;
  let hasCriticalFlag = false;

  for (let i = thread.messages.length - 1; i >= 0; i -= 1) {
    const env = thread.messages[i]?.envelope;
    if (!env) continue;
    if (
      env.inlineComponents.some(
        (c) => c.type === 'legal_notice' && c.severity === 'restricted',
      )
    ) {
      hasCriticalFlag = true;
    }
    const verdict = env.inlineComponents.find((c) => c.type === 'verdict');
    if (verdict && verdict.type === 'verdict') {
      if (!primaryHsCode) primaryHsCode = verdict.hsCode;
      inferredKind ??= 'single_ruling';
    }
    if (env.inlineComponents.some((c) => c.type === 'questionnaire' || c.type === 'disambiguation')) {
      hasQuestionnaire = true;
    }
    for (const canvas of env.canvasComponents) {
      if (canvas.type === 'batch_manifest') {
        const total = canvas.items.length;
        const completed = canvas.items.filter((it) => it.status === 'classified').length;
        const needsInfo = canvas.items.filter((it) => it.status === 'needs_review').length;
        itemProgress = { total, completed, needsInfo };
        primaryHsCode = `Lote · ${total} ítems`;
        inferredKind = 'invoice_batch';
      } else if (canvas.type === 'dossier') {
        if (!primaryHsCode) primaryHsCode = canvas.hsCode;
        reviewStatus ??= canvas.reviewStatus ?? null;
        if (canvas.reviewStatus === 'in_review') hasCriticalFlag = true;
        inferredKind ??= 'single_ruling';
      } else if (canvas.type === 'calculator') {
        hasCalculator = true;
      }
    }
  }

  let processKind: ProcessKind =
    thread.processKind ??
    inferredKind ??
    (hasCriticalFlag ? 'oga_escalation' : hasCalculator ? 'cif_simulation' : 'single_ruling');
  if (processKind === 'quick_lookup' && inferredKind) {
    processKind = inferredKind;
  }

  let operationalStatus: OperationalStatus;
  if (thread.status === 'archived' || thread.operationalStatus === 'archived') {
    operationalStatus = 'archived';
  } else if (reviewStatus === 'approved' || thread.operationalStatus === 'approved') {
    operationalStatus = 'approved';
  } else if (itemProgress && itemProgress.total > 0 && itemProgress.needsInfo === 0 && itemProgress.completed >= itemProgress.total) {
    operationalStatus = 'approved';
  } else if (reviewStatus === 'in_review' || hasCriticalFlag || thread.operationalStatus === 'in_review') {
    operationalStatus = 'in_review';
  } else if (hasQuestionnaire || (itemProgress?.needsInfo ?? 0) > 0 || thread.operationalStatus === 'needs_input') {
    operationalStatus = 'needs_input';
  } else {
    operationalStatus = thread.operationalStatus ?? 'processing';
  }

  return { processKind, operationalStatus, primaryHsCode, itemProgress };
}

function startOfUtcOrLocalDayMs(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function formatRelativeThreadTime(iso: string, nowMs = Date.now()): string {
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return '';
  const diffDays = Math.round((startOfUtcOrLocalDayMs(nowMs) - startOfUtcOrLocalDayMs(ts)) / MS_DAY);
  if (diffDays <= 0) {
    return new Date(ts).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Ayer';
  return new Date(ts).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' });
}

export function groupThreadsForSidebar(
  threads: readonly WorkspaceThread[],
  nowMs = Date.now(),
): SidebarGroupedThreads {
  const buckets = { today: [] as WorkspaceThread[], yesterday: [] as WorkspaceThread[], older: [] as WorkspaceThread[] };
  const recentQuickLookups: WorkspaceThread[] = [];
  let sealedCount = 0;
  const todayStart = startOfUtcOrLocalDayMs(nowMs);

  for (const thread of threads) {
    const snap = deriveThreadProcessSnapshot(thread);
    if (snap.processKind === 'quick_lookup') {
      const ageMs = nowMs - new Date(thread.updatedAt).getTime();
      if (thread.status !== 'archived' && ageMs <= MS_48H && recentQuickLookups.length < MAX_QUICK_LOOKUPS) {
        recentQuickLookups.push(thread);
      }
      continue;
    }
    if (snap.operationalStatus === 'approved') {
      sealedCount += 1;
      continue;
    }
    if (snap.operationalStatus === 'archived') continue;

    const diffDays = Math.round((todayStart - startOfUtcOrLocalDayMs(new Date(thread.updatedAt).getTime())) / MS_DAY);
    if (diffDays <= 0) buckets.today.push(thread);
    else if (diffDays === 1) buckets.yesterday.push(thread);
    else buckets.older.push(thread);
  }

  return {
    buckets,
    recentQuickLookups,
    activeCount: buckets.today.length + buckets.yesterday.length + buckets.older.length,
    sealedCount,
  };
}

export function filterThreadsForProcessHub(
  threads: readonly WorkspaceThread[],
  filters: ProcessHubFilters,
): WorkspaceThread[] {
  const q = filters.query?.trim().toLowerCase() ?? '';
  return threads.filter((thread) => {
    const snap = deriveThreadProcessSnapshot(thread);
    if (snap.processKind === 'quick_lookup') return false;
    if (!filters.includeArchived && snap.operationalStatus === 'archived') return false;
    if (filters.status && filters.status !== 'all' && snap.operationalStatus !== filters.status) return false;
    if (filters.kind && filters.kind !== 'all' && snap.processKind !== filters.kind) return false;
    if (filters.clientRef && filters.clientRef !== 'all' && thread.clientRef !== filters.clientRef) return false;
    if (filters.scope === 'mine' && filters.currentUserId && thread.createdByUserId && thread.createdByUserId !== filters.currentUserId) {
      return false;
    }
    if (filters.scope === 'assigned' && filters.currentUserId && thread.assignedToUserId !== filters.currentUserId) {
      return false;
    }
    if (!q) return true;
    return (
      thread.title.toLowerCase().includes(q) ||
      (snap.primaryHsCode ?? '').toLowerCase().includes(q) ||
      (thread.clientRef ?? '').toLowerCase().includes(q)
    );
  });
}
