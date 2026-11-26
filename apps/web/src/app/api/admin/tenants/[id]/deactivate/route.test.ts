import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn<() => Promise<unknown>>(),
}));

vi.mock('@/lib/admin/http-helpers', async (importOriginal) => {
  const orig = await importOriginal<typeof import('@/lib/admin/http-helpers')>();
  return { ...orig, requireAdmin: mocks.requireAdmin };
});

import { getOfflineAdminState, resetOfflineAdminState } from '@/lib/admin/offline-store';
import { POST } from './route';

describe('POST /api/admin/tenants/[id]/deactivate', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;

  afterEach(() => {
    vi.clearAllMocks();
    resetOfflineAdminState();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
  });

  it('requires a reason and marks tenant as CANCELED with audit log', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'ops_billing' },
    });

    const badRes = await POST(
      new Request('http://localhost/api/admin/tenants/ten-demo-1/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: '' }),
      }),
      { params: Promise.resolve({ id: 'ten-demo-1' }) },
    );
    expect(badRes.status).toBe(400);

    const res = await POST(
      new Request('http://localhost/api/admin/tenants/ten-demo-1/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Falta de pago por 30 días' }),
      }),
      { params: Promise.resolve({ id: 'ten-demo-1' }) },
    );
    expect(res.status).toBe(200);
    const tenant = getOfflineAdminState().tenants.find((t) => t.id === 'ten-demo-1');
    expect(tenant?.billingStatus).toBe('CANCELED');
    expect(getOfflineAdminState().auditLogs[0]?.action).toBe('tenant.deactivated');
  });
});
