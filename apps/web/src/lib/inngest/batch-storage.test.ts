// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createSignedUploadUrl: vi.fn(),
  createBucket: vi.fn(),
  download: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    storage: {
      createBucket: mocks.createBucket,
      from: () => ({
        createSignedUploadUrl: mocks.createSignedUploadUrl,
        download: mocks.download,
      }),
    },
  }),
}));

import {
  BATCH_INVOICES_BUCKET,
  BatchUploadUrlRequestSchema,
  MAX_BATCH_STORAGE_BYTES,
  SIGNED_UPLOAD_THRESHOLD_BYTES,
  createBatchSignedUploadUrl,
  downloadBatchFileFromStorage,
} from './batch-storage';

describe('batch-storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates allowed invoice extensions and enforces 25 MB limit', () => {
    expect(SIGNED_UPLOAD_THRESHOLD_BYTES).toBe(3_500_000);
    expect(MAX_BATCH_STORAGE_BYTES).toBe(25 * 1024 * 1024);

    const ok = BatchUploadUrlRequestSchema.safeParse({
      fileName: 'Factura Abril #01.pdf',
      contentType: 'application/pdf',
      sizeBytes: 6_200_000,
    });
    expect(ok.success).toBe(true);

    const badExt = BatchUploadUrlRequestSchema.safeParse({
      fileName: 'payload.exe',
      contentType: 'application/octet-stream',
      sizeBytes: 1024,
    });
    expect(badExt.success).toBe(false);

    const tooBig = BatchUploadUrlRequestSchema.safeParse({
      fileName: 'huge.pdf',
      contentType: 'application/pdf',
      sizeBytes: MAX_BATCH_STORAGE_BYTES + 1,
    });
    expect(tooBig.success).toBe(false);
  });

  it('creates signed upload URL and auto-creates private batch-invoices bucket if missing', async () => {
    mocks.createSignedUploadUrl
      .mockResolvedValueOnce({ data: null, error: { message: 'Bucket not found' } })
      .mockResolvedValueOnce({
        data: { signedUrl: 'https://storage.example/upload-token' },
        error: null,
      });
    mocks.createBucket.mockResolvedValueOnce({ error: null });

    const res = await createBatchSignedUploadUrl('tenant-ve', 'Factura Abril (1).pdf');
    expect(res.storageKey).toMatch(/^tenant-ve\/\d+-Factura_Abril__1_\.pdf$/);
    expect(res.signedUrl).toBe('https://storage.example/upload-token');
    expect(mocks.createBucket).toHaveBeenCalledWith(BATCH_INVOICES_BUCKET, {
      public: false,
      fileSizeLimit: MAX_BATCH_STORAGE_BYTES,
    });
  });

  it('downloads tenant-owned file as File and blocks cross-tenant or traversal keys with 403', async () => {
    await expect(
      downloadBatchFileFromStorage('other-tenant/factura.pdf', 'tenant-ve'),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      downloadBatchFileFromStorage('tenant-ve/../other/factura.pdf', 'tenant-ve'),
    ).rejects.toMatchObject({ status: 403 });

    mocks.download.mockResolvedValueOnce({
      data: new Blob(['SKU,Descripcion,CIF\nA1,Motor,500'], { type: 'text/csv' }),
      error: null,
    });

    const file = await downloadBatchFileFromStorage(
      'tenant-ve/17000-factura.csv',
      'tenant-ve',
      'factura.csv',
    );
    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe('factura.csv');
    expect(await file.text()).toContain('Motor');
  });
});
