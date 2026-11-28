import { describe, expect, it } from 'vitest';
import {
  assertE2EEmail,
  buildE2EEmail,
  sanitizeRunId,
} from '../../../../../scripts/lib/e2e-account-helpers.mjs';

describe('E2E Account Isolation Guards', () => {
  it('accepts strictly scoped e2e.*@tariffos.internal emails', () => {
    expect(() => assertE2EEmail('e2e.pr-42@tariffos.internal')).not.toThrow();
    expect(() => assertE2EEmail('E2E.run_123@tariffos.internal')).not.toThrow();
  });

  it('rejects real domains, missing e2e prefix, or lookalike suffixes', () => {
    expect(() => assertE2EEmail('user@gmail.com')).toThrow(/tariffos\.internal/);
    expect(() => assertE2EEmail('admin@tariffos.app')).toThrow(/tariffos\.internal/);
    expect(() => assertE2EEmail('other@tariffos.internal')).toThrow(/e2e\./);
    expect(() => assertE2EEmail('e2e.x@tariffos.internal.evil.com')).toThrow(/tariffos\.internal/);
  });

  it('builds deterministic e2e emails from run IDs and rejects unsafe IDs', () => {
    expect(buildE2EEmail('12345')).toBe('e2e.run-12345@tariffos.internal');
    expect(sanitizeRunId('PR #42 / Attempt 1')).toBe('pr-42-attempt-1');
    expect(() => buildE2EEmail('')).toThrow();
    expect(() => sanitizeRunId('---')).toThrow();
  });
});
