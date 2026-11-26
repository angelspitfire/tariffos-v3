'use client';

import Link from 'next/link';
import { CreditCard, Database, Download, Sparkles, Trash2 } from 'lucide-react';
import { SAAS_PLANS } from '@tariffos/shared-types';
import type { WorkspacePlanStatus } from '@/lib/workspace/plan-status';

export interface SettingsBillingTabProps {
  plan: WorkspacePlanStatus;
  onClose: () => void;
}

export function SettingsBillingTab({ plan, onClose }: SettingsBillingTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-ink-primary">Plan y consumo operativo</h3>
        <p className="mt-0.5 text-xs text-ink-muted">
          Consulta tu cupo mensual de clasificaciones y gestiona la activación manual de tu plan.
        </p>
      </div>

      <div className="space-y-3 rounded-card border border-accent-border/70 bg-accent-soft/45 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
            <Sparkles className="h-4 w-4 text-accent-ink" aria-hidden="true" />
            {plan.planName}
          </span>
          <span className="rounded-full border border-border-subtle bg-surface-panel px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink-primary tabular-nums">
            {plan.quotaUsed} / {plan.isUnlimited ? '∞' : plan.quotaLimit} clasif.
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
          <div
            className={`h-full rounded-full ${plan.exhausted ? 'bg-rose-500' : 'bg-accent-brand'}`}
            style={{ width: `${Math.max(plan.usagePct, 4)}%` }}
          />
        </div>
        <div className="pt-1">
          <Link
            href="/activate-plan"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-inverted px-4 py-2 text-xs font-semibold text-ink-on-inverted transition-colors hover:bg-surface-inverted-hover"
          >
            <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
            {plan.isTrial ? 'Activar plan comercial' : 'Gestionar plan y pagos'}
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
          Planes disponibles
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SAAS_PLANS.filter((p) => p.published).map((item) => {
            const isCurrent = item.planId === plan.planId;
            return (
              <div
                key={item.planId}
                className={`rounded-field border p-3 text-xs ${
                  isCurrent
                    ? 'border-accent-border bg-accent-soft/35'
                    : 'border-border-subtle bg-surface-panel'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-ink-primary">
                  <span>{item.name}</span>
                  <span className="font-mono tabular-nums">
                    {item.customPricing
                      ? 'A medida'
                      : item.oneTimeOnly
                        ? `$${item.monthlyPriceUsd} único`
                        : item.monthlyPriceUsd > 0
                          ? `$${item.monthlyPriceUsd}/mes`
                          : `$${item.annualPriceUsd}/año`}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-ink-muted">
                  {item.customPricing
                    ? 'Volumen y sucursales a medida'
                    : item.oneTimeOnly
                      ? `${item.monthlyQuota.toLocaleString('en-US')} clasif. (30 días)`
                      : `${item.monthlyQuota.toLocaleString('en-US')} clasificaciones/mes`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export interface SettingsLocalDataTabProps {
  threadsCount: number;
  skuCount: number;
  onExportBackup?: () => void;
  onClearLocalData?: () => void;
}

export function SettingsLocalDataTab({
  threadsCount,
  skuCount,
  onExportBackup,
  onClearLocalData,
}: SettingsLocalDataTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-ink-primary">Datos locales y sesión</h3>
        <p className="mt-0.5 text-xs text-ink-muted">
          Tus expedientes recientes y precedentes SKU se almacenan en paralelo para respuesta instantánea.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-border-subtle bg-surface-muted p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
            <Database className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
            Expedientes guardados
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-ink-primary tabular-nums">{threadsCount}</div>
        </div>
        <div className="rounded-card border border-border-subtle bg-surface-muted p-4">
          <div className="text-xs font-medium text-ink-muted">Precedentes en Catálogo SKU</div>
          <div className="mt-1 font-mono text-2xl font-bold text-ink-primary tabular-nums">{skuCount}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onExportBackup ? (
          <button
            type="button"
            onClick={onExportBackup}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface-panel px-4 py-2 text-xs font-semibold text-ink-primary hover:bg-surface-hover"
          >
            <Download className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
            Exportar respaldo JSON
          </button>
        ) : null}
        {onClearLocalData ? (
          <button
            type="button"
            onClick={onClearLocalData}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-rose-500/35 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-500/20 dark:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Limpiar caché local del navegador
          </button>
        ) : null}
      </div>
    </div>
  );
}
