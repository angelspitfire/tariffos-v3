// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBcvRate } from './use-bcv-rate';

describe('useBcvRate', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('does not overwrite user-edited exchange rate during automatic hydration, but updates on explicit refresh', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            rates: { 'USD/VES': { rate: 52.43, valueDate: '2026-11-26' } },
            stale: false,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            rates: { 'USD/VES': { rate: 53.1, valueDate: '2026-11-27' } },
            stale: false,
          }),
          { status: 200 },
        ),
      ) as typeof fetch;

    const onRateResolved = vi.fn();
    const { result } = renderHook(() =>
      useBcvRate({
        jurisdictionId: 've-seniat',
        currencyCode: 'USD',
        isUserEdited: true,
        onRateResolved,
      }),
    );

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));
    expect(onRateResolved).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.refreshBcvRate();
    });

    expect(onRateResolved).toHaveBeenCalledWith(53.1);
    expect(result.current.error).toBeNull();
  });

  it('exposes error state when explicit refresh fails and clears it on success', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            rates: { 'USD/VES': { rate: 52.43, valueDate: '2026-11-26' } },
            stale: false,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'BCV down' }), { status: 503 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            rates: { 'USD/VES': { rate: 52.9, valueDate: '2026-11-26' } },
            stale: false,
          }),
          { status: 200 },
        ),
      ) as typeof fetch;

    const { result } = renderHook(() =>
      useBcvRate({
        jurisdictionId: 've-seniat',
        currencyCode: 'USD',
        onRateResolved: vi.fn(),
      }),
    );

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.refreshBcvRate();
    });
    expect(result.current.error).toMatch(/BCV|tasa/i);

    await act(async () => {
      await result.current.refreshBcvRate();
    });
    expect(result.current.error).toBeNull();
  });
});
