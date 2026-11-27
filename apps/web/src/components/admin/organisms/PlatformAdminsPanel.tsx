'use client';

import { useCallback, useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';
import type { AdminEmailProviderStatus, PlatformAdminRecord } from '@tariffos/shared-types';
import { PlatformAdminsList } from '@/components/admin/molecules/PlatformAdminsList';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { adminFetchJson } from '@/lib/admin/admin-fetch';

interface AdminsResponse {
  admins?: PlatformAdminRecord[];
  emailProvider?: AdminEmailProviderStatus;
}

export function PlatformAdminsPanel() {
  const [admins, setAdmins] = useState<PlatformAdminRecord[]>([]);
  const [emailProvider, setEmailProvider] = useState<AdminEmailProviderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <FunnelCard padding="p-5" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-ink-primary">Equipo Administrador (Solo consola local)</h2>
          <p className="text-xs text-ink-muted">
            Vista de solo lectura. Por seguridad, las altas y revocaciones se ejecutan exclusivamente desde consola local.
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

      <div className="rounded-xl border border-border-subtle bg-surface-muted/60 p-3 space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-ink-primary">
          <Terminal className="w-3.5 h-3.5 text-accent-ink" aria-hidden="true" />
          <span>Comandos en consola local</span>
        </div>
        <pre className="font-mono text-[11px] text-ink-secondary overflow-x-auto leading-relaxed">
{`pnpm admin:users list
pnpm admin:users provision <email> --name "Nombre" --role super_admin
pnpm admin:users revoke <email> --reason "Motivo"`}
        </pre>
      </div>

      {error ? (
        <div role="alert" className="rounded-lg px-3 py-2 text-xs bg-rose-500/10 text-rose-500">
          {error}
        </div>
      ) : null}

      <PlatformAdminsList admins={admins} loading={loading} />
    </FunnelCard>
  );
}
