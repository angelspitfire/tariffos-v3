// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn(),
  createBatchSignedUploadUrl: vi.fn(),
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

vi.mock('@/lib/inngest/batch-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/inngest/batch-storage')>();
  return {
    ...actual,
    createBatchSignedUploadUrl: mocks.createBatchSignedUploadUrl,
  };
});

import { POST } from './route';

describe('POST /api/batch/upload-url', () => {
  const originalCloudMode = process.env.NEXT_PUBLIC_CLOUD_MODE;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    vi.clearAllMocks();
    if (originalCloudMode === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloudMode;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it('returns directInline in offline mode and 401 when unauthenticated in cloud mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const offlineRes = await POST(
      new Request('http://localhost/api/batch/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'factura.pdf',
          contentType: 'application/pdf',
          sizeBytes: 5_000_000,
        }),
      }),
    );
    expect(offlineRes.status).toBe(200);
    expect(await offlineRes.json()).toEqual({ mode: 'offline', directInline: true });

    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.resolveCloudTenantContext.mockResolvedValueOnce({
      ok: false,
      status: 401,
      error: 'Unauthorized',
    });

    const unauthRes = await POST(
      new Request('http://localhost/api/batch/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'factura.pdf',
          contentType: 'application/pdf',
          sizeBytes: 5_000_000,
        }),
      }),
    );
    expect(unauthRes.status).toBe(401);
  });

  it('validates file metadata and returns signedUrl for authorized tenant in cloud mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.resolveCloudTenantContext.mockResolvedValueOnce({
      ok: true,
      context: { userId: 'u-1', userEmail: 'ops@ve.test', tenantId: 'tenant-ve', role: 'OWNER' },
    });
    mocks.createBatchSignedUploadUrl.mockResolvedValueOnce({
      storageKey: 'tenant-ve/123-factura.pdf',
      signedUrl: 'https://storage.example/signed-batch',
    });

    const res = await POST(
      new Request('http://localhost/api/batch/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'factura.pdf',
          contentType: 'application/pdf',
          sizeBytes: 6_500_000,
        }),
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      mode: 'cloud',
      directInline: false,
      storageKey: 'tenant-ve/123-factura.pdf',
      signedUrl: 'https://storage.example/signed-batch',
    });

    const badRes = await POST(
      new Request('http://localhost/api/batch/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'virus.exe',
          contentType: 'application/octet-stream',
          sizeBytes: 1000,
        }),
      }),
    );
    expect(badRes.status).toBe(400);
  });
});
