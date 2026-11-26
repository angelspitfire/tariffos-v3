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

describe('GET /api/admin/usage', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;

  afterEach(() => {
    vi.clearAllMocks();
    resetOfflineAdminState();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
  });

  it('returns ranked tenant usage with quota percentages and token totals', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'super_admin' },
    });

    const res = await GET(new Request('http://localhost/api/admin/usage'));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      rows: Array<{ tenantId: string; percentUsed: number; nearLimit: boolean; inputTokens: number }>;
    };
    expect(body.rows.length).toBe(2);
    expect(body.rows[0]?.percentUsed).toBeGreaterThanOrEqual(80);
    expect(body.rows[0]?.nearLimit).toBe(true);
    expect(body.rows[0]?.inputTokens).toBeGreaterThan(0);
  });
});
