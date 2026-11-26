'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminAuditLogItem } from '@tariffos/shared-types';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set('action', actionFilter);
      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as { logs?: AdminAuditLogItem[] };
        setLogs(json.logs ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-ink-primary">Bitácora de Auditoría Admin</h1>
          <p className="text-xs text-ink-muted">
            Registro inmutable de creación de planes, altas asistidas, aprobaciones de pago y bajas.
          </p>
        </div>
        <select
          aria-label="Filtrar por acción"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-xs text-ink-primary"
        >
          <option value="">Todas las acciones</option>
          <option value="plan.created">plan.created</option>
          <option value="plan.updated">plan.updated</option>
          <option value="lead.updated">lead.updated</option>
          <option value="tenant.onboarded">tenant.onboarded</option>
          <option value="payment.verified">payment.verified</option>
          <option value="tenant.deactivated">tenant.deactivated</option>
          <option value="user.offboarded">user.offboarded</option>
          <option value="settings.llm_updated">settings.llm_updated</option>
          <option value="exchange_rate.synced">exchange_rate.synced</option>
          <option value="exchange_rate.manual_override">exchange_rate.manual_override</option>
        </select>
      </div>

      <FunnelCard padding="p-0" className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-xs text-ink-muted">Cargando bitácora...</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-xs text-ink-muted text-center">Sin eventos registrados.</div>
        ) : (
          <div className="divide-y divide-border-hairline text-xs">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-accent-ink">{log.action}</span>
                    <span className="text-ink-muted">
                      sobre {log.targetType} <code className="font-mono">{log.targetId}</code>
                    </span>
                  </div>
                  <div className="text-ink-secondary">
                    Por <strong>{log.actorEmail ?? log.actorUserId}</strong> ({log.actorRole})
                    {log.reason ? ` · Motivo: ${log.reason}` : ''}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-ink-subtle">
                  {new Date(log.createdAt).toLocaleString('es-VE')}
                </span>
              </div>
            ))}
          </div>
        )}
      </FunnelCard>
    </div>
  );
}
