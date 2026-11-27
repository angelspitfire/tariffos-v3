import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn<() => Promise<unknown>>(),
  tenantFindUnique: vi.fn<() => Promise<unknown>>(),
  paymentFindFirst: vi.fn<() => Promise<unknown>>(),
  getCurrentMonthUsage: vi.fn<() => Promise<unknown>>(),
  getEffectiveUsage: vi.fn<() => Promise<unknown>>(),
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

vi.mock('@tariffos/database', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tariffos/database')>();
  return {
    ...actual,
    prisma: {
      tenant: { findUnique: mocks.tenantFindUnique },
      payment: { findFirst: mocks.paymentFindFirst },
    },
    billingService: {
      getCurrentMonthUsage: mocks.getCurrentMonthUsage,
      getEffectiveUsage: mocks.getEffectiveUsage,
    },
  };
});

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
    mocks.getEffectiveUsage.mockResolvedValue({
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

  it('preserves limit=0 for PAST_DUE pending tenants and passes oneTimeOnly to getEffectiveUsage', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { userId: 'u-2', userEmail: 'p@b.com', tenantId: 'ten-pending', role: 'OWNER' },
    });
    mocks.tenantFindUnique.mockResolvedValue({
      id: 'ten-pending',
      name: 'Agencia Nueva',
      planId: 'pilot',
      billingLimit: 0,
      billingStatus: 'PAST_DUE',
      allowOverage: false,
      plan: {
        name: 'pilot',
        classificationLimit: 250,
        features: { displayName: 'Piloto Operativo', oneTimeOnly: true, allowBatch: true },
      },
    });
    mocks.getEffectiveUsage.mockResolvedValue({
      month: 11,
      year: 2026,
      count: 0,
      inputTokens: 0,
      outputTokens: 0,
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      usage: { limit: number; oneTimeOnly?: boolean; allowBatch?: boolean; billingStatus: string };
    };
    expect(mocks.getEffectiveUsage).toHaveBeenCalledWith('ten-pending', true);
    expect(body.usage.limit).toBe(0);
    expect(body.usage.billingStatus).toBe('PAST_DUE');
    expect(body.usage.oneTimeOnly).toBe(true);
    expect(body.usage.allowBatch).toBe(true);
  });

  it('returns unlimited=true and percentUsed=0 for TariffOS internal unlimited plan', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: {
        userId: 'u-admin',
        userEmail: 'angel.alberto.fernandez@gmail.com',
        tenantId: 'ten-tariffos',
        role: 'OWNER',
      },
    });
    mocks.tenantFindUnique.mockResolvedValue({
      id: 'ten-tariffos',
      name: 'TariffOS',
      planId: 'plan-internal-1',
      billingLimit: 1_000_000_000,
      billingStatus: 'ACTIVE',
      allowOverage: true,
      plan: {
        name: 'tariffos_internal',
        classificationLimit: 1_000_000_000,
        features: {
          displayName: 'TariffOS Interno (Ilimitado)',
          unlimited: true,
          internalOnly: true,
          isPublic: false,
          allowBatch: true,
        },
      },
    });
    mocks.getEffectiveUsage.mockResolvedValue({
      month: 11,
      year: 2026,
      count: 4200,
      inputTokens: 120000,
      outputTokens: 45000,
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      usage: { unlimited?: boolean; percentUsed: number; planName: string; allowOverage: boolean };
    };
    expect(body.usage.unlimited).toBe(true);
    expect(body.usage.percentUsed).toBe(0);
    expect(body.usage.planName).toBe('TariffOS Interno (Ilimitado)');
    expect(body.usage.allowOverage).toBe(true);
  });

  it('includes latestPayment summary for PAST_DUE tenants when a payment was submitted or rejected', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { userId: 'u-2', userEmail: 'p@b.com', tenantId: 'ten-pending', role: 'OWNER' },
    });
    mocks.tenantFindUnique.mockResolvedValue({
      id: 'ten-pending',
      name: 'Agencia Nueva',
      planId: 'pilot',
      billingLimit: 0,
      billingStatus: 'PAST_DUE',
      allowOverage: false,
      plan: {
        name: 'pilot',
        classificationLimit: 250,
        features: { displayName: 'Piloto Operativo', oneTimeOnly: true, allowBatch: true },
      },
    });
    mocks.getEffectiveUsage.mockResolvedValue({
      month: 11,
      year: 2026,
      count: 0,
      inputTokens: 0,
      outputTokens: 0,
    });
    mocks.paymentFindFirst.mockResolvedValue({
      status: 'PENDING',
      referenceCode: 'ZEL-4455',
      planId: 'pilot',
      rejectionReason: null,
    });

    const pendingRes = await GET();
    const pendingBody = (await pendingRes.json()) as {
      usage: { latestPayment?: { status: string; referenceCode: string; planName: string } };
    };
    expect(pendingBody.usage.latestPayment).toEqual({
      status: 'pending_verification',
      referenceCode: 'ZEL-4455',
      planName: 'Piloto Operativo',
    });

    mocks.paymentFindFirst.mockResolvedValue({
      status: 'REJECTED',
      referenceCode: 'ZEL-0000',
      planId: 'pilot',
      rejectionReason: 'Referencia duplicada',
    });

    const rejectedRes = await GET();
    const rejectedBody = (await rejectedRes.json()) as {
      usage: { latestPayment?: { status: string; rejectionReason?: string } };
    };
    expect(rejectedBody.usage.latestPayment).toMatchObject({
      status: 'rejected',
      rejectionReason: 'Referencia duplicada',
    });
  });
});
