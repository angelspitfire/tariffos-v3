'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  AdminEmailProviderStatus,
  PlatformAdminAccountRole,
  PlatformAdminRecord,
} from '@tariffos/shared-types';
import {
  AdminCredentialsBanner,
  type ProvisionedCredentialsInfo,
} from '@/components/admin/molecules/AdminCredentialsBanner';
import { PlatformAdminsList } from '@/components/admin/molecules/PlatformAdminsList';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { adminFetchJson } from '@/lib/admin/admin-fetch';

interface AdminsResponse {
  admins?: PlatformAdminRecord[];
  emailProvider?: AdminEmailProviderStatus;
}

interface ProvisionResponse {
  admin?: PlatformAdminRecord;
  temporaryPassword?: string;
  planSlug?: string;
  emailDelivery?: ProvisionedCredentialsInfo['emailDelivery'];
}

export function PlatformAdminsPanel() {
  const [admins, setAdmins] = useState<PlatformAdminRecord[]>([]);
  const [emailProvider, setEmailProvider] = useState<AdminEmailProviderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<PlatformAdminAccountRole>('super_admin');
  const [error, setError] = useState<string | null>(null);
  const [provisioned, setProvisioned] = useState<ProvisionedCredentialsInfo | null>(null);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const json = await adminFetchJson<AdminsResponse>('/api/admin/admins');
      setAdmins(json.admins ?? []);
      setEmailProvider(json.emailProvider ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los administradores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim().includes('@') || fullName.trim().length < 2) {
      setError('Indica un correo válido y el nombre completo del administrador.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await adminFetchJson<ProvisionResponse>('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), fullName: fullName.trim(), companyName: 'TariffOS', role }),
      });
      if (res.temporaryPassword && res.admin) {
        setProvisioned({
          email: res.admin.email,
          temporaryPassword: res.temporaryPassword,
          planSlug: res.planSlug ?? 'tariffos_internal',
          emailDelivery: res.emailDelivery ?? { delivered: false, provider: 'none' },
        });
      }
      setEmail('');
      setFullName('');
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el administrador.');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleAccess = async (target: PlatformAdminRecord) => {
    setBusy(true);
    setError(null);
    try {
      await adminFetchJson('/api/admin/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: target.email,
          action: target.isActive ? 'revoke' : 'grant',
          ...(target.isActive ? {} : { role: target.role }),
        }),
      });
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el acceso.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FunnelCard padding="p-5" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-ink-primary">Equipo Administrador (TariffOS Interno ∞)</h2>
          <p className="text-xs text-ink-muted">
            Crea cuentas Super Admin u Ops con acceso ilimitado sin pasarela de pago y clave temporal.
          </p>
        </div>
        {emailProvider ? (
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              emailProvider.configured
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
            }`}
          >
            {emailProvider.configured
              ? `Correo automático activo (${emailProvider.provider})`
              : 'Correo automático no configurado'}
          </span>
        ) : null}
      </div>

      <form onSubmit={handleProvision} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
        <input
          aria-label="Correo del administrador"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@tariffos.app"
          className="rounded-lg border border-border-strong bg-surface-input px-2.5 py-2 text-ink-primary"
          required
        />
        <input
          aria-label="Nombre completo"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nombre completo"
          className="rounded-lg border border-border-strong bg-surface-input px-2.5 py-2 text-ink-primary"
          required
        />
        <select
          aria-label="Rol de plataforma"
          value={role}
          onChange={(e) => setRole(e.target.value as PlatformAdminAccountRole)}
          className="rounded-lg border border-border-strong bg-surface-input px-2.5 py-2 text-ink-primary"
        >
          <option value="super_admin">Super Admin</option>
          <option value="ops_billing">Ops &amp; Billing</option>
          <option value="support">Soporte</option>
        </select>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-accent-solid text-white font-semibold px-3 py-2 disabled:opacity-50 cursor-pointer"
        >
          {busy ? 'Creando...' : 'Crear administrador'}
        </button>
      </form>

      {error ? (
        <div role="alert" className="rounded-lg px-3 py-2 text-xs bg-rose-500/10 text-rose-500">
          {error}
        </div>
      ) : null}

      {provisioned ? (
        <AdminCredentialsBanner credentials={provisioned} onDismiss={() => setProvisioned(null)} />
      ) : null}

      <PlatformAdminsList
        admins={admins}
        loading={loading}
        busy={busy}
        onToggleAccess={(item) => void handleToggleAccess(item)}
      />
    </FunnelCard>
  );
}
