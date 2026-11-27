'use client';

import { useCallback, useMemo, useState } from 'react';
import type { A2UICalculatorComponent, A2UIDossierComponent, IncotermCode, JurisdictionConfig } from '@tariffos/shared-types';
import { calculateDeterministicDuties, inferTradeParamsFromContext } from '@/lib/workspace/duty-engine';
import { formatCurrencyAmount } from '@/lib/workspace/format-locale';
import { useBcvRate } from '@/lib/workspace/use-bcv-rate';
import { DecimalField } from '../atoms/DecimalField';
import { CifTopKpiStrip } from '../molecules/CifTopKpiStrip';
import { DutyAdvancedAccordion, type DutyAdvancedValues } from '../molecules/DutyAdvancedAccordion';

interface DutyCalculatorViewProps {
  calculator: A2UICalculatorComponent;
  jurisdiction: JurisdictionConfig;
  dossier?: A2UIDossierComponent;
}

const INCOTERMS: readonly IncotermCode[] = ['EXW', 'FOB', 'CFR', 'CIF', 'DDP'];
const DEFAULT_INVOICE = 10000;
const DEFAULT_FREIGHT = 850;
const DEFAULT_INSURANCE = 150;

function extractDeclaredInvoice(dossier?: A2UIDossierComponent): number | null {
  for (const spec of dossier?.technicalSpecs ?? []) {
    if (!/valor|factura|fob|cif|monto|precio/i.test(spec.key)) continue;
    const match = spec.value.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
    const parsed = match ? Number(match[1]) : NaN;
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

export function DutyCalculatorView({ calculator, jurisdiction, dossier }: DutyCalculatorViewProps) {
  const inferred = useMemo(
    () => inferTradeParamsFromContext({ calculator, dossier, jurisdiction }),
    [calculator, dossier, jurisdiction],
  );
  const [incoterm, setIncoterm] = useState<IncotermCode>(inferred.incoterm);
  const [invoiceAmount, setInvoiceAmount] = useState(() => extractDeclaredInvoice(dossier) ?? DEFAULT_INVOICE);
  const [freightAmount, setFreightAmount] = useState(DEFAULT_FREIGHT);
  const [insuranceAmount, setInsuranceAmount] = useState(DEFAULT_INSURANCE);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [userEditedRate, setUserEditedRate] = useState(false);
  const [advanced, setAdvanced] = useState<DutyAdvancedValues>({
    originCode: inferred.originCode,
    adValorem: calculator.adValoremPercent,
    vat: calculator.vatPercent,
    customsFee: calculator.customsServiceFeePercent,
    exchangeRate: calculator.suggestedExchangeRate,
    hasCertificate: false,
    applyExemption: calculator.exemptionAvailable,
    applyAntidumping: (calculator.antidumpingPercent ?? 0) > 0,
    antidumpingPercent: calculator.antidumpingPercent ?? 20,
  });

  const handlePatchAdvanced = useCallback((patch: Partial<DutyAdvancedValues>) => {
    if (patch.exchangeRate !== undefined) setUserEditedRate(true);
    setAdvanced((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleBcvResolved = useCallback((rate: number) => {
    setAdvanced((prev) => ({ ...prev, exchangeRate: rate }));
  }, []);

  const bcv = useBcvRate({
    jurisdictionId: jurisdiction.id,
    currencyCode: calculator.currencyCode,
    isUserEdited: userEditedRate,
    onRateResolved: handleBcvResolved,
  });

  const result = useMemo(
    () =>
      calculateDeterministicDuties({
        jurisdictionId: jurisdiction.id,
        hsCode: calculator.hsCode,
        originCode: advanced.originCode,
        incoterm,
        invoiceAmount,
        originChargesAmount: 0,
        freightAmount,
        insuranceAmount,
        baseAdValoremPercent: advanced.adValorem,
        vatPercent: advanced.vat,
        customsFeePercent: advanced.customsFee,
        exchangeRate: advanced.exchangeRate,
        applyExemption: advanced.applyExemption,
        hasCertificateOfOrigin: advanced.hasCertificate,
        preferentialDiscountOverridePercent: calculator.preferentialDiscountPercent ?? null,
        applyAntidumping: advanced.applyAntidumping,
        antidumpingPercent: advanced.antidumpingPercent,
      }),
    [jurisdiction.id, calculator.hsCode, calculator.preferentialDiscountPercent, incoterm, invoiceAmount, freightAmount, insuranceAmount, advanced],
  );

  const fmt = (amount: number) => formatCurrencyAmount(calculator.currencyCode, amount);

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
            Parámetros de valoración (<span translate="no" className="font-mono">{calculator.hsCode}</span>)
          </h3>
          <fieldset className="flex items-center gap-1 border-0 p-0">
            <legend className="sr-only">Seleccionar Incoterm</legend>
            {INCOTERMS.map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={incoterm === code}
                onClick={() => setIncoterm(code)}
                className={`cursor-pointer rounded-md px-2 py-1 font-mono text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${
                  incoterm === code ? 'bg-accent-brand text-white' : 'bg-surface-muted text-ink-secondary hover:bg-surface-hover'
                }`}
              >
                {code}
              </button>
            ))}
          </fieldset>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <DecimalField label={`Valor Factura (${calculator.currencyCode})`} name="invoiceAmount" value={invoiceAmount} onChange={setInvoiceAmount} />
          <DecimalField label={`Flete Internacional (${calculator.currencyCode})`} name="freightAmount" value={freightAmount} onChange={setFreightAmount} />
          <DecimalField label={`Seguro (${calculator.currencyCode})`} name="insuranceAmount" value={insuranceAmount} onChange={setInsuranceAmount} />
        </div>
      </section>

      <DutyAdvancedAccordion
        open={advancedOpen}
        onToggle={() => setAdvancedOpen((prev) => !prev)}
        values={advanced}
        onPatch={handlePatchAdvanced}
        bcvDate={bcv.rateMeta?.valueDate}
        bcvError={bcv.error}
        isRefreshingBcv={bcv.isRefreshing}
        onRefreshBcv={bcv.isBcvJurisdiction ? () => { setUserEditedRate(false); void bcv.refreshBcvRate(); } : undefined}
        localCurrencyCode={calculator.localCurrencyCode}
        agreement={result.agreement}
      />

      <section className="rounded-xl border border-border-subtle bg-surface-panel p-4 shadow-xs">
        <h3 className="text-xs font-semibold text-ink-secondary">Desglose determinista de tributos</h3>
        <dl className="mt-2.5 divide-y divide-border-hairline text-xs">
          <div className="flex justify-between py-1.5">
            <dt className="text-ink-secondary">Ad Valorem ({result.effectiveAdValoremPercent}%)</dt>
            <dd className="font-mono font-medium text-ink-primary tabular-nums">{fmt(result.adValoremAmount)}</dd>
          </div>
          {result.antidumpingAmount > 0 ? (
            <div className="flex justify-between py-1.5">
              <dt className="text-amber-700 dark:text-amber-300">Antidumping ({result.effectiveAntidumpingPercent}%)</dt>
              <dd className="font-mono font-medium text-amber-700 tabular-nums dark:text-amber-300">{fmt(result.antidumpingAmount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between py-1.5">
            <dt className="text-ink-secondary">Tasa de Servicio Aduanero ({result.effectiveCustomsFeePercent}%)</dt>
            <dd className="font-mono font-medium text-ink-primary tabular-nums">{fmt(result.customsFeeAmount)}</dd>
          </div>
          <div className="flex justify-between py-1.5">
            <dt className="text-ink-secondary">IVA de Importación ({result.effectiveVatPercent}%)</dt>
            <dd className="font-mono font-medium text-ink-primary tabular-nums">{fmt(result.vatAmount)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
