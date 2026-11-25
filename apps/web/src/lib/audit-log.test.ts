import { describe, it, expect } from 'vitest';
import {
  createAuditEntry,
  formatAuditActor,
  formatAuditDiff,
} from './audit-log';

describe('audit-log lib', () => {
  it('creates an audit entry with generated id and timestamp', () => {
    const entry = createAuditEntry(
      'broker',
      'Modificación de partida',
      'Cambio de código arancelario en ítem 3',
      { before: '8504.40.90.00', after: '8504.40.90.90' }
    );

    expect(entry.id).toBeDefined();
    expect(entry.actor).toBe('broker');
    expect(entry.action).toBe('Modificación de partida');
    expect(entry.details).toContain('ítem 3');
    expect(entry.diff?.before).toBe('8504.40.90.00');
    expect(entry.diff?.after).toBe('8504.40.90.90');
    expect(entry.timestamp).toBeDefined();
  });

  it('formats actor labels correctly in Spanish', () => {
    expect(formatAuditActor('broker')).toBe('Agente Aduanal');
    expect(formatAuditActor('system')).toBe('Sistema');
    expect(formatAuditActor('ai')).toBe('Asistente IA');
  });

  it('formats diff strings correctly', () => {
    const formatted = formatAuditDiff({ before: '10%', after: '5%' });
    expect(formatted).toBe('10% → 5%');

    const empty = formatAuditDiff(undefined);
    expect(empty).toBe('');
  });
});
