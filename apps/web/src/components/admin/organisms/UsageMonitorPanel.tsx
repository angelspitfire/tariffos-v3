'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { AdminUsageRow } from '@tariffos/shared-types';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { QuotaProgressBar } from '../atoms/QuotaProgressBar';
import { TenantStatusBadge } from '../atoms/TenantStatusBadge';

export function UsageMonitorPanel() {
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [rows, setRows] = useState<AdminUsageRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/usage?month=${month}&year=${year}`);
      if (res.ok) {
        const json = (await res.json()) as { rows?: AdminUsageRow[] };
        setRows(json.rows ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    void loadUsage();
  }, [loadUsage]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-ink-primary">Consumo por Tenant</h1>
          <p className="text-xs text-ink-muted">
            Ranking mensual de clasificaciones vs. cuota, consumo de tokens LLM y estado de lotes.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <select
            aria-label="Mes"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-border-strong bg-surface-input px-2.5 py-1.5 font-mono text-ink-primary"
          >
            {Array.from({ length: 12 }, (_, idx) => idx + 1).map((m) => (
              <option key={m} value={m}>
                Mes {String(m).padStart(2, '0')}
              </option>
            ))}
          </select>
          <input
            aria-label="Año"
            type="number"
            min={2025}
            max={2035}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-24 rounded-lg border border-border-strong bg-surface-input px-2.5 py-1.5 font-mono text-ink-primary"
          />
        </div>
      </div>

      <FunnelCard padding="p-0" className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-xs text-ink-muted">Calculando consumo...</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-xs text-ink-muted text-center">Sin datos de consumo.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted border-b border-border-subtle text-ink-muted">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Tenant</th>
                  <th className="py-2.5 px-3 font-semibold">Plan / Estado</th>
                  <th className="py-2.5 px-3 font-semibold">Clasificaciones</th>
                  <th className="py-2.5 px-3 font-semibold">Tokens In / Out</th>
                  <th className="py-2.5 px-3 font-semibold">Prom. / Costo IA</th>
                  <th className="py-2.5 px-4 font-semibold">Lotes (Activos / Fallidos)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {rows.map((r) => (
                  <tr key={r.tenantId} className="hover:bg-surface-hover/50">
                    <td className="py-3 px-4">
                      <Link href={`/admin/tenants/${r.tenantId}`} className="font-semibold text-ink-primary hover:text-accent-ink">
                        {r.tenantName}
                      </Link>
                      <div className="text-[11px] text-ink-muted">{r.ownerEmail ?? 'Sin correo'}</div>
                    </td>
                    <td className="py-3 px-3 space-y-1">
                      <div className="font-medium text-ink-primary">{r.planName}</div>
                      <TenantStatusBadge status={r.billingStatus} />
                    </td>
                    <td className="py-3 px-3">
                      <QuotaProgressBar used={r.used} limit={r.limit} />
                      {r.nearLimit && (
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                          Cerca o sobre el límite
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-ink-secondary">
                      <div>In: {r.inputTokens.toLocaleString('en-US')}</div>
                      <div>Out: {r.outputTokens.toLocaleString('en-US')}</div>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-ink-secondary">
                      <div>{(r.avgTokensPerClassification ?? 0).toLocaleString('en-US')} tok/clasif.</div>
                      <div className="text-ink-primary font-semibold">
                        ${(r.estimatedCostUsd ?? 0).toFixed(4)}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      <span className="text-ink-primary">{r.activeBatchJobs}</span>
                      {' / '}
                      <span className={r.failedBatchJobs > 0 ? 'text-rose-600 font-bold' : 'text-ink-muted'}>
                        {r.failedBatchJobs}
                      </span>
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
