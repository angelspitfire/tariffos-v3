'use client';

import { useState } from 'react';
import { UserMinus } from 'lucide-react';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { DeactivateConfirmModal } from './DeactivateConfirmModal';

export interface TenantMemberRow {
  userId: string;
  email: string;
  name: string;
  role: string;
  position?: string;
}

export function TenantMembersSection({
  tenantId,
  members,
  onMemberRemoved,
}: {
  tenantId: string;
  members: TenantMemberRow[];
  onMemberRemoved: () => void;
}) {
  const [target, setTarget] = useState<TenantMemberRow | null>(null);

  const handleConfirm = async (reason: string, banAuthAccount: boolean) => {
    if (!target) return;
    const res = await fetch(`/api/admin/tenants/${tenantId}/members/${target.userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, banAuthAccount }),
    });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      throw new Error(json.error ?? 'Error al dar de baja al usuario');
    }
    onMemberRemoved();
  };

  return (
    <FunnelCard padding="p-4" className="space-y-3">
      <h3 className="text-sm font-bold text-ink-primary">Miembros del tenant ({members.length})</h3>
      {members.length === 0 ? (
        <p className="text-xs text-ink-muted">No hay miembros registrados en este tenant.</p>
      ) : (
        <div className="divide-y divide-border-hairline text-xs">
          {members.map((m) => (
            <div key={m.userId} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-ink-primary">
                  {m.name} <span className="font-mono text-[11px] text-ink-muted">({m.role})</span>
                </div>
                <div className="text-ink-muted">{m.email}</div>
              </div>
              <button
                type="button"
                onClick={() => setTarget(m)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
              >
                <UserMinus className="w-3.5 h-3.5" />
                Dar de baja usuario
              </button>
            </div>
          ))}
        </div>
      )}

      {target && (
        <DeactivateConfirmModal
          title={`Dar de baja a ${target.name}`}
          description={`Se revocará el acceso de ${target.email} a este tenant.`}
          confirmLabel="Confirmar baja de usuario"
          extraCheckboxLabel="Suspender cuenta Auth global si no pertenece a otros tenants"
          onClose={() => setTarget(null)}
          onConfirm={handleConfirm}
        />
      )}
    </FunnelCard>
  );
}
