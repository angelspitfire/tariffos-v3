import { describe, expect, it, vi } from 'vitest';
import {
  fetchOpenRouterQuota,
  fetchProviderModels,
} from '@/lib/admin/llm-provider-inspector';

describe('fetchProviderModels (OpenRouter)', () => {
  it('filters free and tool-capable models and computes per-1M pricing', async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: [
              {
                id: 'nvidia/nemotron-3.5-super-vl:free',
                name: 'NVIDIA: Nemotron 3.5 Super VL (free)',
                context_length: 1000000,
                pricing: { prompt: '0', completion: '0' },
                supported_parameters: ['tools', 'temperature'],
              },
              {
                id: 'nvidia/nemotron-3.5-super-vl',
                name: 'NVIDIA: Nemotron 3.5 Super VL',
                context_length: 1048576,
                pricing: { prompt: '0.00000015', completion: '0.00000047' },
                supported_parameters: ['tools'],
              },
              {
                id: 'nvidia/nemotron-3.5-content-safety',
                name: 'Safety',
                context_length: 131072,
                pricing: { prompt: '0', completion: '0' },
                supported_parameters: ['temperature'],
              },
            ],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      ),
    );

    const freeTools = await fetchProviderModels(
      { provider: 'openrouter', freeOnly: true, toolsOnly: true, search: 'nemotron' },
      fetchMock as unknown as typeof fetch,
    );

    expect(freeTools).toHaveLength(1);
    expect(freeTools[0]).toMatchObject({
      id: 'nvidia/nemotron-3.5-super-vl:free',
      isFree: true,
      supportsTools: true,
      promptPerMillionUsd: 0,
      completionPerMillionUsd: 0,
      contextLength: 1000000,
    });

    const allNemotron = await fetchProviderModels(
      { provider: 'openrouter', search: 'super-vl' },
      fetchMock as unknown as typeof fetch,
    );
    const paid = allNemotron.find((m) => m.id === 'nvidia/nemotron-3.5-super-vl');
    expect(paid?.isFree).toBe(false);
    expect(paid?.promptPerMillionUsd).toBeCloseTo(0.15, 4);
    expect(paid?.completionPerMillionUsd).toBeCloseTo(0.47, 4);
  });
});

describe('fetchOpenRouterQuota', () => {
  it('returns configured=false when API key is missing', async () => {
    const res = await fetchOpenRouterQuota('');
    expect(res).toEqual({ configured: false });
  });

  it('parses OpenRouter /auth/key quota and usage telemetry', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            label: 'tariffos-prod',
            is_free_tier: false,
            limit: 25,
            limit_remaining: 19.75,
            usage: 5.25,
            usage_daily: 0.42,
            usage_weekly: 1.85,
            usage_monthly: 5.25,
            rate_limit: { requests: 200, interval: '10s' },
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const quota = await fetchOpenRouterQuota('sk-or-test', fetchMock as unknown as typeof fetch);
    expect(quota).toEqual({
      configured: true,
      label: 'tariffos-prod',
      isFreeTier: false,
      limitUsd: 25,
      remainingUsd: 19.75,
      usageUsd: 5.25,
      usageDailyUsd: 0.42,
      usageWeeklyUsd: 1.85,
      usageMonthlyUsd: 5.25,
      rateLimit: { requests: 200, interval: '10s' },
    });
  });
});
