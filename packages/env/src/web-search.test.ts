/**
 * Single-provider web search configuration (ADR-P4).
 *
 * `WEB_SEARCH_PROVIDER` names the one engine this deployment uses, so the
 * pipeline never iterates engines inside a request. Unset means no engine:
 * callers degrade explicitly, never to a second provider.
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_PARALLEL_SEARCH_MODEL,
  DEFAULT_WEB_SEARCH_LIMIT,
  DEFAULT_WEB_SEARCH_TIMEOUT_MS,
  webSearchLimit,
  webSearchParallelModel,
  webSearchProvider,
  webSearchTimeoutMs,
} from './web-search.js';
import { restoreEnv, stubEnv } from './stub-env.js';

afterEach(restoreEnv);

describe('webSearchProvider', () => {
  it('is null when WEB_SEARCH_PROVIDER is unset (no engine configured)', () => {
    stubEnv({ WEB_SEARCH_PROVIDER: undefined });
    expect(webSearchProvider()).toBeNull();
  });

  it('resolves serper with its endpoint and scoped key', () => {
    stubEnv({
      WEB_SEARCH_PROVIDER: ' serper ',
      WEB_SEARCH_SERPER_API_KEY: 'serper-key',
    });

    expect(webSearchProvider()).toEqual({
      kind: 'serper',
      baseUrl: 'https://google.serper.dev/search',
      apiKey: 'serper-key',
    });
  });

  it('resolves context with its endpoint and scoped key', () => {
    stubEnv({
      WEB_SEARCH_PROVIDER: 'context',
      WEB_SEARCH_CONTEXT_API_KEY: 'context-key',
    });

    expect(webSearchProvider()).toEqual({
      kind: 'context',
      baseUrl: 'https://api.context.dev/v1/web/search',
      apiKey: 'context-key',
    });
  });

  it('accepts the Context.dev brand aliases', () => {
    for (const alias of ['context.dev', 'contextdev', 'Context.Dev']) {
      stubEnv({ WEB_SEARCH_PROVIDER: alias });
      expect(webSearchProvider()?.kind).toBe('context');
    }
  });

  it('falls back to the conventional API key variables', () => {
    stubEnv({ WEB_SEARCH_PROVIDER: 'serper', SERPER_API_KEY: 'legacy-serper' });
    expect(webSearchProvider()?.apiKey).toBe('legacy-serper');

    stubEnv({ WEB_SEARCH_PROVIDER: 'context', CONTEXT_DEV_API_KEY: 'legacy-context' });
    expect(webSearchProvider()?.apiKey).toBe('legacy-context');
  });

  it('lets a deployment override the endpoint', () => {
    stubEnv({
      WEB_SEARCH_PROVIDER: 'context',
      WEB_SEARCH_CONTEXT_BASE_URL: 'https://proxy.example/v1/web/search',
    });

    expect(webSearchProvider()?.baseUrl).toBe('https://proxy.example/v1/web/search');
  });

  it('resolves parallel with scoped key, AI_GATEWAY_API_KEY, or VERCEL_OIDC_TOKEN', () => {
    stubEnv({
      WEB_SEARCH_PROVIDER: 'parallel',
      WEB_SEARCH_PARALLEL_API_KEY: 'scoped-gateway-key',
      AI_GATEWAY_API_KEY: 'gateway-key',
      VERCEL_OIDC_TOKEN: 'oidc-token',
    });
    expect(webSearchProvider()).toEqual({
      kind: 'parallel',
      baseUrl: 'https://ai-gateway.vercel.sh',
      apiKey: 'scoped-gateway-key',
    });

    stubEnv({
      WEB_SEARCH_PROVIDER: 'parallel-fast',
      WEB_SEARCH_PARALLEL_API_KEY: undefined,
      AI_GATEWAY_API_KEY: 'gateway-key',
      VERCEL_OIDC_TOKEN: 'oidc-token',
    });
    expect(webSearchProvider()).toEqual({
      kind: 'parallel',
      baseUrl: 'https://ai-gateway.vercel.sh',
      apiKey: 'gateway-key',
    });

    stubEnv({
      WEB_SEARCH_PROVIDER: 'vercel-parallel',
      WEB_SEARCH_PARALLEL_API_KEY: undefined,
      AI_GATEWAY_API_KEY: undefined,
      VERCEL_OIDC_TOKEN: 'oidc-token',
    });
    expect(webSearchProvider()).toEqual({
      kind: 'parallel',
      baseUrl: 'https://ai-gateway.vercel.sh',
      apiKey: 'oidc-token',
    });
  });

  it('resolves webSearchParallelModel with default and override', () => {
    stubEnv({ WEB_SEARCH_PARALLEL_MODEL: undefined });
    expect(webSearchParallelModel()).toBe(DEFAULT_PARALLEL_SEARCH_MODEL);

    stubEnv({ WEB_SEARCH_PARALLEL_MODEL: '  openai/gpt-5.4-nano  ' });
    expect(webSearchParallelModel()).toBe('openai/gpt-5.4-nano');
  });

  it('rejects an unknown engine with a readable error', () => {
    stubEnv({ WEB_SEARCH_PROVIDER: 'mystery' });
    expect(() => webSearchProvider()).toThrow(/WEB_SEARCH_PROVIDER/);
  });
});

describe('webSearchLimit', () => {
  it('defaults to the shared limit', () => {
    stubEnv({ WEB_SEARCH_LIMIT: undefined });
    expect(webSearchLimit()).toBe(DEFAULT_WEB_SEARCH_LIMIT);
  });

  it('reads WEB_SEARCH_LIMIT and rejects garbage', () => {
    stubEnv({ WEB_SEARCH_LIMIT: '3' });
    expect(webSearchLimit()).toBe(3);

    stubEnv({ WEB_SEARCH_LIMIT: 'many' });
    expect(() => webSearchLimit()).toThrow(/WEB_SEARCH_LIMIT/);
  });
});

describe('webSearchTimeoutMs', () => {
  it('defaults to the shared timeout', () => {
    stubEnv({ WEB_SEARCH_TIMEOUT_MS: undefined });
    expect(webSearchTimeoutMs()).toBe(DEFAULT_WEB_SEARCH_TIMEOUT_MS);
  });

  it('reads WEB_SEARCH_TIMEOUT_MS and rejects garbage', () => {
    stubEnv({ WEB_SEARCH_TIMEOUT_MS: '2500' });
    expect(webSearchTimeoutMs()).toBe(2500);

    stubEnv({ WEB_SEARCH_TIMEOUT_MS: '0' });
    expect(() => webSearchTimeoutMs()).toThrow(/WEB_SEARCH_TIMEOUT_MS/);
  });
});
