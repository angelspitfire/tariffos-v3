'use client';

import { formatCurrencyAmount } from '@/lib/workspace/format-locale';

interface CifTopKpiStripProps {
  currencyCode: string;
  localCurrencyCode: string;
  valuationBasisLabel: string;
  customsValue: number;
  totalTaxes: number;
  landedCost: number;
  effectiveTaxBurdenPercent: number;
  localLandedCost: number;
}

export function CifTopKpiStrip({
  currencyCode,
  localCurrencyCode,
  valuationBasisLabel,
  customsValue,
  totalTaxes,
  landedCost,
  effectiveTaxBurdenPercent,
  localLandedCost,
}: CifTopKpiStripProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      <div className="rounded-xl border border-border-subtle bg-surface-panel p-3 shadow-xs">
        <div className="text-[11px] font-medium text-ink-muted">Base CIF</div>
        <div
          data-testid="kpi-cif-value"
          className="mt-1 font-mono text-base font-semibold text-ink-primary tabular-nums"
        >
          {formatCurrencyAmount(currencyCode, customsValue)}
        </div>
        <div className="mt-0.5 text-[11px] text-ink-subtle">{valuationBasisLabel}</div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-panel p-3 shadow-xs">
        <div className="text-[11px] font-medium text-ink-muted">Total Tributos</div>
        <div
          data-testid="kpi-taxes-value"
          className="mt-1 font-mono text-base font-semibold text-accent-ink tabular-nums"
        >
          {formatCurrencyAmount(currencyCode, totalTaxes)}
        </div>
        <div className="mt-0.5 text-[11px] text-ink-subtle tabular-nums">
          Carga efectiva: {effectiveTaxBurdenPercent.toFixed(1)}%
        </div>
      </div>

      <div className="rounded-xl border border-accent-border bg-accent-soft p-3 shadow-xs">
        <div className="text-[11px] font-medium text-accent-ink">Costo Nacionalizado</div>
        <div
          data-testid="kpi-landed-value"
          className="mt-1 font-mono text-base font-bold text-ink-primary tabular-nums"
        >
          {formatCurrencyAmount(currencyCode, landedCost)}
        </div>
        {localCurrencyCode !== currencyCode ? (
          <div className="mt-0.5 font-mono text-[11px] text-ink-secondary tabular-nums">
            ≈ {formatCurrencyAmount(localCurrencyCode, localLandedCost)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
