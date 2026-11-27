// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  inngestSend: vi.fn(),
  getAuthenticatedUser: vi.fn(),
  membershipFindFirst: vi.fn(),
  filingFindUnique: vi.fn(),
  filingUpsert: vi.fn(),
  checkBillingLimit: vi.fn(),
  executeCloudBatchInline: vi.fn(),
  extractSpy: vi.fn(),
  downloadBatchFileFromStorage: vi.fn(),
}));

vi.mock('@/lib/inngest/client', () => ({
  inngest: { send: mocks.inngestSend },
}));

vi.mock('@/lib/inngest/batch-file-extractor', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/inngest/batch-file-extractor')>();
  return {
    ...actual,
    extractBatchItemsFromFile: (file: File, options?: unknown) => {
      mocks.extractSpy(file.name);
      return actual.extractBatchItemsFromFile(file, options as never);
    },
  };
});

vi.mock('@/lib/inngest/batch-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/inngest/batch-storage')>();
  return {
    ...actual,
    downloadBatchFileFromStorage: (key: string, expectedTenantId: string, hint?: string) => {
      if (mocks.downloadBatchFileFromStorage.getMockImplementation()) {
        return mocks.downloadBatchFileFromStorage(key, expectedTenantId, hint);
      }
      return actual.downloadBatchFileFromStorage(key, expectedTenantId, hint);
    },
  };
});

