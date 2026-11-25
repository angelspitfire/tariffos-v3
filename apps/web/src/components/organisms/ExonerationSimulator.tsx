'use client';

import { ExonerationSimulatorPayload } from '@/types/exoneration';
import { SkeletonCard, SkeletonText } from '@/components/atoms/Skeleton';
import { Coins, Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function ExonerationSimulator({ payload, isLoading = false }: { payload: ExonerationSimulatorPayload; isLoading?: boolean }) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <SkeletonCard>
        <SkeletonText lines={5} />
      </SkeletonCard>
    );
  }

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--success-subtle)', color: 'var(--success-text)' }}>
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-hi)]">{t('Simulador de Acuerdos Comerciales y Exoneraciones')}</h4>
            <p className="text-[11px] text-[var(--text-lo)]">{t('Proyección fiscal bajo tratados')} · CIF ${payload.cifUsd.toLocaleString()} USD</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--text-muted)]">{t('Base Imponible')}</p>
          <p className="text-lg font-bold font-mono-numbers text-[var(--text-hi)]">${payload.cifUsd.toLocaleString()} USD</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('Régimen / Acuerdo Comercial')}</p>
          <div className="grid gap-2 md:grid-cols-2">
            {payload.regimes.map((regime) => (
              <label
                key={regime.id}
                className="p-3 rounded-xl border-2 cursor-pointer transition-all hover:border-[var(--brand)]"
                style={{ borderColor: 'var(--border-card)', background: 'var(--surface-elevated)' }}
              >
                <input type="radio" name="regime" value={regime.id} className="sr-only" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-hi)]">{regime.name}</p>
                    <p className="text-[10px] text-[var(--text-lo)] mt-0.5">{regime.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-muted)]">{t('Desgravamen Ad-Valorem')}</p>
                    <p className="text-lg font-bold text-[var(--success-text)] font-mono-numbers">{(regime.adValoremReliefRate * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('Moneda de Liquidación')}</p>
          <div className="grid gap-2 md:grid-cols-3">
            {payload.currencies.map((curr) => (
              <div
                key={curr.code}
                className="p-3 rounded-xl border cursor-pointer transition-all hover:border-[var(--brand)]"
                style={{ borderColor: 'var(--border-card)', background: 'var(--surface-elevated)' }}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-xs font-medium text-[var(--text-hi)]">{curr.code}</span>
                </div>
                <p className="text-[10px] text-[var(--text-lo)] mt-1">{curr.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-divider)]">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">{t('Proyección de Ahorro')} (vs Régimen General)</p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 rounded-xl" style={{ background: 'var(--success-subtle)', border: '1px solid var(--success-border)' }}>
              <p className="text-[10px] font-bold text-[var(--success-text)] uppercase tracking-wider">Arancel Ad-Valorem</p>
              <p className="text-2xl font-bold text-[var(--success-text)] font-mono-numbers mt-1">${(payload.baseAdValoremRate * payload.cifUsd / 100).toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'var(--warning-subtle)', border: '1px solid var(--warning-border)' }}>
              <p className="text-[10px] font-bold text-[var(--warning-text)] uppercase tracking-wider">FODINFA (0.5%)</p>
              <p className="text-2xl font-bold text-[var(--warning-text)] font-mono-numbers mt-1">${(payload.cifUsd * 0.005).toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'var(--info-subtle)', border: '1px solid var(--info-border)' }}>
              <p className="text-[10px] font-bold text-[var(--info-text)] uppercase tracking-wider">IVA Aduanero (16%)</p>
              <p className="text-2xl font-bold text-[var(--info-text)] font-mono-numbers mt-1">${(payload.cifUsd * 0.16).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
