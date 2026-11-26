import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  inngestSend: vi.fn(),
  getAuthenticatedUser: vi.fn(),
  membershipFindFirst: vi.fn(),
  checkBillingLimit: vi.fn(),
}));

vi.mock('@/lib/inngest/client', () => ({
  inngest: { send: mocks.inngestSend },
}));

vi.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock('@tariffos/database', () => ({
  billingService: {
    checkBillingLimit: mocks.checkBillingLimit,
  },
  prisma: {
    membership: { findFirst: mocks.membershipFindFirst },
  },
}));

import { POST } from './route';

describe('POST /api/batch', () => {
  const originalCloudMode = process.env.NEXT_PUBLIC_CLOUD_MODE;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    vi.clearAllMocks();
    if (originalCloudMode === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloudMode;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it('rejects empty batch payloads with 400', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const req = new Request('http://localhost/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ countryCode: 'VE' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('runs deterministic inline classification summary in offline mock mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const req = new Request('http://localhost/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filingId: 'fil-offline-1',
        countryCode: 'VE',
        sourceText: 'SKU-1 | Inversor solar híbrido 5kW | CN | 1000\nSKU-2 | MacBook Pro 14 | US | 2000',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      filingId: string;
      queued: boolean;
      totalItems: number;
      summary: { totalLines: number; totalCifUsd: number };
    };
    expect(body.filingId).toBe('fil-offline-1');
    expect(body.queued).toBe(false);
    expect(body.totalItems).toBe(2);
    expect(body.summary.totalLines).toBe(2);
    expect(body.summary.totalCifUsd).toBe(3000);
    expect(mocks.inngestSend).not.toHaveBeenCalled();
  });

  it('enqueues filing/batch.requested via Inngest in cloud mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'user-1', email: 'ops@agency.ve' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'tenant-ve', role: 'ADMIN' });
    mocks.checkBillingLimit.mockResolvedValue({ allowed: true });
    mocks.inngestSend.mockResolvedValue({ ids: ['evt-123'] });

    const req = new Request('http://localhost/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filingId: 'fil-cloud-42',
        countryCode: 'VE',
        items: [
          {
            lineId: 'line-1',
            sku: 'INV-5KW',
            description: 'Inversor solar híbrido 5kW',
            originCountry: 'CN',
            cifValue: 1500,
          },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(202);
    const body = (await res.json()) as { filingId: string; queued: boolean; totalItems: number };
    expect(body).toEqual({
      filingId: 'fil-cloud-42',
      queued: true,
      totalItems: 1,
    });
    expect(mocks.inngestSend).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'filing/batch.requested',
        data: expect.objectContaining({
          filingId: 'fil-cloud-42',
          tenantId: 'tenant-ve',
          countryCode: 'VE',
        }),
      }),
    );
  });
});
