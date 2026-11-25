import { describe, expect, it } from 'vitest';

import { intakeResult, type IntakeStatus } from './status.js';

const STATUSES: IntakeStatus[] = [
  'ok',
  'needs-more-info',
  'conflict-unresolved',
  'unsupported',
  'unreadable',
];

describe('IntakeStatus (F2-29)', () => {
  it.each(STATUSES)('mapea %s a código de error y HTTP', (status) => {
    const result = intakeResult(status);
    expect(result.status).toBe(status);
    expect(result.errorCode).toMatch(/^INTAKE_/);
    expect(result.httpStatus).toBeGreaterThanOrEqual(200);
    expect(result.httpStatus).toBeLessThanOrEqual(599);
    expect(typeof result.message).toBe('string');
    expect(result.message.length).toBeGreaterThan(0);
  });

  it('ok → 200, INTAKE_OK', () => {
    const result = intakeResult('ok');
    expect(result.errorCode).toBe('INTAKE_OK');
    expect(result.httpStatus).toBe(200);
  });

  it('needs-more-info → 400', () => {
    const result = intakeResult('needs-more-info');
    expect(result.errorCode).toBe('INTAKE_NEEDS_MORE_INFO');
    expect(result.httpStatus).toBe(400);
  });

  it('conflict-unresolved → 409', () => {
    const result = intakeResult('conflict-unresolved');
    expect(result.errorCode).toBe('INTAKE_CONFLICT_UNRESOLVED');
    expect(result.httpStatus).toBe(409);
  });

  it('unsupported → 422', () => {
    const result = intakeResult('unsupported');
    expect(result.errorCode).toBe('INTAKE_UNSUPPORTED');
    expect(result.httpStatus).toBe(422);
  });

  it('unreadable → 422', () => {
    const result = intakeResult('unreadable');
    expect(result.errorCode).toBe('INTAKE_UNREADABLE');
    expect(result.httpStatus).toBe(422);
  });

  it('message no es copy de interfaz: solo texto plano', () => {
    const result = intakeResult('needs-more-info');
    expect(result.message).not.toContain('¿');
    expect(result.message).not.toContain('pregunta');
  });
});
