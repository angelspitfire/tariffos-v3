import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getFakeProvider,
  getLlmProvider,
  resetProviderKind,
  setProviderKind,
} from './factory.js';

const ENV_KEYS = ['LLM_PROVIDER', 'LLM_BASE_URL', 'LLM_API_KEY'];

afterEach(() => {
  resetProviderKind();
  for (const key of ENV_KEYS) vi.stubEnv(key, '');
});

describe('getLlmProvider', () => {
  it('returns a provider with generateText, generateJson and embedText', () => {
    const provider = getLlmProvider();
    expect(typeof provider.generateText).toBe('function');
    expect(typeof provider.generateJson).toBe('function');
    expect(typeof provider.embedText).toBe('function');
  });

  it('reads the provider from the environment on every call', () => {
    vi.stubEnv('LLM_PROVIDER', 'openai-compatible');
    vi.stubEnv('LLM_BASE_URL', 'http://127.0.0.1:11434/v1');
    const first = getLlmProvider();
    vi.stubEnv('LLM_PROVIDER', 'openrouter');
    const second = getLlmProvider();
    // A different provider was resolved without any restart.
    expect(first).not.toBe(second);
  });

  it('fails loudly on an unknown provider instead of falling back', () => {
    vi.stubEnv('LLM_PROVIDER', 'llama-cpp');
    expect(() => getLlmProvider()).toThrow(/openrouter/);
  });

  it('fails with a clear message when the endpoint is not configured', async () => {
    vi.stubEnv('LLM_PROVIDER', 'openai-compatible');
    vi.stubEnv('LLM_BASE_URL', '');
    const provider = getLlmProvider();
    await expect(provider.generateText('hola')).rejects.toThrow(/LLM_BASE_URL/);
  });

  it('never touches the network while constructing the provider', () => {
    vi.stubEnv('LLM_PROVIDER', 'openai-compatible');
    vi.stubEnv('LLM_BASE_URL', '');
    expect(() => getLlmProvider()).not.toThrow();
  });
});

describe('the fake', () => {
  it('is selectable explicitly for tests', async () => {
    setProviderKind('fake');
    const provider = getLlmProvider();
    expect(await provider.generateText('hola')).toContain('hola');
  });

  it('is not reachable through the environment', () => {
    vi.stubEnv('LLM_PROVIDER', 'fake');
    expect(() => getLlmProvider()).toThrow(/openrouter/);
  });

  it('goes back to the environment after a reset', () => {
    setProviderKind('fake');
    resetProviderKind();
    vi.stubEnv('LLM_PROVIDER', 'openai-compatible');
    expect(getLlmProvider()).not.toBeUndefined();
  });

  it('is handed over directly when the test needs to program it', async () => {
    const fake = getFakeProvider();
    expect(fake.calls).toHaveLength(0);
    await fake.generateText('hola');
    expect(fake.calls).toHaveLength(1);
  });
});
