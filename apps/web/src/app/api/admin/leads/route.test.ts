import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn<() => Promise<unknown>>(),
}));

vi.mock('@/lib/admin/http-helpers', async (importOriginal) => {
  const orig = await importOriginal<typeof import('@/lib/admin/http-helpers')>();
  return { ...orig, requireAdmin: mocks.requireAdmin };
});

import { resetOfflineAdminState } from '@/lib/admin/offline-store';
import { GET } from './route';

describe('GET /api/admin/leads', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;

  afterEach(() => {
    vi.clearAllMocks();
    resetOfflineAdminState();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
  });

  it('lists and filters incoming leads by status and search query', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'super_admin' },
    });

    const res = await GET(new Request('http://localhost/api/admin/leads?status=PENDING'));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { leads: Array<{ id: string; status: string }> };
    expect(body.leads.length).toBe(1);
    expect(body.leads[0]?.status).toBe('PENDING');

    const searchRes = await GET(new Request('http://localhost/api/admin/leads?q=Lara'));
    const searchBody = (await searchRes.json()) as { leads: Array<{ email: string }> };
    expect(searchBody.leads[0]?.email).toBe('operaciones@importadoralara.com');
  });
});
