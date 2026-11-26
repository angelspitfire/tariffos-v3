import { afterEach, describe, expect, it } from 'vitest';
import { resetOfflineAdminState } from '@/lib/admin/offline-store';
import { GET } from './route';

describe('GET /api/admin/overview', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;

  afterEach(() => {
    resetOfflineAdminState();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
  });

  it('returns consolidated KPIs across tenants, payments, leads, and usage', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      overview: {
        activeTenants: number;
        trialingTenants: number;
        pendingPayments: number;
        pendingLeads: number;
        nearLimitTenants: number;
      };
    };
    expect(body.overview.activeTenants).toBe(1);
    expect(body.overview.trialingTenants).toBe(1);
    expect(body.overview.pendingPayments).toBe(1);
    expect(body.overview.pendingLeads).toBe(1);
    expect(body.overview.nearLimitTenants).toBe(2);
  });
});
