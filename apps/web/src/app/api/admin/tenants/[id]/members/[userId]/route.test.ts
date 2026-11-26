import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn<() => Promise<unknown>>(),
}));

vi.mock('@/lib/admin/http-helpers', async (importOriginal) => {
  const orig = await importOriginal<typeof import('@/lib/admin/http-helpers')>();
  return { ...orig, requireAdmin: mocks.requireAdmin };
});

import { getOfflineAdminState, resetOfflineAdminState } from '@/lib/admin/offline-store';
import { DELETE } from './route';

describe('DELETE /api/admin/tenants/[id]/members/[userId]', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;

  afterEach(() => {
    vi.clearAllMocks();
    resetOfflineAdminState();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
  });

  it('removes user membership from tenant and records audit event', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'ops_billing' },
    });

    const res = await DELETE(
      new Request('http://localhost/api/admin/tenants/ten-demo-1/members/usr-2', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Salida del analista' }),
      }),
      { params: Promise.resolve({ id: 'ten-demo-1', userId: 'usr-2' }) },
    );
    expect(res.status).toBe(200);
    const tenant = getOfflineAdminState().tenants.find((t) => t.id === 'ten-demo-1');
    expect(tenant?.members.some((m) => m.userId === 'usr-2')).toBe(false);
    expect(getOfflineAdminState().auditLogs[0]?.action).toBe('user.offboarded');
  });
});
