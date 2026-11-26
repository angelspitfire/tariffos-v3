// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn(),
  filingFindFirst: vi.fn(),
  getClientSubscriptionToken: vi.fn(),
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    filing: { findFirst: mocks.filingFindFirst },
  },
}));

vi.mock('inngest/react', () => ({
  getClientSubscriptionToken: mocks.getClientSubscriptionToken,
}));

import { POST } from './route';

describe('POST /api/batch/[filingId]/token', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it('rejects non-owner filing token requests with 404', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { tenantId: 'tenant-ve', userId: 'user-1', role: 'ADMIN' },
    });
    mocks.filingFindFirst.mockResolvedValue(null);

    const res = await POST(new Request('http://localhost/api/batch/fil-nope/token', { method: 'POST' }), {
      params: Promise.resolve({ filingId: 'fil-nope' }),
    });
    expect(res.status).toBe(404);
    expect(mocks.getClientSubscriptionToken).not.toHaveBeenCalled();
  });

  it('mints an Inngest v4 realtime subscription token scoped to tenant-owned filing', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { tenantId: 'tenant-ve', userId: 'user-1', role: 'ADMIN' },
    });
    mocks.filingFindFirst.mockResolvedValue({ id: 'fil-42' });
    mocks.getClientSubscriptionToken.mockResolvedValue({
      channel: 'batch:fil-42',
      topics: ['progress'],
      key: 'sub-key-123',
    });

    const res = await POST(new Request('http://localhost/api/batch/fil-42/token', { method: 'POST' }), {
      params: Promise.resolve({ filingId: 'fil-42' }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { token: { channel: string; key: string } };
    expect(json.token).toEqual({
      channel: 'batch:fil-42',
      topics: ['progress'],
      key: 'sub-key-123',
    });
    expect(mocks.getClientSubscriptionToken).toHaveBeenCalledTimes(1);
  });
});
