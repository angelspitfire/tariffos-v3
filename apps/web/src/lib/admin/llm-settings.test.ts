import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  upsert: vi.fn(),
  deleteMany: vi.fn(),
  generateJson: vi.fn(),
  isCloudModeEnabled: vi.fn(() => true),
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    systemSetting: {
      findUnique: mocks.findUnique,
      upsert: mocks.upsert,
      deleteMany: mocks.deleteMany,
    },
  },
}));

vi.mock('@tariffos/agent', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tariffos/agent')>();
  return {
    ...actual,
    getLlmProvider: vi.fn(() => ({ generateJson: mocks.generateJson })),
  };
});

vi.mock('@/lib/runtime-config', () => ({
  isCloudModeEnabled: mocks.isCloudModeEnabled,
}));

import {
  getActiveLlmRuntimeConfig,
  invalidateLlmRuntimeConfigCache,
  resetLlmRuntimeConfig,
  saveLlmRuntimeConfig,
  testLlmRuntimeConfig,
} from './llm-settings';

beforeEach(() => {
  vi.clearAllMocks();
  invalidateLlmRuntimeConfigCache();
  mocks.isCloudModeEnabled.mockReturnValue(true);
  vi.stubEnv('LLM_PROVIDER', 'nvidia');
  vi.stubEnv('NVIDIA_API_KEY', 'nvapi-test');
  vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'AIza-test');
  vi.stubEnv('OPENROUTER_API_KEY', '');
  vi.stubEnv('RGI_MODEL', 'nvidia/nemotron-3.5-super-vl-120b-a12b');
  vi.stubEnv('RGI_DEEP_MODEL', 'nvidia/nemotron-3-ultra-550b-a55b');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('llm-settings runtime resolution', () => {
  it('falls back to environment defaults when SystemSetting has no override', async () => {
    mocks.findUnique.mockResolvedValueOnce(null);
    const active = await getActiveLlmRuntimeConfig();
    expect(active.source).toBe('env');
    expect(active.provider).toBe('nvidia');
    expect(active.model).toBe('nvidia/nemotron-3.5-super-vl-120b-a12b');
    expect(active.canRunLive).toBe(true);
  });

  it('returns the persisted SystemSetting override and caches subsequent reads', async () => {
    mocks.findUnique.mockResolvedValueOnce({
      key: 'ai.runtime_config',
      value: JSON.stringify({
        provider: 'google',
        model: 'gemini-2.5-flash',
        deepModel: 'gemini-2.5-pro',
        maxRpm: 60,
      }),
      updatedAt: new Date('2026-11-26T00:00:00Z'),
    });

    const first = await getActiveLlmRuntimeConfig();
    const second = await getActiveLlmRuntimeConfig();

    expect(first.source).toBe('database');
    expect(first.provider).toBe('google');
    expect(first.model).toBe('gemini-2.5-flash');
    expect(first.deepModel).toBe('gemini-2.5-pro');
    expect(second.model).toBe('gemini-2.5-flash');
    expect(mocks.findUnique).toHaveBeenCalledTimes(1);
  });

  it('rejects saving a provider whose server API key is not configured in cloud mode', async () => {
    await expect(
      saveLlmRuntimeConfig({
        provider: 'openrouter',
        model: 'openai/gpt-4o-mini',
      }),
    ).rejects.toThrow(/OPENROUTER_API_KEY/i);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it('persists a valid override and invalidates the cache', async () => {
    mocks.findUnique.mockResolvedValueOnce(null);
    mocks.upsert.mockResolvedValueOnce({
      key: 'ai.runtime_config',
      value: JSON.stringify({ provider: 'google', model: 'gemini-2.5-flash' }),
      updatedAt: new Date('2026-11-26T01:00:00Z'),
    });

    const saved = await saveLlmRuntimeConfig({
      provider: 'google',
      model: 'gemini-2.5-flash',
      deepModel: 'gemini-2.5-pro',
    });

    expect(mocks.upsert).toHaveBeenCalledTimes(1);
    expect(saved.after.provider).toBe('google');
    expect(saved.after.model).toBe('gemini-2.5-flash');
  });

  it('resets the override back to env defaults', async () => {
    mocks.findUnique.mockResolvedValueOnce({
      key: 'ai.runtime_config',
      value: JSON.stringify({ provider: 'google', model: 'gemini-2.5-flash' }),
      updatedAt: new Date(),
    });
    mocks.deleteMany.mockResolvedValueOnce({ count: 1 });

    const res = await resetLlmRuntimeConfig();
    expect(mocks.deleteMany).toHaveBeenCalledWith({ where: { key: 'ai.runtime_config' } });
    expect(res.after.source).toBe('env');
    expect(res.after.provider).toBe('nvidia');
  });

  it('runs a live JSON smoke test and reports latency', async () => {
    mocks.generateJson.mockResolvedValueOnce({ ok: true, pong: 'tariffos' });
    const probe = await testLlmRuntimeConfig({
      provider: 'google',
      model: 'gemini-2.5-flash',
    });

    expect(probe.ok).toBe(true);
    expect(probe.provider).toBe('google');
    expect(probe.model).toBe('gemini-2.5-flash');
    expect(probe.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
