'use client';

import { useState } from 'react';
import { BellRing, Globe, Mail, Send } from 'lucide-react';
import type { JurisdictionConfig } from '@tariffos/shared-types';
import type { NotificationChannelPrefs } from '@/lib/workspace/regulatory-alerts';

export interface SettingsNotificationsTabProps {
  profileEmail: string;
  jurisdictions: readonly JurisdictionConfig[];
  subscribedJurisdictions: Record<string, boolean>;
  notifications: NotificationChannelPrefs;
  onUpdateNotifications: (patch: Partial<NotificationChannelPrefs>) => void;
  onToggleJurisdictionSub: (jurisdictionId: string) => void;
}

export function SettingsNotificationsTab({
  profileEmail,
  jurisdictions,
  subscribedJurisdictions,
  notifications,
  onUpdateNotifications,
  onToggleJurisdictionSub,
}: SettingsNotificationsTabProps) {
  const [testPreview, setTestPreview] = useState<string | null>(null);
  const activeSubCount = Object.values(subscribedJurisdictions).filter(Boolean).length;

  const handleTest = () => {
    const channels = [
      notifications.pushEnabled ? 'Push' : null,
      notifications.emailEnabled ? 'Email' : null,
    ].filter(Boolean);
    setTestPreview(
      `Vista previa enviada (${channels.length > 0 ? channels.join(' + ') : 'Solo in-app'}) · ${new Date().toLocaleTimeString()}`,
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-primary">
            Panel de notificaciones legislativas
          </h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            Configura canales push o por correo cuando cambien aranceles, exoneraciones o permisos OGA.
          </p>
        </div>
        <button
          type="button"
          onClick={handleTest}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent-ink hover:bg-blue-100 dark:hover:bg-blue-900/40"
        >
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
          Probar alerta
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-card border border-border-subtle bg-surface-muted p-3">
          <div className="text-[11px] text-ink-muted">Jurisdicciones suscritas</div>
          <div className="mt-0.5 font-mono text-base font-bold text-ink-primary tabular-nums">
            {activeSubCount} / {jurisdictions.length}
          </div>
        </div>
        <div className="rounded-card border border-border-subtle bg-surface-muted p-3">
          <div className="text-[11px] text-ink-muted">Notificaciones Push</div>
          <div className={`mt-1 text-xs font-semibold ${notifications.pushEnabled ? 'text-accent-ink' : 'text-ink-muted'}`}>
            {notifications.pushEnabled ? 'Activas en navegador' : 'Desactivadas'}
          </div>
        </div>
        <div className="rounded-card border border-border-subtle bg-surface-muted p-3">
          <div className="text-[11px] text-ink-muted">Correo electrónico</div>
          <div className="mt-1 truncate text-xs font-semibold text-ink-primary">
            {notifications.emailEnabled ? notifications.notificationEmail || profileEmail : 'Desactivado'}
          </div>
        </div>
      </div>

      {testPreview ? (
        <div className="flex items-center gap-2 rounded-card border border-accent-border bg-accent-soft/60 px-3.5 py-2.5 text-xs font-medium text-accent-ink">
          <BellRing className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{testPreview}</span>
        </div>
      ) : null}

      <div className="space-y-2.5 rounded-card border border-border-subtle bg-surface-muted/50 p-4 text-xs">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="font-medium text-ink-primary">Alertas Push en navegador</span>
          <input
            type="checkbox"
            checked={notifications.pushEnabled}
            onChange={(e) => onUpdateNotifications({ pushEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-border-subtle accent-accent-brand"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 font-medium text-ink-primary">
            <Mail className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
            Resumen por correo electrónico
          </span>
          <input
            type="checkbox"
            checked={notifications.emailEnabled}
            onChange={(e) => onUpdateNotifications({ emailEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-border-subtle accent-accent-brand"
          />
        </label>
        {notifications.emailEnabled ? (
          <input
            type="email"
            aria-label="Correo de alertas"
            value={notifications.notificationEmail}
            onChange={(e) => onUpdateNotifications({ notificationEmail: e.target.value })}
            placeholder={profileEmail}
            className="mt-1 w-full rounded-field border border-border-subtle bg-surface-input px-3 py-1.5 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-ink-secondary">
          Suscripción por jurisdicción
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {jurisdictions.map((jur) => {
            const subscribed = Boolean(subscribedJurisdictions[jur.id]);
            return (
              <button
                key={jur.id}
                type="button"
                aria-pressed={subscribed}
                onClick={() => onToggleJurisdictionSub(jur.id)}
                className={`flex cursor-pointer items-center justify-between rounded-field border px-3 py-2 text-left text-xs transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${
                  subscribed
                    ? 'border-accent-border bg-accent-soft/45 text-ink-primary'
                    : 'border-border-subtle bg-surface-panel text-ink-secondary hover:border-border-strong'
                }`}
              >
                <span className="inline-flex items-center gap-1.5 truncate font-medium">
                  <Globe className="h-3.5 w-3.5 text-accent-ink shrink-0" aria-hidden="true" />
                  {jur.country} ({jur.authority})
                </span>
                <span className="font-mono text-[10px] font-semibold">
                  {subscribed ? 'Activa' : 'Pausada'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
