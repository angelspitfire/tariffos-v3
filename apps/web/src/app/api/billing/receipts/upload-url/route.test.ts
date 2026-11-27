import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn(),
  createSignedUploadUrl: vi.fn(),
  createBucket: vi.fn(),
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    storage: {
      createBucket: mocks.createBucket,
      from: () => ({
        createSignedUploadUrl: mocks.createSignedUploadUrl,
      }),
    },
  }),
}));

import { POST } from './route';

describe('POST /api/billing/receipts/upload-url', () => {
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

  it('returns directInline in offline mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';

    const res = await POST(
      new Request('http://localhost/api/billing/receipts/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'zelle.png',
          contentType: 'image/png',
          sizeBytes: 240_000,
        }),
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { mode: string; directInline: boolean };
    expect(body).toEqual({ mode: 'offline', directInline: true });
  });

  it('rejects unsupported content types or files larger than 5 MB', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { userId: 'u1', tenantId: 'ten-1', role: 'OWNER' },
    });

    const badType = await POST(
      new Request('http://localhost/api/billing/receipts/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'virus.exe',
          contentType: 'application/x-msdownload',
          sizeBytes: 1024,
        }),
      }),
    );
    expect(badType.status).toBe(400);

    const tooLarge = await POST(
      new Request('http://localhost/api/billing/receipts/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'huge.pdf',
          contentType: 'application/pdf',
          sizeBytes: 6 * 1024 * 1024,
        }),
      }),
    );
    expect(tooLarge.status).toBe(400);
  });

  it('creates signed upload URL scoped to tenantId in cloud mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { userId: 'u1', tenantId: 'ten-abc', role: 'OWNER' },
    });
    mocks.createSignedUploadUrl.mockResolvedValue({
      data: { signedUrl: 'https://supabase.storage/upload/signed-1' },
      error: null,
    });

    const res = await POST(
      new Request('http://localhost/api/billing/receipts/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'comprobante zelle.png',
          contentType: 'image/png',
          sizeBytes: 120_000,
        }),
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      mode: string;
      directInline: boolean;
      storageKey: string;
      signedUrl: string;
    };
    expect(body.mode).toBe('cloud');
    expect(body.directInline).toBe(false);
    expect(body.storageKey).toMatch(/^ten-abc\/\d+-comprobante_zelle\.png$/);
    expect(body.signedUrl).toBe('https://supabase.storage/upload/signed-1');
  });
});
