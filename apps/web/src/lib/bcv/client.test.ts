import { describe, expect, it, vi } from 'vitest';
import { fetchBcvRates } from './client';

const VALID_BCV_HTML = `
  <div id="dolar"><strong> 52,4312 </strong></div>
  <div id="euro"><strong> 55,1048 </strong></div>
  <span class="date-display-single" content="2026-11-26T00:00:00-04:00">Jueves</span>
`;

describe('fetchBcvRates', () => {
  it('returns official bcv.org.ve rates when primary source responds cleanly', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(VALID_BCV_HTML, { status: 200 }));

    const quotes = await fetchBcvRates({ fetchImpl });
    expect(quotes).toHaveLength(2);
    expect(quotes[0]).toMatchObject({ pair: 'USD/VES', rate: 52.4312, source: 'bcv.org.ve' });
    expect(quotes[1]).toMatchObject({ pair: 'EUR/VES', rate: 55.1048, source: 'bcv.org.ve' });
  });

  it('falls back to official mirror when bcv.org.ve is unreachable or errors', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('TLS handshake timeout'))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ promedio: 52.55, fechaActualizacion: '2026-11-26T18:00:00.000Z' }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ promedio: 55.25, fechaActualizacion: '2026-11-26T18:00:00.000Z' }),
          { status: 200 },
        ),
      );

    const quotes = await fetchBcvRates({ fetchImpl });
    expect(quotes).toHaveLength(2);
    expect(quotes[0]).toMatchObject({
      pair: 'USD/VES',
      rate: 52.55,
      valueDate: '2026-11-26',
      source: 'bcv-fallback',
    });
    expect(quotes[1]).toMatchObject({
      pair: 'EUR/VES',
      rate: 55.25,
      source: 'bcv-fallback',
    });
  });

  it('throws when both primary and fallback sources fail', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('Service Unavailable', { status: 503 }))
      .mockResolvedValueOnce(new Response('Error', { status: 500 }))
      .mockResolvedValueOnce(new Response('Error', { status: 500 }));

    await expect(fetchBcvRates({ fetchImpl })).rejects.toThrow(/BCV/i);
  });
});
