'use client';

import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { ORIGIN_COUNTRIES, type PreferentialAgreementResult } from '@/lib/workspace/trade-preferences';

interface DutyAdvancedAccordionProps {
  open: boolean;
  onToggle: () => void;
  originCode: string;
  onOriginChange: (code: string) => void;
  adValorem: number;
  onAdValoremChange: (v: number) => void;
  vat: number;
  onVatChange: (v: number) => void;
  customsFee: number;
  onCustomsFeeChange: (v: number) => void;
  exchangeRate: number;
  onExchangeRateChange: (v: number) => void;
  bcvDate?: string;
  isRefreshingBcv?: boolean;
  onRefreshBcv?: () => void;
  localCurrencyCode: string;
  hasCertificate: boolean;
  onHasCertificateChange: (v: boolean) => void;
  applyExemption: boolean;
  onApplyExemptionChange: (v: boolean) => void;
  applyAntidumping: boolean;
  onApplyAntidumpingChange: (v: boolean) => void;
  antidumpingPercent: number;
  onAntidumpingPercentChange: (v: number) => void;
  agreement: PreferentialAgreementResult;
}

export function DutyAdvancedAccordion(props: DutyAdvancedAccordionProps) {
  const {
    open,
    onToggle,
    originCode,
    onOriginChange,
    adValorem,
    onAdValoremChange,
    vat,
    onVatChange,
    customsFee,
    onCustomsFeeChange,
    exchangeRate,
    onExchangeRateChange,
    bcvDate,
    isRefreshingBcv = false,
    onRefreshBcv,
    localCurrencyCode,
    hasCertificate,
    onHasCertificateChange,
    applyExemption,
    onApplyExemptionChange,
    applyAntidumping,
    onApplyAntidumpingChange,
    antidumpingPercent,
    onAntidumpingPercentChange,
    agreement,
  } = props;

  return (
    <section className="rounded-xl border border-border-subtle bg-surface-panel shadow-xs">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-ink-primary hover:bg-surface-hover"
      >
        <span>Ajustes avanzados (alícuotas, tasa de cambio, tratados y exoneración)</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="space-y-3 border-t border-border-hairline p-4 text-xs">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-ink-muted">Ad Valorem (%)</span>
              <input
                type="number"
                step="0.1"
                value={adValorem}
                onChange={(e) => onAdValoremChange(Number(e.target.value) || 0)}
                className="rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5 font-mono text-xs text-ink-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-ink-muted">IVA (%)</span>
              <input
                type="number"
                step="0.1"
                value={vat}
                onChange={(e) => onVatChange(Number(e.target.value) || 0)}
                className="rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5 font-mono text-xs text-ink-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-ink-muted">Tasa Aduanera (%)</span>
              <input
                type="number"
                step="0.01"
                value={customsFee}
                onChange={(e) => onCustomsFeeChange(Number(e.target.value) || 0)}
                className="rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5 font-mono text-xs text-ink-primary"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="flex items-center justify-between gap-1 text-[11px] text-ink-muted">
                <span>
                  Tasa ({localCurrencyCode}){bcvDate ? ` · ${bcvDate}` : ''}
                </span>
                {onRefreshBcv ? (
                  <button
                    type="button"
                    onClick={onRefreshBcv}
                    disabled={isRefreshingBcv}
                    className="inline-flex items-center gap-1 font-medium text-accent-ink hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${isRefreshingBcv ? 'animate-spin' : ''}`} aria-hidden="true" />
                    <span>BCV</span>
                  </button>
                ) : null}
              </span>
              <input
                type="number"
                step="0.01"
                aria-label="Tasa de cambio"
                value={exchangeRate}
                onChange={(e) => onExchangeRateChange(Number(e.target.value) || 1)}
                className="rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5 font-mono text-xs text-ink-primary"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-ink-muted">País de origen</span>
              <select
                value={originCode}
                onChange={(e) => onOriginChange(e.target.value)}
                className="rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5 text-xs text-ink-primary"
              >
                {ORIGIN_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-lg bg-surface-muted px-3 py-2 text-[11px]">
              <div className="font-semibold text-ink-primary">{agreement.agreementName}</div>
              <p className="mt-0.5 text-ink-muted">{agreement.note}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-xs text-ink-secondary">
              <input
                type="checkbox"
                checked={hasCertificate}
                onChange={(e) => onHasCertificateChange(e.target.checked)}
                className="rounded border-border-strong"
              />
              Certificado de Origen preferencial ({agreement.discountPercent}%)
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-ink-secondary">
              <input
                type="checkbox"
                checked={applyExemption}
                onChange={(e) => onApplyExemptionChange(e.target.checked)}
                className="rounded border-border-strong"
              />
              Aplicar decreto de exoneración (0%)
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-ink-secondary">
              <input
                type="checkbox"
                checked={applyAntidumping}
                onChange={(e) => onApplyAntidumpingChange(e.target.checked)}
                className="rounded border-border-strong"
              />
              Antidumping / Sobretasa
              {applyAntidumping && (
                <input
                  type="number"
                  step="0.5"
                  aria-label="Porcentaje antidumping"
                  value={antidumpingPercent}
                  onChange={(e) => onAntidumpingPercentChange(Number(e.target.value) || 0)}
                  className="w-16 rounded border border-border-subtle bg-surface-input px-1.5 py-0.5 font-mono text-xs"
                />
              )}
            </label>
          </div>
        </div>
      )}
    </section>
  );
}
