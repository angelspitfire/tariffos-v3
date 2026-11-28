import type {
  A2UICanvasComponent,
  A2UIDossierComponent,
  ProcessActivityEvent,
  SkuPrecedent,
  UserProfileSettings,
} from '@tariffos/shared-types';
import { normalizeSkuKey } from './persistence';
import { getInitials } from './thread-meta';
import { deriveThreadProcessSnapshot } from './thread-process-meta';
import type { WorkspaceMessage, WorkspaceThread } from './types';

function withDerivedProcessFields(thread: WorkspaceThread): WorkspaceThread {
  const snap = deriveThreadProcessSnapshot(thread);
  return { ...thread, processKind: snap.processKind, operationalStatus: snap.operationalStatus, primaryHsCode: snap.primaryHsCode, itemProgress: snap.itemProgress };
}

export function appendProcessEventToThread(
  thread: WorkspaceThread,
  event: Omit<ProcessActivityEvent, 'id' | 'createdAt'>,
): WorkspaceThread {
  const entry: ProcessActivityEvent = { ...event, id: `evt-${Date.now()}`, createdAt: new Date().toISOString() };
  return { ...thread, processEvents: [...(thread.processEvents ?? []), entry].slice(-20) };
}

export function getLatestCanvasComponents(thread: WorkspaceThread | null, selectedMessageId: string | null): A2UICanvasComponent[] {
  if (!thread) return [];
  if (selectedMessageId) {
    const selected = thread.messages.find((m) => m.id === selectedMessageId);
    if (selected?.envelope?.canvasComponents.length) return selected.envelope.canvasComponents;
  }
  for (let i = thread.messages.length - 1; i >= 0; i -= 1) {
    const comps = thread.messages[i]?.envelope?.canvasComponents;
    if (comps && comps.length > 0) return comps;
  }
  return [];
}

export function updateDossierInThread(
  thread: WorkspaceThread,
  targetMessageId: string | null,
  updater: (dossier: A2UIDossierComponent) => A2UIDossierComponent,
): WorkspaceThread {
  let updated = false;
  const messages = [...thread.messages];
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (targetMessageId && msg.id !== targetMessageId) continue;
    if (!msg.envelope?.canvasComponents.some((c) => c.type === 'dossier')) continue;
    messages[i] = {
      ...msg,
      envelope: {
        ...msg.envelope,
        canvasComponents: msg.envelope.canvasComponents.map((comp) => (comp.type === 'dossier' ? updater(comp) : comp)),
      },
    };
    updated = true;
    break;
  }
  return updated ? withDerivedProcessFields({ ...thread, messages, updatedAt: new Date().toISOString() }) : thread;
}

export function updateBatchItemInThread(
  thread: WorkspaceThread,
  lineNumber: number,
  update: { hsCode: string; adValoremPercent: number; legalRegime: string; answers: Record<string, string> },
): WorkspaceThread {
  const messages = [...thread.messages];
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (!msg.envelope?.canvasComponents.some((c) => c.type === 'batch_manifest')) continue;
    messages[i] = {
      ...msg,
      envelope: {
        ...msg.envelope,
        canvasComponents: msg.envelope.canvasComponents.map((comp) =>
          comp.type !== 'batch_manifest'
            ? comp
            : {
                ...comp,
                items: comp.items.map((item) =>
                  item.lineNumber === lineNumber
                    ? { ...item, hsCode: update.hsCode, adValoremPercent: update.adValoremPercent, legalRegime: update.legalRegime, operatorAnswers: update.answers, status: 'classified' as const, workflowItemState: 'classified' as const }
                    : item,
                ),
              },
        ),
      },
    };
    return withDerivedProcessFields({ ...thread, messages, updatedAt: new Date().toISOString() });
  }
  return thread;
}

export function buildSkuPrecedentFromMessage(message: WorkspaceMessage, profile: UserProfileSettings): SkuPrecedent | null {
  const verdict = message.envelope?.inlineComponents.find((c) => c.type === 'verdict');
  const dossier = message.envelope?.canvasComponents.find((c) => c.type === 'dossier');
  const hsCode = verdict?.hsCode ?? dossier?.hsCode;
  if (!hsCode) return null;
  const now = new Date().toISOString();
  const title = verdict?.description ?? dossier?.officialDescription ?? 'Mercancía clasificada';
  const rawSku = `SKU-${hsCode.replace(/\D/g, '').slice(0, 6)}`;
  return {
    id: `sku-${Date.now()}`, sku: rawSku, normalizedSku: normalizeSkuKey(rawSku), title, description: title, hsCode,
    jurisdictionId: message.jurisdictionId, adValoremPercent: verdict?.adValoremPercent ?? 0, vatPercent: verdict?.vatPercent ?? 16,
    legalRegime: verdict?.legalRegimeCode ?? 'Libre', approvedBy: profile.fullName, reviewStatus: dossier?.reviewStatus ?? 'approved',
    usageCount: 1, createdAt: now, updatedAt: now,
  };
}

