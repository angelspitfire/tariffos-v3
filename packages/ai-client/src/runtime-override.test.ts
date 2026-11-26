import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { z } from 'zod';
import { generateObject, generateText } from 'ai';
import {
  GOOGLE_BASE_URL,
  NVIDIA_BASE_URL,
  OPENROUTER_BASE_URL,
  canRunLiveLlmForProvider,
  listConfiguredLlmProviders,
  resolveApiKeyForProvider,
  resolveBaseUrlForProvider,
} from './config.js';
import { OpenAICompatibleAdapter, type ProviderLike } from './adapters/openai-compatible.js';
import { getLlmProvider, resetProviderKind } from './factory.js';

vi.mock('ai', () => ({
  generateText: vi.fn(),
  generateObject: vi.fn(),
  embed: vi.fn(),
  streamText: vi.fn(),
}));

const mockedObject = generateObject as unknown as Mock;
const mockedText = generateText as unknown as Mock;

function fakeProvider(): ProviderLike {
  return {
    chatModel: (modelId) => ({ id: modelId }) as never,
    textEmbeddingModel: (modelId) => ({ id: modelId }) as never,
  };
}

beforeEach(() => {
  mockedObject.mockReset();
  mockedText.mockReset();
  resetProviderKind();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('provider-scoped config resolvers', () => {
  it('resolves provider-specific base URLs and honors explicit override', () => {
    vi.stubEnv('LLM_BASE_URL', '');
    vi.stubEnv('OPENROUTER_BASE_URL', '');
    expect(resolveBaseUrlForProvider('nvidia')).toBe(NVIDIA_BASE_URL);
    expect(resolveBaseUrlForProvider('google')).toBe(GOOGLE_BASE_URL);
    expect(resolveBaseUrlForProvider('openrouter')).toBe(OPENROUTER_BASE_URL);
    expect(resolveBaseUrlForProvider('openai-compatible', 'http://localhost:11434/v1')).toBe(
      'http://localhost:11434/v1',
    );
  });

  it('resolves provider-specific API keys without leaking across unrelated providers', () => {
    vi.stubEnv('LLM_PROVIDER', 'nvidia');
    vi.stubEnv('LLM_API_KEY', '');
    vi.stubEnv('NVIDIA_API_KEY', 'nvapi-123');
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'AIza-456');
    vi.stubEnv('OPENROUTER_API_KEY', '');

    expect(resolveApiKeyForProvider('nvidia')).toBe('nvapi-123');
    expect(resolveApiKeyForProvider('google')).toBe('AIza-456');
    expect(resolveApiKeyForProvider('openrouter')).toBeUndefined();
    expect(canRunLiveLlmForProvider('google')).toBe(true);
    expect(canRunLiveLlmForProvider('openrouter')).toBe(false);
  });

  it('lists provider availability without exposing secret key values', () => {
    vi.stubEnv('LLM_PROVIDER', 'nvidia');
    vi.stubEnv('LLM_API_KEY', '');
    vi.stubEnv('LLM_BASE_URL', '');
    vi.stubEnv('NVIDIA_API_KEY', 'nvapi-secret');
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', '');
    vi.stubEnv('OPENROUTER_API_KEY', 'sk-or-secret');

    const providers = listConfiguredLlmProviders();
    expect(providers.find((p) => p.provider === 'nvidia')?.configured).toBe(true);
    expect(providers.find((p) => p.provider === 'openrouter')?.configured).toBe(true);
    expect(providers.find((p) => p.provider === 'google')?.configured).toBe(false);
    expect(JSON.stringify(providers)).not.toContain('nvapi-secret');
    expect(JSON.stringify(providers)).not.toContain('sk-or-secret');
  });
});

describe('OpenAICompatibleAdapter per-instance runtime override', () => {
  const schema = z.object({ ok: z.boolean() });

  it('uses direct text+repair when instance override sets provider to nvidia even if env is google', async () => {
    vi.stubEnv('LLM_PROVIDER', 'google');
    mockedText.mockResolvedValueOnce({ text: '<think>step</think>{"ok":true}' });
    const inst = new OpenAICompatibleAdapter(fakeProvider, { provider: 'nvidia' });
    expect(await inst.generateJson('hi', schema)).toEqual({ ok: true });
    expect(mockedObject).not.toHaveBeenCalled();
    expect(mockedText).toHaveBeenCalledTimes(1);
  });

  it('uses generateObject when instance override sets provider to google even if env is nvidia', async () => {
    vi.stubEnv('LLM_PROVIDER', 'nvidia');
    mockedObject.mockResolvedValueOnce({ object: { ok: true } });
    const inst = new OpenAICompatibleAdapter(fakeProvider, { provider: 'google' });
    expect(await inst.generateJson('hi', schema)).toEqual({ ok: true });
    expect(mockedObject).toHaveBeenCalledTimes(1);
  });

  it('getLlmProvider accepts a runtime override without mutating env', () => {
    vi.stubEnv('LLM_PROVIDER', 'nvidia');
    const provider = getLlmProvider({ provider: 'google' });
    expect(provider).toBeInstanceOf(OpenAICompatibleAdapter);
    expect(process.env.LLM_PROVIDER).toBe('nvidia');
  });
});
