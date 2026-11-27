import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { A2UIEnvelope } from '@tariffos/shared-types';
import {
  fetchBatchRealtimeToken,
  fetchBatchResult,
  submitBatchFile,
} from './batch-client';

const SAMPLE_BATCH_ENVELOPE: A2UIEnvelope = {
  assistantMessage: 'Lote procesado: 2 ítems',
  classificationStatus: 'classified',
  inlineComponents: [],
  canvasComponents: [
    {
      type: 'batch_manifest',
      id: 'batch-1',
      title: 'Manifiesto',
      currencyCode: 'USD',
      items: [],
    },
  ],
};

describe('batch-client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uploads FormData to POST /api/batch and surfaces friendly HTTP errors', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          filingId: 'fil-1',
          queued: true,
          totalItems: 12,
          fileName: 'factura.xlsx',
        }),
        { status: 202 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const file = new File(['abc'], 'factura.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const res = await submitBatchFile({ file, countryCode: 'VE', deepMode: false });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/batch');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect(res).toEqual({
      filingId: 'fil-1',
      queued: true,
      totalItems: 12,
      fileName: 'factura.xlsx',
      envelope: null,
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ error: 'Tu plan actual no incluye lotes.' }), { status: 403 }),
      ),
    );
    await expect(submitBatchFile({ file, countryCode: 'VE' })).rejects.toThrow(
      'Tu plan actual no incluye lotes.',
    );
  });

  it('fetches batch results and realtime subscription token cleanly', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              filingId: 'fil-1',
              status: 'Completed',
              totalLines: 2,
              envelope: SAMPLE_BATCH_ENVELOPE,
            }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ token: { channel: 'batch:fil-1', key: 'k' } }), {
            status: 200,
          }),
        ),
    );

    const result = await fetchBatchResult('fil-1');
    expect(result.status).toBe('Completed');
    expect(result.envelope?.canvasComponents[0]?.type).toBe('batch_manifest');

    const token = await fetchBatchRealtimeToken('fil-1');
    expect(token).toEqual({ channel: 'batch:fil-1', key: 'k' });
  });

  it('uses signed Storage upload flow when file exceeds 3.5 MB threshold in cloud mode', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            mode: 'cloud',
            directInline: false,
            storageKey: 'tenant-ve/123-scan.pdf',
            signedUrl: 'https://storage.example/put-scan',
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            filingId: 'fil-big-1',
            queued: true,
            totalItems: 4,
            fileName: 'scan-pesado.pdf',
          }),
          { status: 202 },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    const bigFile = new File(['%PDF-1.7'], 'scan-pesado.pdf', { type: 'application/pdf' });
    Object.defineProperty(bigFile, 'size', { value: 5 * 1024 * 1024 });

    const res = await submitBatchFile({ file: bigFile, countryCode: 'VE', deepMode: true });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/batch/upload-url');
    expect(fetchMock.mock.calls[1]?.[0]).toBe('https://storage.example/put-scan');
    expect((fetchMock.mock.calls[1]?.[1] as RequestInit).method).toBe('PUT');
    expect(fetchMock.mock.calls[2]?.[0]).toBe('/api/batch');
    expect(JSON.parse(String((fetchMock.mock.calls[2]?.[1] as RequestInit).body))).toEqual({
      storageKey: 'tenant-ve/123-scan.pdf',
      fileName: 'scan-pesado.pdf',
      countryCode: 'VE',
      deepMode: true,
    });
    expect(res).toEqual({
      filingId: 'fil-big-1',
      queued: true,
      totalItems: 4,
      fileName: 'scan-pesado.pdf',
      envelope: null,
    });
  });

  it('keeps browser imports free of server-only batch-storage, supabase/admin, and database modules', () => {
    const source = readFileSync(resolve(__dirname, './batch-client.ts'), 'utf8');
    expect(source).not.toMatch(/['"]@\/lib\/inngest\/batch-storage['"]/);
    expect(source).toMatch(/['"]@\/lib\/inngest\/batch-storage-constants['"]/);
    expect(source).not.toMatch(/['"]@\/lib\/supabase\/admin['"]/);
    expect(source).not.toMatch(/['"]@tariffos\/database['"]/);
  });
});
