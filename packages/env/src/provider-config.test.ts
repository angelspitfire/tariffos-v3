import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_EMBEDDING_DIMS,
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_MODEL,
  DEFAULT_LLM_PROVIDER,
  embeddingBaseUrl,
  embeddingDims,
  embeddingModel,
  llmApiKey,
  llmBaseUrl,
  llmModel,
  llmProvider,
  visionModel,
} from './index.js';
import { restoreEnv, stubEnv } from './stub-env.js';

afterEach(restoreEnv);

describe('provider-agnostic AI configuration', () => {
  describe('llmProvider', () => {
    it('defaults to openai-compatible when LLM_PROVIDER is unset', () => {
      stubEnv({ LLM_PROVIDER: undefined });
      expect(llmProvider()).toBe('openai-compatible');
    });

    it('selects openrouter on demand', () => {
      stubEnv({ LLM_PROVIDER: 'openrouter' });
      expect(llmProvider()).toBe('openrouter');
    });

    it('selects openai-compatible on demand', () => {
      stubEnv({ LLM_PROVIDER: 'openai-compatible' });
      expect(llmProvider()).toBe('openai-compatible');
    });

    it('selects nvidia (NVIDIA Build / NIM) on demand', () => {
      stubEnv({ LLM_PROVIDER: 'nvidia' });
      expect(llmProvider()).toBe('nvidia');
    });

    it('selects google (Gemini API) on demand', () => {
      stubEnv({ LLM_PROVIDER: 'google' });
      expect(llmProvider()).toBe('google');
    });

    it('trims surrounding whitespace before matching', () => {
      stubEnv({ LLM_PROVIDER: '  openrouter  ' });
      expect(llmProvider()).toBe('openrouter');
    });

    it('treats a blank value as unset', () => {
      stubEnv({ LLM_PROVIDER: '   ' });
      expect(llmProvider()).toBe(DEFAULT_LLM_PROVIDER);
    });

    it('fails fast on an unknown provider name', () => {
      stubEnv({ LLM_PROVIDER: 'openai' });
      expect(() => llmProvider()).toThrow(
        "LLM_PROVIDER must be 'openrouter' | 'openai-compatible' | 'nvidia' | 'google' (got \"openai\").",
      );
    });

    it('rejects the retired provider name: the workspace no longer speaks it', () => {
      // A deployment still configured for the retired provider has to know
      // that its provider is gone, rather than silently getting a different
      // one. The banned value is assembled from fragments, as in the CI
      // guard: the scan must never be defeated by this file's own text.
      const retired = ['gem', 'ini'].join('');
      stubEnv({ LLM_PROVIDER: retired });
      expect(() => llmProvider()).toThrow(/removed/);
    });

    it('is read per call, not cached', () => {
      stubEnv({ LLM_PROVIDER: undefined });
      expect(llmProvider()).toBe('openai-compatible');
      stubEnv({ LLM_PROVIDER: 'openrouter' });
      expect(llmProvider()).toBe('openrouter');
    });
  });

  it('reads base URL and API key as optional trimmed strings', () => {
    stubEnv({ LLM_BASE_URL: '  ', LLM_API_KEY: undefined });
    expect(llmBaseUrl()).toBeUndefined();
    expect(llmApiKey()).toBeUndefined();
    stubEnv({ LLM_BASE_URL: ' http://127.0.0.1:11434/v1 ', LLM_API_KEY: ' sk-or-x ' });
    expect(llmBaseUrl()).toBe('http://127.0.0.1:11434/v1');
    expect(llmApiKey()).toBe('sk-or-x');
  });

  describe('llmModel', () => {
    it('prefers LLM_MODEL', () => {
      stubEnv({ LLM_MODEL: 'qwen3:8b' });
      expect(llmModel()).toBe('qwen3:8b');
    });

    it('falls back to the workspace default when unset', () => {
      stubEnv({ LLM_MODEL: undefined });
      expect(llmModel()).toBe(DEFAULT_MODEL);
    });
  });

  describe('visionModel', () => {
    it('defaults to the text model', () => {
      stubEnv({ VISION_MODEL: undefined, LLM_MODEL: 'qwen3:8b' });
      expect(visionModel()).toBe('qwen3:8b');
    });

    it('is overridable per deployment', () => {
      stubEnv({ VISION_MODEL: 'qwen3-vl:8b' });
      expect(visionModel()).toBe('qwen3-vl:8b');
    });
  });

  describe('embedding resolvers', () => {
    it('embeddingBaseUrl falls back to LLM_BASE_URL (same host serves both)', () => {
      stubEnv({ EMBEDDING_BASE_URL: undefined, LLM_BASE_URL: 'http://host:11434/v1' });
      expect(embeddingBaseUrl()).toBe('http://host:11434/v1');
      stubEnv({ EMBEDDING_BASE_URL: 'http://gpu-host:11434/v1' });
      expect(embeddingBaseUrl()).toBe('http://gpu-host:11434/v1');
    });

    it('embeddingModel defaults to the stored model and honors EMBEDDING_MODEL', () => {
      stubEnv({ EMBEDDING_MODEL: undefined });
      expect(embeddingModel()).toBe(DEFAULT_EMBEDDING_MODEL);
      stubEnv({ EMBEDDING_MODEL: 'qwen3-embedding:8b' });
      expect(embeddingModel()).toBe('qwen3-embedding:8b');
    });

    it('embeddingDims defaults to 768 and reads EMBEDDING_DIMS when set', () => {
      stubEnv({ EMBEDDING_DIMS: undefined });
      expect(embeddingDims()).toBe(DEFAULT_EMBEDDING_DIMS);
      stubEnv({ EMBEDDING_DIMS: '1536' });
      expect(embeddingDims()).toBe(1536);
    });

    it('embeddingDims treats a blank value as unset, not zero', () => {
      stubEnv({ EMBEDDING_DIMS: '  ' });
      expect(embeddingDims()).toBe(DEFAULT_EMBEDDING_DIMS);
    });

    it('embeddingDims rejects non-integers', () => {
      stubEnv({ EMBEDDING_DIMS: '-12' });
      expect(() => embeddingDims()).toThrow('EMBEDDING_DIMS must be a positive integer (got "-12").');
      stubEnv({ EMBEDDING_DIMS: 'abc' });
      expect(() => embeddingDims()).toThrow('EMBEDDING_DIMS must be a positive integer (got "abc").');
    });
  });
});
