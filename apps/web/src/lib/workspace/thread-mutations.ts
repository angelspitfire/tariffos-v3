import type {
  A2UICanvasComponent,
  A2UIDossierComponent,
  SkuPrecedent,
  UserProfileSettings,
} from '@tariffos/shared-types';
import { normalizeSkuKey } from './persistence';
import type { WorkspaceMessage, WorkspaceThread } from './types';

export function getLatestCanvasComponents(
  thread: WorkspaceThread | null,
  selectedMessageId: string | null
): A2UICanvasComponent[] {
  if (!thread) return [];
  if (selectedMessageId) {
    const selected = thread.messages.find((m) => m.id === selectedMessageId);
    if (selected?.envelope?.canvasComponents.length) {
      return selected.envelope.canvasComponents;
    }
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
  updater: (dossier: A2UIDossierComponent) => A2UIDossierComponent
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
        canvasComponents: msg.envelope.canvasComponents.map((comp) =>
          comp.type === 'dossier' ? updater(comp) : comp
        ),
      },
    };
    updated = true;
    break;
  }

  return updated ? { ...thread, messages, updatedAt: new Date().toISOString() } : thread;
}

export function updateBatchItemInThread(
  thread: WorkspaceThread,
  lineNumber: number,
  update: {
    hsCode: string;
    adValoremPercent: number;
    legalRegime: string;
    answers: Record<string, string>;
  }
): WorkspaceThread {
  const messages = [...thread.messages];
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (!msg.envelope?.canvasComponents.some((c) => c.type === 'batch_manifest')) continue;
    messages[i] = {
      ...msg,
      envelope: {
        ...msg.envelope,
        canvasComponents: msg.envelope.canvasComponents.map((comp) => {
          if (comp.type !== 'batch_manifest') return comp;
          return {
            ...comp,
            items: comp.items.map((item) =>
              item.lineNumber === lineNumber
                ? {
                    ...item,
                    hsCode: update.hsCode,
                    adValoremPercent: update.adValoremPercent,
                    legalRegime: update.legalRegime,
                    operatorAnswers: update.answers,
                    status: 'classified' as const,
                    workflowItemState: 'classified' as const,
                  }
                : item
            ),
          };
        }),
      },
    };
    return { ...thread, messages, updatedAt: new Date().toISOString() };
  }
  return thread;
}

export function buildSkuPrecedentFromMessage(
  message: WorkspaceMessage,
  profile: UserProfileSettings
): SkuPrecedent | null {
  const verdict = message.envelope?.inlineComponents.find((c) => c.type === 'verdict');
  const dossier = message.envelope?.canvasComponents.find((c) => c.type === 'dossier');
  const hsCode = verdict?.hsCode ?? dossier?.hsCode;
  if (!hsCode) return null;

  const now = new Date().toISOString();
  const title = verdict?.description ?? dossier?.officialDescription ?? 'Mercancía clasificada';
  const rawSku = `SKU-${hsCode.replace(/\D/g, '').slice(0, 6)}`;

  return {
    id: `sku-${Date.now()}`,
    sku: rawSku,
    normalizedSku: normalizeSkuKey(rawSku),
    title,
    description: title,
    hsCode,
    jurisdictionId: message.jurisdictionId,
    adValoremPercent: verdict?.adValoremPercent ?? 0,
    vatPercent: verdict?.vatPercent ?? 16,
    legalRegime: verdict?.legalRegimeCode ?? 'Libre',
    approvedBy: profile.fullName,
    reviewStatus: dossier?.reviewStatus ?? 'approved',
    usageCount: 1,
    createdAt: now,
    updatedAt: now,
  };
}

/** Inserts or updates a message inside an active thread (creating one if null). */
export function buildThreadWithExternalMessage(
  existing: WorkspaceThread | null,
  threadId: string,
  message: WorkspaceMessage,
): WorkspaceThread {
  const verdict = message.envelope?.inlineComponents.find((c) => c.type === 'verdict');
  const titleHint = verdict?.description || message.text.slice(0, 48) || 'Nueva clasificación';

  if (!existing) {
    return {
      id: threadId,
      title: titleHint,
      jurisdictionId: message.jurisdictionId,
      status: 'regular',
      messages: [message],
      createdAt: message.createdAt,
      updatedAt: message.createdAt,
    };
  }

  const hasMessage = existing.messages.some((m) => m.id === message.id);
  const messages = hasMessage
    ? existing.messages.map((m) => (m.id === message.id ? message : m))
    : [...existing.messages, message];

  return {
    ...existing,
    messages,
    updatedAt: message.createdAt,
  };
}
