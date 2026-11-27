import { afterEach, describe, expect, it } from 'vitest';
import { getAgentRuntimeMode, getEveBaseUrl } from './runtime-config';

describe('runtime-config (Eve sole chat runtime)', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('defaults to eve when NEXT_PUBLIC_AGENT_RUNTIME is unset or set to eve', () => {
    delete process.env.NEXT_PUBLIC_AGENT_RUNTIME;
    expect(getAgentRuntimeMode()).toBe('eve');

    process.env.NEXT_PUBLIC_AGENT_RUNTIME = 'eve';
    expect(getAgentRuntimeMode()).toBe('eve');

    process.env.NEXT_PUBLIC_AGENT_RUNTIME = ' EVE ';
    expect(getAgentRuntimeMode()).toBe('eve');
  });

  it('keeps eve as the active chat runtime regardless of cloud mode flag', () => {
    delete process.env.NEXT_PUBLIC_AGENT_RUNTIME;
    expect(getAgentRuntimeMode(false)).toBe('eve');
    expect(getAgentRuntimeMode(true)).toBe('eve');
  });

  it('resolves getEveBaseUrl with empty string default or trimmed override', () => {
    delete process.env.NEXT_PUBLIC_EVE_URL;
    expect(getEveBaseUrl()).toBe('');

    process.env.NEXT_PUBLIC_EVE_URL = '  http://127.0.0.1:2000  ';
    expect(getEveBaseUrl()).toBe('http://127.0.0.1:2000');
  });
});
