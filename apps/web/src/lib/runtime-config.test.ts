import { afterEach, describe, expect, it } from 'vitest';
import { getAgentRuntimeMode, getEveBaseUrl } from './runtime-config';

describe('runtime-config (agent runtime flag)', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('defaults to sse when NEXT_PUBLIC_AGENT_RUNTIME is unset or unknown', () => {
    delete process.env.NEXT_PUBLIC_AGENT_RUNTIME;
    expect(getAgentRuntimeMode(true)).toBe('sse');

    process.env.NEXT_PUBLIC_AGENT_RUNTIME = 'unknown';
    expect(getAgentRuntimeMode(true)).toBe('sse');
  });

  it('returns eve when NEXT_PUBLIC_AGENT_RUNTIME=eve and cloud mode is enabled', () => {
    process.env.NEXT_PUBLIC_AGENT_RUNTIME = 'eve';
    expect(getAgentRuntimeMode(true)).toBe('eve');

    process.env.NEXT_PUBLIC_AGENT_RUNTIME = ' EVE ';
    expect(getAgentRuntimeMode(true)).toBe('eve');
  });

  it('forces sse when cloud mode is disabled even if NEXT_PUBLIC_AGENT_RUNTIME=eve', () => {
    process.env.NEXT_PUBLIC_AGENT_RUNTIME = 'eve';
    expect(getAgentRuntimeMode(false)).toBe('sse');
  });

  it('resolves getEveBaseUrl with empty string default or trimmed override', () => {
    delete process.env.NEXT_PUBLIC_EVE_URL;
    expect(getEveBaseUrl()).toBe('');

    process.env.NEXT_PUBLIC_EVE_URL = '  https://eve.example.com  ';
    expect(getEveBaseUrl()).toBe('https://eve.example.com');
  });
});
