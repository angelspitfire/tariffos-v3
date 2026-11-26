'use client';

import { useMemo, useState } from 'react';
import type {
  A2UICalculatorComponent,
  A2UIDossierComponent,
  IncotermCode,
  JurisdictionConfig,
} from '@tariffos/shared-types';
import {
  calculateDeterministicDuties,
  inferTradeParamsFromContext,
} from '@/lib/workspace/duty-engine';
import { CifTopKpiStrip } from '../molecules/CifTopKpiStrip';
import { DutyAdvancedAccordion } from '../molecules/DutyAdvancedAccordion';

interface DutyCalculatorViewProps {
  calculator: A2UICalculatorComponent;
  jurisdiction: JurisdictionConfig;
  dossier?: A2UIDossierComponent;
}

const INCOTERMS: readonly IncotermCode[] = ['EXW', 'FOB', 'CFR', 'CIF', 'DDP'];

function fmt(currency: string, val: number): string {
  return `${currency} ${val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function DutyCalculatorView({
  calculator,
  jurisdiction,
  dossier,
}: DutyCalculatorViewProps) {
  const inferred = useMemo(
    () => inferTradeParamsFromContext({ calculator, dossier, jurisdiction }),
    [calculator, dossier, jurisdiction]
  );

  const [incoterm, setIncoterm] = useState<IncotermCode>(inferred.incoterm);
  const [invoiceAmount, setInvoiceAmount] = useState(10000);
  const [freightAmount, setFreightAmount] = useState(850);
  const [insuranceAmount, setInsuranceAmount] = useState(150);
  const [originCode, setOriginCode] = useState(inferred.originCode);
  const [adValorem, setAdValorem] = useState(calculator.adValoremPercent);
  const [vat, setVat] = useState(calculator.vatPercent);
  const [customsFee, setCustomsFee] = useState(calculator.customsServiceFeePercent);
  const [exchangeRate, setExchangeRate] = useState(calculator.suggestedExchangeRate);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [applyExemption, setApplyExemption] = useState(calculator.exemptionAvailable);
  const [applyAntidumping, setApplyAntidumping] = useState((calculator.antidumpingPercent ?? 0) > 0);
  const [antidumpingPercent, setAntidumpingPercent] = useState(calculator.antidumpingPercent ?? 20);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const result = useMemo(
    () =>
      calculateDeterministicDuties({
        jurisdictionId: jurisdiction.id,
        hsCode: calculator.hsCode,
        originCode,
        incoterm,
        invoiceAmount,
        originChargesAmount: 0,
        freightAmount,
        insuranceAmount,
        baseAdValoremPercent: adValorem,
        vatPercent: vat,
        customsFeePercent: customsFee,
        exchangeRate,
        applyExemption,
        hasCertificateOfOrigin: hasCertificate,
        preferentialDiscountOverridePercent: calculator.preferentialDiscountPercent ?? null,
        applyAntidumping,
        antidumpingPercent,
      }),
    [
      jurisdiction.id, calculator.hsCode, calculator.preferentialDiscountPercent,
      originCode, incoterm, invoiceAmount, freightAmount, insuranceAmount,
      adValorem, vat, customsFee, exchangeRate, applyExemption, hasCertificate,
      applyAntidumping, antidumpingPercent,
    ]
  );

  return (
    <div className="space-y-4 p-4">
      <CifTopKpiStrip
        currencyCode={calculator.currencyCode}
        localCurrencyCode={calculator.localCurrencyCode}
        valuationBasisLabel={result.valuationBasisLabel}
        customsValue={result.customsValue}
        totalTaxes={result.totalTaxes}
        landedCost={result.landedCost}
        effectiveTaxBurdenPercent={result.effectiveTaxBurdenPercent}
        localLandedCost={result.localLandedCost}
      />

      <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-ink-secondary">
            Parámetros de valoración ({calculator.hsCode})
          </h3>
          <fieldset className="flex items-center gap-1 border-0 p-0">
            <legend className="sr-only">Seleccionar Incoterm</legend>
            {INCOTERMS.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setIncoterm(code)}
                className={`rounded-md px-2 py-1 font-mono text-[11px] font-medium transition ${
                  incoterm === code
                    ? 'bg-accent-brand text-white'
                    : 'bg-surface-muted text-ink-secondary hover:bg-surface-hover'
                }`}
              >
                {code}
              </button>
            ))}
          </fieldset>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium text-ink-secondary">Valor Factura ({calculator.currencyCode})</span>
            <input type="number" min="0" step="100" value={invoiceAmount} onChange={(e) => setInvoiceAmount(Number(e.target.value) || 0)} className="rounded-lg border border-border-subtle bg-surface-input px-3 py-2 font-mono text-sm text-ink-primary outline-none focus:border-accent-brand" />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium text-ink-secondary">Flete Internacional ({calculator.currencyCode})</span>
            <input type="number" min="0" step="50" value={freightAmount} onChange={(e) => setFreightAmount(Number(e.target.value) || 0)} className="rounded-lg border border-border-subtle bg-surface-input px-3 py-2 font-mono text-sm text-ink-primary outline-none focus:border-accent-brand" />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium text-ink-secondary">Seguro ({calculator.currencyCode})</span>
            <input type="number" min="0" step="10" value={insuranceAmount} onChange={(e) => setInsuranceAmount(Number(e.target.value) || 0)} className="rounded-lg border border-border-subtle bg-surface-input px-3 py-2 font-mono text-sm text-ink-primary outline-none focus:border-accent-brand" />
          </label>
        </div>
      </section>

      <DutyAdvancedAccordion
        open={advancedOpen}
        onToggle={() => setAdvancedOpen((prev) => !prev)}
        originCode={originCode}
        onOriginChange={setOriginCode}
        adValorem={adValorem}
        onAdValoremChange={setAdValorem}
        vat={vat}
        onVatChange={setVat}
        customsFee={customsFee}
        onCustomsFeeChange={setCustomsFee}
        exchangeRate={exchangeRate}
        onExchangeRateChange={setExchangeRate}
        localCurrencyCode={calculator.localCurrencyCode}
        hasCertificate={hasCertificate}
        onHasCertificateChange={setHasCertificate}
        applyExemption={applyExemption}
        onApplyExemptionChange={setApplyExemption}
        applyAntidumping={applyAntidumping}
        onApplyAntidumpingChange={setApplyAntidumping}
        antidumpingPercent={antidumpingPercent}
        onAntidumpingPercentChange={setAntidumpingPercent}
        agreement={result.agreement}
      />

      <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
        <h3 className="text-xs font-semibold text-ink-secondary">
          Desglose determinista de tributos
        </h3>
        <dl className="mt-2.5 divide-y divide-border-hairline text-xs">
          <div className="flex justify-between py-1.5">
            <dt className="text-ink-secondary">Ad Valorem ({result.effectiveAdValoremPercent}%)</dt>
            <dd className="font-mono font-medium text-ink-primary tabular-nums">{fmt(calculator.currencyCode, result.adValoremAmount)}</dd>
          </div>
          {result.antidumpingAmount > 0 && (
            <div className="flex justify-between py-1.5">
              <dt className="text-amber-700 dark:text-amber-300">Antidumping ({result.effectiveAntidumpingPercent}%)</dt>
              <dd className="font-mono font-medium text-amber-700 tabular-nums dark:text-amber-300">{fmt(calculator.currencyCode, result.antidumpingAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between py-1.5">
            <dt className="text-ink-secondary">Tasa de Servicio Aduanero ({result.effectiveCustomsFeePercent}%)</dt>
            <dd className="font-mono font-medium text-ink-primary tabular-nums">{fmt(calculator.currencyCode, result.customsFeeAmount)}</dd>
          </div>
          <div className="flex justify-between py-1.5">
            <dt className="text-ink-secondary">IVA de Importación ({result.effectiveVatPercent}%)</dt>
            <dd className="font-mono font-medium text-ink-primary tabular-nums">{fmt(calculator.currencyCode, result.vatAmount)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
