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
});
