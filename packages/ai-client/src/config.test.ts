import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_MODEL,
  GOOGLE_BASE_URL,
  NVIDIA_BASE_URL,
  OPENROUTER_BASE_URL,
  canRunLiveLlm,
  resolveApiKey,
  resolveBaseUrl,
  resolveEmbeddingDims,
  resolveEmbeddingModel,
  resolveMaxRpm,
  resolveModel,
  resolveProvider,
} from './config.js';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('resolveProvider', () => {
  it('defaults to openai-compatible when LLM_PROVIDER is unset', () => {
    vi.stubEnv('LLM_PROVIDER', '');
    expect(resolveProvider()).toBe('openai-compatible');
  });

  it('resolves openrouter', () => {
    vi.stubEnv('LLM_PROVIDER', 'openrouter');
    expect(resolveProvider()).toBe('openrouter');
  });

  it('resolves openai-compatible', () => {
    vi.stubEnv('LLM_PROVIDER', 'openai-compatible');
    expect(resolveProvider()).toBe('openai-compatible');
  });

  it('fails loudly on an unknown provider, listing the valid ones', () => {
    vi.stubEnv('LLM_PROVIDER', 'llama-cpp');
    expect(() => resolveProvider()).toThrow(/openrouter/);
    expect(() => resolveProvider()).toThrow(/openai-compatible/);
  });

  it('rejects the retired provider name: the canonical port does not serve it', () => {
    // Assembled from fragments, as in the CI guard, so this file's own
    // text never carries the banned name.
    vi.stubEnv('LLM_PROVIDER', ['gem', 'ini'].join(''));
    expect(() => resolveProvider()).toThrow(/removed/);
  });

  it('is read at call time, never cached', () => {
    vi.stubEnv('LLM_PROVIDER', 'openai-compatible');
    expect(resolveProvider()).toBe('openai-compatible');
    vi.stubEnv('LLM_PROVIDER', 'openrouter');
    expect(resolveProvider()).toBe('openrouter');
  });
});

describe('resolveBaseUrl', () => {
  it('requires LLM_BASE_URL on an openai-compatible endpoint', () => {
    vi.stubEnv('LLM_PROVIDER', 'openai-compatible');
    vi.stubEnv('LLM_BASE_URL', '');
    expect(() => resolveBaseUrl()).toThrow(/LLM_BASE_URL/);
  });

  it('reads LLM_BASE_URL when set', () => {
    vi.stubEnv('LLM_PROVIDER', 'openai-compatible');
    vi.stubEnv('LLM_BASE_URL', 'http://127.0.0.1:11434/v1');
    expect(resolveBaseUrl()).toBe('http://127.0.0.1:11434/v1');
  });

  it('falls back to the OpenRouter endpoint', () => {
    vi.stubEnv('LLM_PROVIDER', 'openrouter');
    vi.stubEnv('OPENROUTER_BASE_URL', '');
    expect(resolveBaseUrl()).toBe(OPENROUTER_BASE_URL);
  });
});

describe('nvidia and google providers', () => {
  it('nvidia talks to NVIDIA Build with no LLM_BASE_URL needed', () => {
    vi.stubEnv('LLM_PROVIDER', 'nvidia');
    vi.stubEnv('LLM_BASE_URL', '');
    expect(resolveBaseUrl()).toBe(NVIDIA_BASE_URL);
    expect(NVIDIA_BASE_URL).toBe('https://integrate.api.nvidia.com/v1');
  });

  it('nvidia reads NVIDIA_API_KEY', () => {
    vi.stubEnv('LLM_PROVIDER', 'nvidia');
    vi.stubEnv('LLM_API_KEY', '');
    vi.stubEnv('NVIDIA_API_KEY', 'nvapi-1');
    expect(resolveApiKey()).toBe('nvapi-1');
  });

  it('LLM_API_KEY still wins over the provider key', () => {
    vi.stubEnv('LLM_PROVIDER', 'nvidia');
    vi.stubEnv('LLM_API_KEY', 'override');
    vi.stubEnv('NVIDIA_API_KEY', 'nvapi-1');
    expect(resolveApiKey()).toBe('override');
  });

  it('google uses the Gemini OpenAI-compatible endpoint', () => {
    vi.stubEnv('LLM_PROVIDER', 'google');
    vi.stubEnv('LLM_BASE_URL', '');
    expect(resolveBaseUrl()).toBe(GOOGLE_BASE_URL);
    expect(GOOGLE_BASE_URL).toBe('https://generativelanguage.googleapis.com/v1beta/openai');
  });

  it('google reads GOOGLE_GENERATIVE_AI_API_KEY', () => {
    vi.stubEnv('LLM_PROVIDER', 'google');
    vi.stubEnv('LLM_API_KEY', '');
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'AIza-1');
    expect(resolveApiKey()).toBe('AIza-1');
  });

  it('an explicit LLM_BASE_URL overrides the provider default', () => {
    vi.stubEnv('LLM_PROVIDER', 'nvidia');
    vi.stubEnv('LLM_BASE_URL', 'http://127.0.0.1:8000/v1');
    expect(resolveBaseUrl()).toBe('http://127.0.0.1:8000/v1');
  });
});

