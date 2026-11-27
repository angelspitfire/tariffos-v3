'use client';

import { useState } from 'react';
import { Bell, BellRing, CreditCard, Database, KeyRound, SlidersHorizontal, User, X } from 'lucide-react';
import type { JurisdictionConfig, UserProfileSettings } from '@tariffos/shared-types';
import type { WorkspacePlanStatus } from '@/lib/workspace/plan-status';
import {
  readRegulatoryPrefs,
  saveRegulatoryPrefs,
  SEED_REGULATORY_ALERTS,
  type NotificationChannelPrefs,
  type RegulatoryPrefsState,
} from '@/lib/workspace/regulatory-alerts';
import { SettingsAlertsTab } from '../molecules/SettingsAlertsTab';
import { SettingsBillingTab, SettingsLocalDataTab } from '../molecules/SettingsBillingDataTab';
import { SettingsNotificationsTab } from '../molecules/SettingsNotificationsTab';
import { SettingsPreferencesTab } from '../molecules/SettingsPreferencesTab';
import { SettingsProfileTab } from '../molecules/SettingsProfileTab';
import { SettingsSecurityTab } from '../molecules/SettingsSecurityTab';

export type SettingsModalTab =
  | 'profile'
  | 'security'
  | 'preferences'
  | 'alerts'
  | 'notifications'
  | 'billing'
  | 'local_data';

export interface WorkspaceSettingsModalProps {
  open: boolean;
  profile: UserProfileSettings;
  jurisdictions: readonly JurisdictionConfig[];
  plan: WorkspacePlanStatus;
  threadsCount: number;
  skuCount: number;
  onClose: () => void;
  onSave: (patch: Partial<UserProfileSettings>) => void;
  onApplyNotice?: (summary: string) => void;
  onExportBackup?: () => void;
  onClearLocalData?: () => void;
}

const TABS: ReadonlyArray<{ id: SettingsModalTab; label: string; icon: typeof User }> = [
  { id: 'profile', label: 'Cuenta y Firma', icon: User },
  { id: 'security', label: 'Seguridad', icon: KeyRound },
  { id: 'preferences', label: 'Preferencias', icon: SlidersHorizontal },
  { id: 'alerts', label: 'Alertas normativas', icon: Bell },
  { id: 'notifications', label: 'Notificaciones', icon: BellRing },
  { id: 'billing', label: 'Plan y Pagos', icon: CreditCard },
  { id: 'local_data', label: 'Datos locales', icon: Database },
];

export function WorkspaceSettingsModal({
  open,
  profile,
  jurisdictions,
  plan,
  threadsCount,
  skuCount,
  onClose,
  onSave,
  onApplyNotice,
  onExportBackup,
  onClearLocalData,
}: WorkspaceSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsModalTab>('profile');
  const [draft, setDraft] = useState<UserProfileSettings>(profile);
  const [regPrefs, setRegPrefs] = useState<RegulatoryPrefsState>(() =>
    readRegulatoryPrefs(profile.email, profile.defaultJurisdictionId),
  );

  if (!open) return null;

  const updateRegPrefs = (updater: (prev: RegulatoryPrefsState) => RegulatoryPrefsState) => {
    setRegPrefs((prev) => {
      const next = updater(prev);
      saveRegulatoryPrefs(next);
      return next;
    });
  };

  const activeJurisdiction =
    jurisdictions.find((j) => j.id === draft.defaultJurisdictionId) ?? jurisdictions[0];
  const alerts = SEED_REGULATORY_ALERTS.map((item) => ({
    ...item,
    read: regPrefs.readAlertIds.includes(item.id),
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
    onClose();
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 sm:p-6 backdrop-blur-[1px]"
      aria-label="Configuración del workspace"
    >
      <form
        onSubmit={handleSubmit}
        className="flex h-[min(86vh,660px)] w-full max-w-4xl flex-col overflow-hidden rounded-surface border border-border-subtle bg-surface-panel shadow-elev-2"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">Configuración</h2>
            <p className="text-[11px] text-ink-muted">
              Identidad aduanera, preferencias, alertas normativas, plan y datos
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar configuración"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted hover:bg-surface-hover hover:text-ink-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <nav
            aria-label="Secciones de configuración"
            className="flex shrink-0 gap-1 overflow-x-auto border-b border-border-subtle bg-surface-muted/50 p-2 sm:w-52 sm:flex-col sm:border-r sm:border-b-0 sm:p-3"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-field px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-accent-soft text-accent-ink font-semibold'
                      : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {activeTab === 'profile' ? (
              <SettingsProfileTab draft={draft} onChange={(patch) => setDraft((p) => ({ ...p, ...patch }))} />
            ) : null}
            {activeTab === 'security' ? <SettingsSecurityTab /> : null}
            {activeTab === 'preferences' ? (
              <SettingsPreferencesTab
                draft={draft}
                jurisdictions={jurisdictions}
                onChange={(patch) => setDraft((p) => ({ ...p, ...patch }))}
              />
            ) : null}
            {activeTab === 'alerts' && activeJurisdiction ? (
              <SettingsAlertsTab
                activeJurisdiction={activeJurisdiction}
                jurisdictions={jurisdictions}
                alerts={alerts}
                subscribedJurisdictions={regPrefs.subscribedJurisdictions}
                onGoToNotifications={() => setActiveTab('notifications')}
                onToggleRead={(alertId) =>
                  updateRegPrefs((prev) => ({
                    ...prev,
                    readAlertIds: prev.readAlertIds.includes(alertId)
                      ? prev.readAlertIds.filter((id) => id !== alertId)
                      : [...prev.readAlertIds, alertId],
                  }))
                }
                onMarkAllRead={() =>
                  updateRegPrefs((prev) => ({
                    ...prev,
                    readAlertIds: SEED_REGULATORY_ALERTS.map((a) => a.id),
                  }))
                }
                onRefreshAlerts={() => updateRegPrefs((prev) => ({ ...prev }))}
                onApplyNotice={onApplyNotice ? (s) => { onApplyNotice(s); onClose(); } : undefined}
              />
            ) : null}
            {activeTab === 'notifications' ? (
              <SettingsNotificationsTab
                profileEmail={draft.email}
                jurisdictions={jurisdictions}
                subscribedJurisdictions={regPrefs.subscribedJurisdictions}
                notifications={regPrefs.notifications}
                onUpdateNotifications={(patch: Partial<NotificationChannelPrefs>) =>
                  updateRegPrefs((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, ...patch },
                  }))
                }
                onToggleJurisdictionSub={(jurId) =>
                  updateRegPrefs((prev) => ({
                    ...prev,
                    subscribedJurisdictions: {
                      ...prev.subscribedJurisdictions,
                      [jurId]: !prev.subscribedJurisdictions[jurId],
                    },
                  }))
                }
              />
            ) : null}
            {activeTab === 'billing' ? <SettingsBillingTab plan={plan} onClose={onClose} /> : null}
            {activeTab === 'local_data' ? (
              <SettingsLocalDataTab
                threadsCount={threadsCount}
                skuCount={skuCount}
                onExportBackup={onExportBackup}
                onClearLocalData={onClearLocalData}
              />
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border-subtle bg-surface-muted/40 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-border-subtle bg-surface-panel px-4 py-1.5 text-xs font-medium text-ink-secondary hover:bg-surface-hover"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-full bg-surface-inverted px-4 py-1.5 text-xs font-semibold text-ink-on-inverted hover:bg-surface-inverted-hover"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
