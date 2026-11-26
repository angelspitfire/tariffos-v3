import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  waitlistUpsert: vi.fn<() => Promise<unknown>>(),
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    waitlistLead: { upsert: mocks.waitlistUpsert },
  },
}));

import { resetOfflineAdminState } from '@/lib/admin/offline-store';
import { POST } from './route';

describe('POST /api/leads', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    vi.clearAllMocks();
    resetOfflineAdminState();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it('captures a lead in offline store and validates email', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';

    const badRes = await POST(
      new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' }),
      }),
    );
    expect(badRes.status).toBe(400);

    const res = await POST(
      new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nuevo@agencia.ve',
          name: 'Ana Ruiz',
          company: 'Aduanas Sur',
          phone: '+58 412 111 2233',
          country: 'VE',
          volume: '100-400',
          source: 'landing_cta',
        }),
      }),
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { lead: { email: string; status: string } };
    expect(body.lead.email).toBe('nuevo@agencia.ve');
    expect(body.lead.status).toBe('PENDING');
  });

  it('upserts WaitlistLead in cloud mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.waitlistUpsert.mockResolvedValue({
      id: 'lead-1',
      email: 'ceo@import.ve',
      name: 'Luis',
      company: 'Import VE',
      phone: null,
      notes: null,
      country: 'VE',
      volume: '500+',
      source: 'pricing',
      status: 'PENDING',
      approvedAt: null,
      createdAt: new Date('2026-11-26T01:00:00Z'),
    });

    const res = await POST(
      new Request('http://localhost/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ceo@import.ve', name: 'Luis', company: 'Import VE' }),
      }),
    );
    expect(res.status).toBe(201);
    expect(mocks.waitlistUpsert).toHaveBeenCalledTimes(1);
  });
});
