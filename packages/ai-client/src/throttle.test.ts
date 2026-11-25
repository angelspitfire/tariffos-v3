import { afterEach, describe, expect, it, vi } from 'vitest';
import { paceGenerateCall, resetPacing } from './throttle.js';

afterEach(() => {
  resetPacing();
  vi.unstubAllEnvs();
});

describe('paceGenerateCall', () => {
  it('returns immediately when LLM_MAX_RPM is unset', async () => {
    vi.stubEnv('LLM_MAX_RPM', '');
    const started = Date.now();
    await paceGenerateCall();
    expect(Date.now() - started).toBeLessThan(50);
  });

  it('returns immediately when the limit is zero', async () => {
    vi.stubEnv('LLM_MAX_RPM', '0');
    const started = Date.now();
    await paceGenerateCall();
    expect(Date.now() - started).toBeLessThan(50);
  });

  it('spaces consecutive calls when a limit is set', async () => {
    vi.stubEnv('LLM_MAX_RPM', '600'); // one call every 100ms
    const started = Date.now();
    await paceGenerateCall();
    await paceGenerateCall();
    const elapsed = Date.now() - started;
    expect(elapsed).toBeGreaterThanOrEqual(90);
  });

  it('does not delay the first call of a run', async () => {
    vi.stubEnv('LLM_MAX_RPM', '600');
    const started = Date.now();
    await paceGenerateCall();
    expect(Date.now() - started).toBeLessThan(50);
  });
});
