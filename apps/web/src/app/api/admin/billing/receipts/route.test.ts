import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  createSignedUrl: vi.fn(),
}));

vi.mock('@/lib/admin/http-helpers', () => ({
  requireAdmin: mocks.requireAdmin,
}));

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    storage: {
      from: () => ({
        createSignedUrl: mocks.createSignedUrl,
      }),
    },
  }),
}));

import { GET } from './route';

describe('GET /api/admin/billing/receipts', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    vi.clearAllMocks();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it('rejects non-admin callers via requireAdmin guard', async () => {
    mocks.requireAdmin.mockResolvedValue({
      ok: false,
      response: Response.json({ error: 'Forbidden' }, { status: 403 }),
    });

    const res = await GET(new Request('http://localhost/api/admin/billing/receipts?key=ten-1/r.png'));
    expect(res.status).toBe(403);
    expect(mocks.requireAdmin).toHaveBeenCalledWith('billing:read');
  });

  it('returns signed read URL valid for 3600s in cloud mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.requireAdmin.mockResolvedValue({ ok: true, context: { userId: 'adm-1' } });
    mocks.createSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://supabase.storage/read/signed-60m' },
      error: null,
    });

    const res = await GET(
      new Request('http://localhost/api/admin/billing/receipts?key=ten-1/1732-receipt.png'),
    );

    expect(res.status).toBe(200);
    expect(mocks.createSignedUrl).toHaveBeenCalledWith('ten-1/1732-receipt.png', 3600);
    const body = (await res.json()) as { signedUrl: string };
    expect(body.signedUrl).toBe('https://supabase.storage/read/signed-60m');
  });
});
