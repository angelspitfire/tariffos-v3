export type AuditActor = 'system' | 'broker' | 'ai';

export interface AuditDiff {
  before: string;
  after: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: AuditActor;
  action: string;
  details: string;
  diff?: AuditDiff;
}

export function createAuditEntry(
  actor: AuditActor,
  action: string,
  details: string,
  diff?: AuditDiff
): AuditLogEntry {
  const timeString = new Date().toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: timeString,
    actor,
    action,
    details,
    diff,
  };
}

export function formatAuditActor(actor: AuditActor): string {
  switch (actor) {
    case 'broker':
      return 'Agente Aduanal';
    case 'system':
      return 'Sistema';
    case 'ai':
      return 'Asistente IA';
  }
}

export function formatAuditDiff(diff?: AuditDiff): string {
  if (!diff) return '';
  return `${diff.before} → ${diff.after}`;
}
