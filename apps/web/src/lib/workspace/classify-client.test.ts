import { afterEach, describe, expect, it, vi } from 'vitest';
import { JURISDICTIONS } from './jurisdictions';
import { classifyStream } from './classify-client';

describe('classifyStream (cloud contract)', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    vi.unstubAllEnvs();
    globalThis.fetch = originalFetch;
  });

  it('sends full classification parameters including countryCode, approvalWorkflowMode, incoterm, cifValue, hitlAnswers and deepMode', async () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUD_MODE', 'true');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');

    const sseBody = [
      'event: progress\ndata: {"stage":"pre_gate","label":"Pre-Gate","progressPct":15}\n\n',
      'event: result\ndata: {"assistantMessage":"OK","classificationStatus":"classified","workflowState":"classified","inlineComponents":[],"canvasComponents":[]}\n\n',
    ].join('');

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(sseBody, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const ve = JURISDICTIONS[0];
    await classifyStream({
      query: 'MacBook Pro 14 M3',
      jurisdiction: ve,
      approvalWorkflowMode: 'always_review',
      incoterm: 'CIF',
      cifValue: 2400,
      originCountry: 'US',
      hitlAnswers: { peso: '1.6 kg' },
      deepMode: true,
      sku: 'MBP-14-M3',
      attachmentsText: '1.6 kg, pantalla 14.2 pulgadas',
      isBatchHint: false,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const sent = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(sent).toMatchObject({
      query: 'MacBook Pro 14 M3',
      jurisdictionId: 've-seniat',
      countryCode: 'VE',
      approvalWorkflowMode: 'always_review',
      incoterm: 'CIF',
      cifValue: 2400,
      originCountry: 'US',
      hitlAnswers: { peso: '1.6 kg' },
      deepMode: true,
      sku: 'MBP-14-M3',
      attachmentsText: '1.6 kg, pantalla 14.2 pulgadas',
      isBatchHint: false,
    });
  });

  it('throws the server error in cloud mode instead of silently returning offline mock data', async () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUD_MODE', 'true');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');

    globalThis.fetch = vi.fn().mockResolvedValue(
      Response.json({ error: 'Jurisdiction not yet available in live mode' }, { status: 422 }),
    ) as unknown as typeof fetch;

    await expect(
      classifyStream({
        query: 'Laptop',
        jurisdiction: JURISDICTIONS[3],
      }),
    ).rejects.toThrow(/Jurisdiction not yet available/i);
  });

  it('throws when the cloud SSE stream emits an explicit error frame', async () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUD_MODE', 'true');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');

    const sseBody = 'event: error\ndata: {"code":"LIVE_PIPELINE_ERROR","message":"NVIDIA timeout"}\n\n';
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(sseBody, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }),
    ) as unknown as typeof fetch;

    await expect(
      classifyStream({
        query: 'Laptop',
        jurisdiction: JURISDICTIONS[0],
      }),
    ).rejects.toThrow(/NVIDIA timeout/);
  });
});
