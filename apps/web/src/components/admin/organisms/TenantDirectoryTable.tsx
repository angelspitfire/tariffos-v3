'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { AdminTenantSummary } from '@tariffos/shared-types';
import { Plus, Search } from 'lucide-react';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { QuotaProgressBar } from '../atoms/QuotaProgressBar';
import { TenantStatusBadge } from '../atoms/TenantStatusBadge';

export function TenantDirectoryTable() {
  const [tenants, setTenants] = useState<AdminTenantSummary[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTenants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/tenants?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as { tenants?: AdminTenantSummary[] };
        setTenants(json.tenants ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [query, status]);

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-ink-primary">Directorio de Tenants</h1>
          <p className="text-xs text-ink-muted">
            Controla planes, cuotas mensuales, miembros y altas/bajas por agencia.
          </p>
        </div>
        <Link
          href="/admin/onboarding"
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-brand px-3.5 py-2 text-xs font-semibold text-white hover:bg-accent-brand-hover"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo tenant (Onboarding)
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar empresa, correo o RIF..."
            className="w-full rounded-lg border border-border-strong bg-surface-input pl-8 pr-3 py-2 text-ink-primary"
          />
        </div>
        <select
          aria-label="Filtrar tenants por estado"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activos</option>
          <option value="TRIALING">Trial</option>
          <option value="PAST_DUE">Mora</option>
          <option value="CANCELED">De baja</option>
        </select>
      </div>

      <FunnelCard padding="p-0" className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-xs text-ink-muted">Cargando tenants...</div>
        ) : tenants.length === 0 ? (
          <div className="p-6 text-xs text-ink-muted text-center">Sin resultados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted border-b border-border-subtle text-ink-muted">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Tenant</th>
                  <th className="py-2.5 px-3 font-semibold">Plan</th>
                  <th className="py-2.5 px-3 font-semibold">Estado</th>
                  <th className="py-2.5 px-3 font-semibold">Consumo mes</th>
                  <th className="py-2.5 px-3 font-semibold">Tokens</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-hover/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-ink-primary">{t.name}</div>
                      <div className="text-[11px] text-ink-muted">
                        {t.ownerEmail ?? 'Sin correo'} · {t.countryCode} · {t.memberCount} usuarios
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-ink-primary">{t.planName}</td>
                    <td className="py-3 px-3">
                      <TenantStatusBadge status={t.billingStatus} />
                    </td>
                    <td className="py-3 px-3">
                      <QuotaProgressBar used={t.usedThisMonth} limit={t.billingLimit} />
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-ink-secondary">
                      {(t.inputTokensThisMonth + t.outputTokensThisMonth).toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/tenants/${t.id}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg border border-border-strong font-semibold text-ink-primary hover:bg-surface-hover"
                      >
                        Controlar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FunnelCard>
    </div>
  );
}