/** Inserts or updates a message inside an active thread (creating one if null). */
export function buildThreadWithExternalMessage(existing: WorkspaceThread | null, threadId: string, message: WorkspaceMessage): WorkspaceThread {
  const verdict = message.envelope?.inlineComponents.find((c) => c.type === 'verdict');
  const titleHint = verdict?.description || message.text.slice(0, 48) || 'Nueva clasificación';
  if (!existing) {
    return withDerivedProcessFields({ id: threadId, title: titleHint, jurisdictionId: message.jurisdictionId, status: 'regular', messagesLoaded: true, messages: [message], createdAt: message.createdAt, updatedAt: message.createdAt });
  }
  const hasMessage = existing.messages.some((m) => m.id === message.id);
  const messages = hasMessage ? existing.messages.map((m) => (m.id === message.id ? message : m)) : [...existing.messages, message];
  return withDerivedProcessFields({ ...existing, messagesLoaded: true, messages, updatedAt: message.createdAt });
}

/** Attaches a durable Eve session ID to an existing thread or initializes a new thread record. */
export function attachEveSessionToThread(existing: WorkspaceThread | null, threadId: string, eveSessionId: string, jurisdictionId: string): WorkspaceThread {
  const now = new Date().toISOString();
  if (!existing) {
    return { id: threadId, title: 'Nueva consulta', jurisdictionId, status: 'regular', processKind: 'quick_lookup', operationalStatus: 'processing', messagesLoaded: true, eveSessionId, messages: [], createdAt: now, updatedAt: now };
  }
  return existing.eveSessionId === eveSessionId ? existing : { ...existing, eveSessionId, updatedAt: now };
}

/** Merges synced streaming Eve turns into a thread while preserving durable sessionId, batch messages, and author attribution. */
export function mergeSyncedMessagesIntoThread(
  existing: WorkspaceThread | null,
  threadId: string,
  synced: readonly WorkspaceMessage[],
  jurisdictionId: string,
  author?: { userId?: string; fullName?: string },
): WorkspaceThread {
  const syncedIds = new Set(synced.map((m) => m.id));
  const existingMsgById = new Map((existing?.messages ?? []).map((m) => [m.id, m]));
  const attributedSynced = synced.map((m) => {
    const prev = existingMsgById.get(m.id);
    if (prev?.authorName || m.authorName || m.role !== 'user' || !author?.fullName) {
      return prev?.authorName ? { ...m, authorUserId: prev.authorUserId, authorName: prev.authorName, authorInitials: prev.authorInitials } : m;
    }
    return { ...m, ...(author.userId ? { authorUserId: author.userId } : {}), authorName: author.fullName, authorInitials: getInitials(author.fullName) };
  });
  const preservedBatch = (existing?.messages ?? []).filter((m) => (m.id.startsWith('msg-batch-') || m.id.startsWith('batch-')) && !syncedIds.has(m.id));
  const messages = [...attributedSynced, ...preservedBatch].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const firstUser = messages.find((m) => m.role === 'user' && m.text.trim());
  const firstVerdict = messages.map((m) => m.envelope?.inlineComponents.find((c) => c.type === 'verdict')).find(Boolean);
  const title = firstVerdict?.description?.slice(0, 56) || firstUser?.text.trim().slice(0, 56) || existing?.title || 'Nueva consulta';
  const now = messages[messages.length - 1]?.createdAt ?? new Date().toISOString();
  return withDerivedProcessFields({
    ...(existing ?? { id: threadId, title, jurisdictionId, status: 'regular' as const, createdAt: messages[0]?.createdAt ?? now }),
    id: threadId, title, jurisdictionId: existing?.jurisdictionId ?? jurisdictionId, status: existing?.status ?? 'regular', messagesLoaded: true, messages, updatedAt: now,
  });
}
