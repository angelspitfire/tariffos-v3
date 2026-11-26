import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn<() => Promise<unknown>>(),
  fetchBcvRates: vi.fn<() => Promise<unknown[]>>(),
  persistBcvRates: vi.fn<() => Promise<unknown>>(),
  getLatestExchangeRates: vi.fn<() => Promise<unknown>>(),
  listRecentExchangeRates: vi.fn<() => Promise<unknown[]>>(),
  recordAdminAudit: vi.fn<() => Promise<void>>(),
}));

vi.mock('@/lib/admin/http-helpers', async (importOriginal) => {
  const orig = await importOriginal<typeof import('@/lib/admin/http-helpers')>();
  return { ...orig, requireAdmin: mocks.requireAdmin };
});

vi.mock('@/lib/bcv/client', () => ({
  fetchBcvRates: mocks.fetchBcvRates,
}));

vi.mock('@/lib/bcv/sync-service', () => ({
  persistBcvRates: mocks.persistBcvRates,
  getLatestExchangeRates: mocks.getLatestExchangeRates,
  listRecentExchangeRates: mocks.listRecentExchangeRates,
}));

vi.mock('@tariffos/database', () => ({
  prisma: { adminAuditLog: { create: vi.fn<() => Promise<unknown>>() } },
  recordAdminAudit: mocks.recordAdminAudit,
}));

import { GET, POST } from './route';

describe('/api/admin/exchange-rates/sync', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;

  afterEach(() => {
    vi.clearAllMocks();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
  });

  it('rejects non-admin callers with 403', async () => {
    mocks.requireAdmin.mockResolvedValue({
      ok: false,
      response: Response.json({ error: 'Forbidden' }, { status: 403 }),
    });
    const res = await POST(new Request('http://localhost/api/admin/exchange-rates/sync', { method: 'POST' }));
    expect(res.status).toBe(403);
  });

  it('returns latest rates and recent history on GET', async () => {
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'super_admin' },
    });
    mocks.getLatestExchangeRates.mockResolvedValue({
      'USD/VES': { pair: 'USD/VES', rate: 52.4, valueDate: '2026-11-26', source: 'bcv.org.ve' },
      'EUR/VES': { pair: 'EUR/VES', rate: 55.1, valueDate: '2026-11-26', source: 'bcv.org.ve' },
    });
    mocks.listRecentExchangeRates.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);
  });

  it('syncs live BCV rates on POST and supports manual override with reason', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    mocks.requireAdmin.mockResolvedValue({
      ok: true,
      context: { userId: 'adm-1', userEmail: 'adm@tariffos.app', role: 'super_admin' },
    });
    mocks.fetchBcvRates.mockResolvedValue([
      { pair: 'USD/VES', rate: 52.6, valueDate: '2026-11-26', source: 'bcv.org.ve' },
    ]);
    mocks.persistBcvRates.mockResolvedValue({
      saved: [{ pair: 'USD/VES', rate: 52.6, valueDate: '2026-11-26', source: 'bcv.org.ve' }],
      skipped: [],
    });

    const syncRes = await POST(
      new Request('http://localhost/api/admin/exchange-rates/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    );
    expect(syncRes.status).toBe(200);
    expect(mocks.fetchBcvRates).toHaveBeenCalledTimes(1);

    const manualRes = await POST(
      new Request('http://localhost/api/admin/exchange-rates/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manual: {
            pair: 'USD/VES',
            rate: 53.0,
            valueDate: '2026-11-27',
            reason: 'Contingencia portal BCV',
          },
        }),
      }),
    );
    expect(manualRes.status).toBe(200);
    expect(mocks.persistBcvRates).toHaveBeenCalledWith(
      [{ pair: 'USD/VES', rate: 53.0, valueDate: '2026-11-27', source: 'manual_admin' }],
      { force: true },
    );
  });
});
