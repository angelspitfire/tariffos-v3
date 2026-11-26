'use client';

import { useState } from 'react';
import { ArrowUpRight, Check, CheckCheck, RefreshCw, Scale, Sliders } from 'lucide-react';
import type { JurisdictionConfig } from '@tariffos/shared-types';
import type { RegulatoryAlertItem } from '@/lib/workspace/regulatory-alerts';

export interface SettingsAlertsTabProps {
  activeJurisdiction: JurisdictionConfig;
  jurisdictions: readonly JurisdictionConfig[];
  alerts: readonly RegulatoryAlertItem[];
  subscribedJurisdictions: Record<string, boolean>;
  onGoToNotifications: () => void;
  onToggleRead: (alertId: string) => void;
  onMarkAllRead: () => void;
  onRefreshAlerts: () => void;
  onApplyNotice?: (summary: string) => void;
}

type AlertScope = 'active' | 'subscribed' | 'unread';

export function SettingsAlertsTab({
  activeJurisdiction,
  jurisdictions,
  alerts,
  subscribedJurisdictions,
  onGoToNotifications,
  onToggleRead,
  onMarkAllRead,
  onRefreshAlerts,
  onApplyNotice,
}: SettingsAlertsTabProps) {
  const [scope, setScope] = useState<AlertScope>('active');

  const activeSubCount = Object.values(subscribedJurisdictions).filter(Boolean).length;
  const unreadActiveCount = alerts.filter(
    (a) => a.jurisdictionId === activeJurisdiction.id && !a.read,
  ).length;
  const isSubscribed = Boolean(subscribedJurisdictions[activeJurisdiction.id]);

  const visibleAlerts = alerts.filter((item) => {
    if (scope === 'active') return item.jurisdictionId === activeJurisdiction.id;
    if (scope === 'subscribed') return Boolean(subscribedJurisdictions[item.jurisdictionId]);
    return !item.read;
  });

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-card border border-border-subtle bg-surface-muted p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className="text-sm font-semibold text-ink-primary">Alertas y boletines normativos</h3>
            <p className="text-xs text-ink-muted">
              Novedades del Arancel para <strong className="text-ink-primary">{activeJurisdiction.country} ({activeJurisdiction.authority})</strong>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onGoToNotifications}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface-panel px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-surface-hover"
            >
              <Sliders className="h-3.5 w-3.5" aria-hidden="true" />
              Configurar alertas
            </button>
            <button
              type="button"
              onClick={onRefreshAlerts}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-brand-hover"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Buscar boletines
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-border-subtle bg-surface-panel p-2.5">
            <div className="text-[11px] text-ink-muted">Países suscritos</div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-ink-primary tabular-nums">
              {activeSubCount} / {jurisdictions.length}
            </div>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-panel p-2.5">
            <div className="text-[11px] text-ink-muted">Sin leer ({activeJurisdiction.authority})</div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-accent-ink tabular-nums">
              {unreadActiveCount}
            </div>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-panel p-2.5">
            <div className="text-[11px] text-ink-muted">Estado ({activeJurisdiction.country})</div>
            <div className={`mt-1 text-xs font-semibold ${isSubscribed ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-muted'}`}>
              {isSubscribed ? 'Monitoreo activo' : 'Suscripción inactiva'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'active', label: activeJurisdiction.country },
              { id: 'subscribed', label: 'Todas suscritas' },
              { id: 'unread', label: 'Solo sin leer' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setScope(tab.id)}
              className={`cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                scope === tab.id
                  ? 'bg-surface-inverted text-ink-on-inverted'
                  : 'border border-border-subtle bg-surface-panel text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-accent-ink hover:underline"
        >
          <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Marcar todo leído
        </button>
      </div>

      {visibleAlerts.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-subtle p-6 text-center text-xs text-ink-muted">
          No hay boletines normativos pendientes para este filtro.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {visibleAlerts.map((alert) => (
            <li
              key={alert.id}
              className={`rounded-card border p-3.5 text-xs transition-colors ${
                alert.read
                  ? 'border-border-subtle bg-surface-panel/70'
                  : 'border-accent-border bg-accent-soft/30'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Scale className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
                    <span className="font-semibold text-ink-primary">{alert.title}</span>
                  </div>
                  <p className="text-ink-secondary leading-relaxed">{alert.summary}</p>
                  <div className="font-mono text-[10px] text-ink-muted">
                    {alert.gazetteRef} · Vigencia {alert.effectiveDate}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleRead(alert.id)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-subtle bg-surface-panel px-2.5 py-1 text-[11px] font-medium text-ink-secondary hover:text-ink-primary"
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                    {alert.read ? 'Leída' : 'Marcar leída'}
                  </button>
                  {onApplyNotice ? (
                    <button
                      type="button"
                      onClick={() => onApplyNotice(`${alert.title} (${alert.gazetteRef})`)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent-ink hover:bg-blue-100 dark:hover:bg-blue-900/40"
                    >
                      Aplicar
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
