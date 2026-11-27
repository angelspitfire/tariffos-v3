'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ExchangeRateQuotePayload {
  rate?: number;
  valueDate?: string;
}

interface LatestRatesApiResponse {
  rates?: Record<string, ExchangeRateQuotePayload>;
  stale?: boolean;
  error?: string;
}

export interface BcvRateMeta {
  valueDate: string;
  stale: boolean;
}

/**
 * Hydrates and refreshes official BCV rates for `ve-seniat` duty calculations
 * without altering user-edited rates unless explicitly refreshed.
 */
export function useBcvRate(params: {
  jurisdictionId: string;
  currencyCode: string;
  isUserEdited?: boolean;
  onRateResolved: (rate: number) => void;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rateMeta, setRateMeta] = useState<BcvRateMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onRateRef = useRef(params.onRateResolved);
  onRateRef.current = params.onRateResolved;
  const isEditedRef = useRef(Boolean(params.isUserEdited));
  isEditedRef.current = Boolean(params.isUserEdited);

  const isVenezuela = params.jurisdictionId === 've-seniat';
  const pairKey = params.currencyCode.toUpperCase() === 'EUR' ? 'EUR/VES' : 'USD/VES';

  const loadRate = useCallback(
    async (refresh: boolean) => {
      if (!isVenezuela || typeof fetch === 'undefined') return;
      if (refresh) {
        setIsRefreshing(true);
        setError(null);
      }
      try {
        const res = await fetch(
          refresh ? '/api/exchange-rates/latest?refresh=1' : '/api/exchange-rates/latest',
        );
        if (!res.ok) {
          if (refresh) setError('No se pudo actualizar la tasa BCV en este momento.');
          return;
        }
        const json = (await res.json()) as LatestRatesApiResponse;
        const quote = json.rates?.[pairKey];
        if (typeof quote?.rate === 'number' && Number.isFinite(quote.rate) && quote.rate > 0) {
          if (refresh || !isEditedRef.current) {
            onRateRef.current(quote.rate);
          }
          if (quote.valueDate) {
            setRateMeta({ valueDate: quote.valueDate, stale: Boolean(json.stale) });
          }
          setError(null);
        }
      } catch {
        if (refresh) setError('Error de conexión al consultar la tasa oficial BCV.');
      } finally {
        if (refresh) setIsRefreshing(false);
      }
    },
    [isVenezuela, pairKey],
  );

  useEffect(() => {
    void loadRate(false);
  }, [loadRate]);

  return {
    isBcvJurisdiction: isVenezuela,
    isRefreshing,
    rateMeta,
    error,
    refreshBcvRate: () => loadRate(true),
  };
}
