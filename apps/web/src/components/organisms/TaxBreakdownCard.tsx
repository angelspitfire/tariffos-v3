'use client';

import { useState } from 'react';
import { TaxSummary } from '@/types/domain';
import { SkeletonCard, SkeletonText } from '@/components/atoms/Skeleton';
import {
  convertCustomsCurrency,
  formatCustomsCurrency,
  CUSTOMS_EXCHANGE_RATES,
} from '@/lib/exchange-rate';
import { Landmark } from 'lucide-react';

export function TaxBreakdownCard({ payload, isLoading = false }: { payload: TaxSummary; isLoading?: boolean }) {
  const [currency, setCurrency] = useState<'USD' | 'Bs.'>('USD');

  if (isLoading) {
    return (
      <SkeletonCard>
        <SkeletonText lines={5} />
      </SkeletonCard>
    );
  }

  const { totalAmount, breakdown } = payload;
  const isBs = currency === 'Bs.';
  const veRate = CUSTOMS_EXCHANGE_RATES['VE'].rate;

  const displayTotal = isBs
    ? convertCustomsCurrency(totalAmount, 'VE')
    : totalAmount;

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-hi)]">Liquidación Tributaria Aduanal</h3>
          <p className="text-[11px] text-[var(--text-lo)] flex items-center gap-1 mt-0.5">
            <Landmark className="w-3 h-3 text-indigo-400" />
            <span>Tasa Oficial BCV: 1 USD = {veRate.toFixed(2)} Bs.</span>
          </p>
        </div>
        <div className="flex items-center gap-1 bg-zinc-900 border border-[var(--border-mid)] rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            aria-label="Ver tributos en dólares americanos"
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
              !isBs ? 'bg-[var(--brand)] text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            USD
          </button>
          <button
            type="button"
            onClick={() => setCurrency('Bs.')}
            aria-label="Ver tributos en bolívares digitales"
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
              isBs ? 'bg-[var(--brand)] text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Bs. (Oficial)
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {breakdown.map((item, idx) => {
          const itemAmount = isBs
            ? convertCustomsCurrency(item.amount, 'VE')
            : item.amount;

          return (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-mid)]">{item.concept}</span>
              <div className="flex items-center gap-4 text-right">
                <span className="text-[var(--text-lo)] font-mono-numbers">{item.rate}%</span>
                <span className="text-[var(--text-hi)] font-mono-numbers font-medium">
                  {formatCustomsCurrency(itemAmount, currency)}
                </span>
              </div>
            </div>
          );
        })}

        <div className="pt-3 border-t border-[var(--border-divider)] flex items-center justify-between text-sm font-semibold">
          <span className="text-[var(--text-hi)]">Total a pagar</span>
          <span className="text-indigo-400 font-mono-numbers text-base font-bold">
            {formatCustomsCurrency(displayTotal, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
