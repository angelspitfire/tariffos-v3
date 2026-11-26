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

describe('GET /api/admin/tenants', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;

  afterEach(() => {
    vi.clearAllMocks();
    resetOfflineAdminState();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
  });

  it('lists and filters tenants by query and billingStatus', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'super_admin' },
    });

    const res = await GET(new Request('http://localhost/api/admin/tenants?status=TRIALING'));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { tenants: Array<{ id: string; billingStatus: string }> };
    expect(body.tenants.length).toBe(1);
    expect(body.tenants[0]?.id).toBe('ten-demo-2');

    const qRes = await GET(new Request('http://localhost/api/admin/tenants?q=Maiquetía'));
    const qBody = (await qRes.json()) as { tenants: Array<{ id: string }> };
    expect(qBody.tenants[0]?.id).toBe('ten-demo-1');
  });
});