vi.mock('@/lib/inngest/run-cloud-batch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/inngest/run-cloud-batch')>();
  return {
    ...actual,
    executeCloudBatchInline: mocks.executeCloudBatchInline,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock('@tariffos/database', () => ({
  billingService: {
    checkBillingLimit: mocks.checkBillingLimit,
  },
  prisma: {
    membership: { findFirst: mocks.membershipFindFirst },
    filing: {
      findUnique: mocks.filingFindUnique,
      upsert: mocks.filingUpsert,
    },
  },
}));

import { POST } from './route';

describe('POST /api/batch', () => {
  const originalCloudMode = process.env.NEXT_PUBLIC_CLOUD_MODE;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const originalBatchMode = process.env.BATCH_EXECUTION_MODE;

  afterEach(() => {
    vi.clearAllMocks();
    if (originalCloudMode === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloudMode;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    if (originalBatchMode === undefined) delete process.env.BATCH_EXECUTION_MODE;
    else process.env.BATCH_EXECUTION_MODE = originalBatchMode;
  });

  it('rejects empty batch payloads with 400', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const req = new Request('http://localhost/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ countryCode: 'VE' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('runs deterministic inline classification summary in offline mock mode', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const req = new Request('http://localhost/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filingId: 'fil-offline-1',
        countryCode: 'VE',
        sourceText: 'SKU-1 | Inversor solar híbrido 5kW | CN | 1000\nSKU-2 | MacBook Pro 14 | US | 2000',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      filingId: string;
      queued: boolean;
      totalItems: number;
      summary: { totalLines: number; totalCifUsd: number };
    };
    expect(body.filingId).toBe('fil-offline-1');
    expect(body.queued).toBe(false);
    expect(body.totalItems).toBe(2);
    expect(body.summary.totalLines).toBe(2);
    expect(body.summary.totalCifUsd).toBe(3000);
    expect(mocks.inngestSend).not.toHaveBeenCalled();
  });

  it('enqueues filing/batch.requested via Inngest when BATCH_EXECUTION_MODE=inngest', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.BATCH_EXECUTION_MODE = 'inngest';

    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'user-1', email: 'ops@agency.ve' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'tenant-ve', role: 'ADMIN' });
    mocks.filingUpsert.mockResolvedValue({ id: 'fil-cloud-42' });
    mocks.checkBillingLimit.mockResolvedValue({ allowed: true });
    mocks.inngestSend.mockResolvedValue({ ids: ['evt-123'] });

    const req = new Request('http://localhost/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filingId: 'fil-cloud-42',
        countryCode: 'VE',
        items: [
          {
            lineId: 'line-1',
            sku: 'INV-5KW',
            description: 'Inversor solar híbrido 5kW',
            originCountry: 'CN',
            cifValue: 1500,
          },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(202);
    const body = (await res.json()) as {
      filingId: string;
      queued: boolean;
      executionMode?: string;
      totalItems: number;
    };
    expect(body).toEqual({
      filingId: 'fil-cloud-42',
      queued: true,
      executionMode: 'inngest',
      totalItems: 1,
    });
    expect(mocks.checkBillingLimit).toHaveBeenCalledWith('tenant-ve', {
      requestedCount: 1,
      isBatch: true,
    });
    expect(mocks.inngestSend).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'filing/batch.requested',
        data: expect.objectContaining({
          filingId: 'fil-cloud-42',
          tenantId: 'tenant-ve',
          countryCode: 'VE',
        }),
      }),
    );
  });

  it('returns 403 when batch is excluded from plan and 402 when batch exceeds quota', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'user-1', email: 'ops@agency.ve' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'tenant-ve', role: 'ADMIN' });

    const makeReq = () =>
      new Request('http://localhost/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filingId: 'fil-blocked',
          countryCode: 'VE',
          items: [
            { lineId: 'l1', description: 'Inversor solar 5kW', originCountry: 'CN', cifValue: 1000 },
            { lineId: 'l2', description: 'Panel solar 550W', originCountry: 'CN', cifValue: 400 },
          ],
        }),
      });

    mocks.checkBillingLimit.mockResolvedValueOnce({ allowed: false, reason: 'BATCH_NOT_IN_PLAN' });
    const forbidden = await POST(makeReq());
    expect(forbidden.status).toBe(403);

    mocks.checkBillingLimit.mockResolvedValueOnce({ allowed: false, reason: 'LIMIT_REACHED' });
    const overQuota = await POST(makeReq());
    expect(overQuota.status).toBe(402);

    mocks.checkBillingLimit.mockResolvedValueOnce({ allowed: false, reason: 'QUOTA_CHECK_ERROR' });
    const checkErr = await POST(makeReq());
    expect(checkErr.status).toBe(503);
    expect(mocks.inngestSend).not.toHaveBeenCalled();
  });

  it('accepts multipart/form-data .csv invoice upload in offline and cloud modes', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const csvContent = [
      'SKU,Descripcion,Origen,Valor CIF,Cantidad',
      'INV-5KW,Inversor solar 5kW MPPT,CN,1200,2',
      'PNL-550,Panel solar 550W monocristalino,CN,300,4',
    ].join('\n');
    const form = new FormData();
    form.append('file', new File([csvContent], 'factura-abril.csv', { type: 'text/csv' }));
    form.append('countryCode', 'VE');

    const req = new Request('http://localhost/api/batch', {
      method: 'POST',
      body: form,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      queued: boolean;
      totalItems: number;
      fileName?: string;
      envelope?: { canvasComponents: Array<{ type: string }> };
    };
    expect(body.queued).toBe(false);
    expect(body.totalItems).toBe(2);
    expect(body.fileName).toBe('factura-abril.csv');
    expect(body.envelope?.canvasComponents[0]?.type).toBe('batch_manifest');
  });

  it('runs cloud batch inline without Inngest in local dev by default', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    delete process.env.BATCH_EXECUTION_MODE;
    delete process.env.INNGEST_DEV;

    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'user-1', email: 'ops@agency.ve' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'tenant-ve', role: 'ADMIN' });
    mocks.checkBillingLimit.mockResolvedValue({ allowed: true });
    mocks.filingUpsert.mockResolvedValue({ id: 'fil-local-inline' });
    mocks.executeCloudBatchInline.mockResolvedValue({
      lines: [],
      summary: {
        totalLines: 1,
        autoClassifiedCount: 1,
        proposedReviewCount: 0,
        blockedCount: 0,
        averageConfidencePct: 92,
        totalCifUsd: 1000,
        totalDutiesUsd: 140,
        totalIvaUsd: 182.4,
      },
      envelope: {
        assistantMessage: 'Lote procesado en línea',
        classificationStatus: 'classified',
        inlineComponents: [],
        canvasComponents: [],
      },
    });

    const req = new Request('http://localhost/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filingId: 'fil-local-inline',
        countryCode: 'VE',
        items: [{ lineId: 'l1', description: 'Inversor solar 5kW', originCountry: 'CN', cifValue: 1000 }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      queued: boolean;
      executionMode: string;
      envelope: { assistantMessage: string };
    };
    expect(body.queued).toBe(false);
    expect(body.executionMode).toBe('inline');
    expect(body.envelope.assistantMessage).toBe('Lote procesado en línea');
    expect(mocks.executeCloudBatchInline).toHaveBeenCalledTimes(1);
    expect(mocks.inngestSend).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated multipart upload in cloud mode BEFORE running file/VL extraction', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.getAuthenticatedUser.mockResolvedValueOnce(null);

    const form = new FormData();
    form.append('file', new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'factura.pdf', { type: 'application/pdf' }));
    form.append('countryCode', 'VE');

    const res = await POST(new Request('http://localhost/api/batch', { method: 'POST', body: form }));
    expect(res.status).toBe(401);
    expect(mocks.extractSpy).not.toHaveBeenCalled();
  });

  it('rejects unsupported countryCode in cloud mode with 422', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'user-1', email: 'ops@agency.ve' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'tenant-ve', role: 'ADMIN' });

    const req = new Request('http://localhost/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countryCode: 'XX',
        items: [{ lineId: 'l1', description: 'Inversor solar 5kW', originCountry: 'CN', cifValue: 1000 }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
    expect(mocks.checkBillingLimit).not.toHaveBeenCalled();
  });

  it('rejects caller-supplied filingId owned by another tenant with 403', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'user-1', email: 'ops@agency.ve' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'tenant-ve', role: 'ADMIN' });
    mocks.checkBillingLimit.mockResolvedValue({ allowed: true });
    mocks.filingFindUnique.mockResolvedValueOnce({ tenantId: 'other-tenant' });

    const req = new Request('http://localhost/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filingId: 'fil-stolen',
        countryCode: 'VE',
        items: [{ lineId: 'l1', description: 'Inversor solar 5kW', originCountry: 'CN', cifValue: 1000 }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(mocks.filingUpsert).not.toHaveBeenCalled();
    expect(mocks.inngestSend).not.toHaveBeenCalled();
  });

  it('forwards fileName and documentMeta to Inngest when queued', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.BATCH_EXECUTION_MODE = 'inngest';
    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'user-1', email: 'ops@agency.ve' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'tenant-ve', role: 'ADMIN' });
    mocks.checkBillingLimit.mockResolvedValue({ allowed: true });
    mocks.filingFindUnique.mockResolvedValueOnce(null);
    mocks.filingUpsert.mockResolvedValue({ id: 'fil-csv-1' });
    mocks.inngestSend.mockResolvedValue({ ids: ['evt-csv'] });

    const form = new FormData();
    form.append(
      'file',
      new File(['SKU,Descripcion,Origen,CIF\nINV-5,Inversor 5kW,CN,1200'], 'factura-csv.csv', {
        type: 'text/csv',
      }),
    );
    form.append('countryCode', 'VE');

    const res = await POST(new Request('http://localhost/api/batch', { method: 'POST', body: form }));
    expect(res.status).toBe(202);
    expect(mocks.inngestSend).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fileName: 'factura-csv.csv',
        }),
      }),
    );
  });

  it('downloads batch invoice from Storage when storageKey is supplied and blocks cross-tenant access with 403', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.BATCH_EXECUTION_MODE = 'inngest';
    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'user-1', email: 'ops@agency.ve' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'tenant-ve', role: 'ADMIN' });
    mocks.checkBillingLimit.mockResolvedValue({ allowed: true });
    mocks.filingFindUnique.mockResolvedValue(null);
    mocks.filingUpsert.mockResolvedValue({ id: 'fil-storage-1' });
    mocks.inngestSend.mockResolvedValue({ ids: ['evt-storage'] });

    const crossTenantReq = new Request('http://localhost/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countryCode: 'VE',
        storageKey: 'other-tenant/123-factura.csv',
        fileName: 'factura.csv',
      }),
    });
    const crossTenantRes = await POST(crossTenantReq);
    expect(crossTenantRes.status).toBe(403);

    mocks.downloadBatchFileFromStorage.mockResolvedValueOnce(
      new File(['SKU,Descripcion,Origen,CIF\nBAT-1,Batería litio 48V,CN,900'], 'factura-pesada.csv', {
        type: 'text/csv',
      }),
    );

    const validReq = new Request('http://localhost/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filingId: 'fil-storage-1',
        countryCode: 'VE',
        storageKey: 'tenant-ve/123-factura-pesada.csv',
        fileName: 'factura-pesada.csv',
      }),
    });
    const validRes = await POST(validReq);
    expect(validRes.status).toBe(202);
    expect(mocks.downloadBatchFileFromStorage).toHaveBeenCalledWith(
      'tenant-ve/123-factura-pesada.csv',
      'tenant-ve',
      'factura-pesada.csv',
    );
    expect(mocks.inngestSend).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fileName: 'factura-pesada.csv',
          items: [expect.objectContaining({ description: 'Batería litio 48V' })],
        }),
      }),
    );
  });
});
