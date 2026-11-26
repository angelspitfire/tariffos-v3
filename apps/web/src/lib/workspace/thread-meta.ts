import type { WorkspaceThread } from './types';

export interface ThreadMeta {
  /** HS code of the latest verdict, or a batch summary label. */
  headline: string | null;
  timeLabel: string;
}

export function getThreadMeta(thread: WorkspaceThread): ThreadMeta {
  let headline: string | null = null;
  for (let i = thread.messages.length - 1; i >= 0; i--) {
    const env = thread.messages[i]?.envelope;
    const verdict = env?.inlineComponents.find((c) => c.type === 'verdict');
    if (verdict && verdict.type === 'verdict') {
      headline = verdict.hsCode;
      break;
    }
    const batch = env?.canvasComponents.find((c) => c.type === 'batch_manifest');
    if (batch && batch.type === 'batch_manifest') {
      headline = `Lote · ${batch.items.length} ítems`;
      break;
    }
  }
  const timeLabel = new Date(thread.updatedAt).toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { headline, timeLabel };
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
  return initials || 'TA';
}