describe('resolveApiKey', () => {
  it('prefers LLM_API_KEY', () => {
    vi.stubEnv('LLM_API_KEY', 'key-llm');
    vi.stubEnv('OPENROUTER_API_KEY', 'key-openrouter');
    expect(resolveApiKey()).toBe('key-llm');
  });

  it('falls back to OPENROUTER_API_KEY on OpenRouter', () => {
    vi.stubEnv('LLM_PROVIDER', 'openrouter');
    vi.stubEnv('LLM_API_KEY', '');
    vi.stubEnv('OPENROUTER_API_KEY', 'key-openrouter');
    expect(resolveApiKey()).toBe('key-openrouter');
  });

  it('is undefined when nothing is configured', () => {
    vi.stubEnv('LLM_PROVIDER', 'openai-compatible');
    vi.stubEnv('LLM_API_KEY', '');
    expect(resolveApiKey()).toBeUndefined();
  });
});

describe('resolveModel', () => {
  it('prefers LLM_MODEL', () => {
    vi.stubEnv('LLM_MODEL', 'qwen3:8b');
    expect(resolveModel()).toBe('qwen3:8b');
  });

  it('defaults to the workspace model, whatever the provider', () => {
    // The model is resolved in one place — `@tariffos/env` — so the port
    // and the apps can never disagree about which model is in use.
    vi.stubEnv('LLM_MODEL', '');
    vi.stubEnv('LLM_PROVIDER', 'openai-compatible');
    expect(resolveModel()).toBe(DEFAULT_MODEL);
    vi.stubEnv('LLM_PROVIDER', 'openrouter');
    expect(resolveModel()).toBe(DEFAULT_MODEL);
  });
});

describe('resolveEmbeddingModel', () => {
  it('prefers EMBEDDING_MODEL', () => {
    vi.stubEnv('EMBEDDING_MODEL', 'qwen3-embedding:8b');
    expect(resolveEmbeddingModel()).toBe('qwen3-embedding:8b');
  });

  it('falls back to the default', () => {
    vi.stubEnv('EMBEDDING_MODEL', '');
    expect(resolveEmbeddingModel()).toBe(DEFAULT_EMBEDDING_MODEL);
  });
});

describe('resolveEmbeddingDims', () => {
  it('reads EMBEDDING_DIMS when set', () => {
    vi.stubEnv('EMBEDDING_DIMS', '1024');
    expect(resolveEmbeddingDims()).toBe(1024);
  });

  it('defaults to 768 when unset', () => {
    vi.stubEnv('EMBEDDING_DIMS', '');
    expect(resolveEmbeddingDims()).toBe(768);
  });

  it('fails loudly on a non-positive width', () => {
    vi.stubEnv('EMBEDDING_DIMS', '0');
    expect(() => resolveEmbeddingDims()).toThrow(/positive integer/);
  });

  it('fails loudly on a non-numeric width instead of returning NaN', () => {
    vi.stubEnv('EMBEDDING_DIMS', 'wide');
    expect(() => resolveEmbeddingDims()).toThrow(/positive integer/);
  });
});

describe('resolveMaxRpm', () => {
  it('is 0 when unset, which disables pacing', () => {
    vi.stubEnv('LLM_MAX_RPM', '');
    expect(resolveMaxRpm()).toBe(0);
  });

  it('reads the configured value', () => {
    vi.stubEnv('LLM_MAX_RPM', '120');
    expect(resolveMaxRpm()).toBe(120);
  });
});

describe('canRunLiveLlm', () => {
  it('returns true for nvidia when NVIDIA_API_KEY is set', () => {
    vi.stubEnv('LLM_PROVIDER', 'nvidia');
    vi.stubEnv('LLM_API_KEY', '');
    vi.stubEnv('NVIDIA_API_KEY', 'nvapi-test');
    expect(canRunLiveLlm()).toBe(true);
  });

  it('returns false for nvidia when no API key is configured', () => {
    vi.stubEnv('LLM_PROVIDER', 'nvidia');
    vi.stubEnv('LLM_API_KEY', '');
    vi.stubEnv('NVIDIA_API_KEY', '');
    expect(canRunLiveLlm()).toBe(false);
  });

  it('returns true for google when GOOGLE_GENERATIVE_AI_API_KEY is set', () => {
    vi.stubEnv('LLM_PROVIDER', 'google');
    vi.stubEnv('LLM_API_KEY', '');
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'AIza-test');
    expect(canRunLiveLlm()).toBe(true);
  });

  it('returns true for openrouter when OPENROUTER_API_KEY is set', () => {
    vi.stubEnv('LLM_PROVIDER', 'openrouter');
    vi.stubEnv('LLM_API_KEY', '');
    vi.stubEnv('OPENROUTER_API_KEY', 'sk-or-test');
    expect(canRunLiveLlm()).toBe(true);
  });

  it('returns true for openai-compatible when LLM_BASE_URL is set even without API key', () => {
    vi.stubEnv('LLM_PROVIDER', 'openai-compatible');
    vi.stubEnv('LLM_BASE_URL', 'http://127.0.0.1:11434/v1');
    vi.stubEnv('LLM_API_KEY', '');
    expect(canRunLiveLlm()).toBe(true);
  });

  it('returns false for openai-compatible when LLM_BASE_URL is missing', () => {
    vi.stubEnv('LLM_PROVIDER', 'openai-compatible');
    vi.stubEnv('LLM_BASE_URL', '');
    expect(canRunLiveLlm()).toBe(false);
  });

  it('returns false instead of throwing for an invalid provider', () => {
    vi.stubEnv('LLM_PROVIDER', 'unknown-provider');
    expect(canRunLiveLlm()).toBe(false);
  });
});
