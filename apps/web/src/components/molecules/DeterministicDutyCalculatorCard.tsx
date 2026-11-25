'use client';

import type { DeterministicDuties } from '@tariffos/shared-types';
import { Calculator } from 'lucide-react';

export interface DeterministicDutyCalculatorCardProps {
  hsCode: string;
  duties: DeterministicDuties;
}

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Renders deterministic customs duty and tax breakdown. */
export function DeterministicDutyCalculatorCard({
  hsCode,
  duties,
}: DeterministicDutyCalculatorCardProps) {
  const totalTaxes = duties.arancelAmount + duties.ivaAmount;
  const landedTotal = duties.cif + totalTaxes;

  return (
    <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 space-y-3">
      <header className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-accent-ink" />
          <h3 className="text-sm font-semibold text-ink-primary">Calculadora Determinista</h3>
        </div>
        <span className="tabular-nums text-xs text-ink-muted">
          {hsCode} · Unidad: {duties.unit}
        </span>
      </header>

      <dl className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="rounded-lg border border-border-subtle bg-surface-muted p-2.5">
          <dt className="text-ink-muted">Base CIF</dt>
          <dd className="tabular-nums mt-0.5 text-sm font-semibold text-ink-primary">
            {formatMoney(duties.cif)}
          </dd>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface-muted p-2.5">
          <dt className="text-ink-muted">Arancel ({duties.adValoremRate}%)</dt>
          <dd className="tabular-nums mt-0.5 text-sm font-semibold text-ink-primary">
            {formatMoney(duties.arancelAmount)}
          </dd>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface-muted p-2.5">
          <dt className="text-ink-muted">IVA ({duties.ivaRate}%)</dt>
          <dd className="tabular-nums mt-0.5 text-sm font-semibold text-ink-primary">
            {formatMoney(duties.ivaAmount)}
          </dd>
        </div>
        <div className="rounded-lg border border-accent-border bg-accent-soft p-2.5">
          <dt className="text-accent-ink">Total Nacionalizado</dt>
          <dd className="tabular-nums mt-0.5 text-sm font-bold text-accent-ink">
            {formatMoney(landedTotal)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
