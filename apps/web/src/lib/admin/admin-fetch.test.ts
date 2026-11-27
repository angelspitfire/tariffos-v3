import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminFetchJson } from './admin-fetch';

describe('adminFetchJson', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed payload on 2xx responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, count: 3 }), { status: 200 })),
    );
    await expect(adminFetchJson<{ ok: boolean; count: number }>('/api/admin/test')).resolves.toEqual({
      ok: true,
      count: 3,
    });
  });

  it('throws server error message or HTTP status fallback on non-OK responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Acceso denegado' }), { status: 403 })),
    );
    await expect(adminFetchJson('/api/admin/test')).rejects.toThrow(/Acceso denegado/);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Bad Gateway', { status: 502 })));
    await expect(adminFetchJson('/api/admin/test')).rejects.toThrow(/Error HTTP 502/);
  });
});
