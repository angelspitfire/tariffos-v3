import { afterEach, describe, expect, it, vi } from 'vitest';
import { SupabaseCloudAdapter } from './supabase-cloud-adapter';
import { DEFAULT_USER_PROFILE } from './types';

describe('SupabaseCloudAdapter', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches and persists threads, precedents, and profile via workspace API routes', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ threads: [{ id: 't1', title: 'Laptop' }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ precedents: [{ id: 'p1', sku: 'SKU-1' }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ profile: DEFAULT_USER_PROFILE }), { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);
    const adapter = new SupabaseCloudAdapter();

    const threads = await adapter.loadThreads();
    expect(threads[0]?.id).toBe('t1');
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/workspace/threads', undefined);

    await adapter.saveSkuPrecedent({
      id: 'p1',
      sku: 'SKU-1',
      normalizedSku: 'SKU-1',
      title: 'Test',
      description: 'Test product',
      hsCode: '8471.30.90.90',
      jurisdictionId: 've-seniat',
      adValoremPercent: 16,
      vatPercent: 16,
      legalRegime: 'General',
      reviewStatus: 'approved',
      usageCount: 1,
      createdAt: '2026-11-26T00:00:00Z',
      updatedAt: '2026-11-26T00:00:00Z',
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/workspace/precedents',
      expect.objectContaining({ method: 'PUT' }),
    );

    const precedents = await adapter.loadSkuPrecedents();
    expect(precedents[0]?.sku).toBe('SKU-1');

    const profile = await adapter.loadUserProfile();
    expect(profile?.defaultJurisdictionId).toBe('ve-seniat');
  });

  it('throws on non-OK status so DualWritePersistence can distinguish offline failure from empty cloud data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unauthorized', { status: 401 })));
    const adapter = new SupabaseCloudAdapter();
    await expect(adapter.loadThreads()).rejects.toThrow(/HTTP 401/);
    await expect(adapter.loadSkuPrecedents()).rejects.toThrow(/HTTP 401/);
    await expect(adapter.loadUserProfile()).rejects.toThrow(/HTTP 401/);
  });
});
