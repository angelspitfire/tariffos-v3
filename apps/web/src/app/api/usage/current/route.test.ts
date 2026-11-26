import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn<() => Promise<unknown>>(),
  tenantFindUnique: vi.fn<() => Promise<unknown>>(),
  getCurrentMonthUsage: vi.fn<() => Promise<unknown>>(),
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    tenant: { findUnique: mocks.tenantFindUnique },
  },
  billingService: {
    getCurrentMonthUsage: mocks.getCurrentMonthUsage,
  },
}));

import { GET } from './route';

describe('GET /api/usage/current', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    vi.clearAllMocks();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it('returns deterministic offline snapshot when cloud mode is disabled', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { mode: string; usage: { limit: number; planId: string } };
    expect(body.mode).toBe('offline');
    expect(body.usage.limit).toBeGreaterThan(0);
  });

  it('returns tenant monthly usage and token counters in cloud mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { userId: 'u-1', userEmail: 'a@b.com', tenantId: 'ten-1', role: 'OWNER' },
    });
    mocks.tenantFindUnique.mockResolvedValue({
      id: 'ten-1',
      name: 'Aduanas Alpha',
      planId: 'pro',
      billingLimit: 400,
      billingStatus: 'ACTIVE',
      allowOverage: false,
      plan: { name: 'pro', classificationLimit: 400, features: { displayName: 'Pro' } },
    });
    mocks.getCurrentMonthUsage.mockResolvedValue({
      month: 11,
      year: 2026,
      count: 100,
      inputTokens: 45000,
      outputTokens: 12000,
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      mode: string;
      usage: { used: number; limit: number; percentUsed: number; inputTokens: number };
    };
    expect(body.mode).toBe('cloud');
    expect(body.usage.used).toBe(100);
    expect(body.usage.limit).toBe(400);
    expect(body.usage.percentUsed).toBe(25);
    expect(body.usage.inputTokens).toBe(45000);
  });
});
