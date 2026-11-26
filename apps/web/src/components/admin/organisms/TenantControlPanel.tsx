'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { AdminPlanRecord, TenantBillingStatus } from '@tariffos/shared-types';
import { ArrowLeft, Ban, RotateCcw } from 'lucide-react';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { TenantStatusBadge } from '../atoms/TenantStatusBadge';
import { DeactivateConfirmModal } from '../molecules/DeactivateConfirmModal';
import { TenantMembersSection, type TenantMemberRow } from '../molecules/TenantMembersSection';
import { TenantPlanControlForm } from '../molecules/TenantPlanControlForm';

interface TenantDetailPayload {
  id: string;
  name: string;
  taxId: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  countryCode: string;
  planId: string | null;
  planName: string;
  billingStatus: TenantBillingStatus;
  billingLimit: number;
  allowOverage: boolean;
  members: TenantMemberRow[];
  usageHistory: Array<{
    month: number;
    year: number;
    count: number;
    inputTokens: number;
    outputTokens: number;
  }>;
}

export function TenantControlPanel({ tenantId }: { tenantId: string }) {
  const [tenant, setTenant] = useState<TenantDetailPayload | null>(null);
  const [plans, setPlans] = useState<AdminPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState<'deactivate' | 'reactivate' | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        fetch(`/api/admin/tenants/${tenantId}`),
        fetch('/api/admin/plans'),
      ]);
      if (tRes.ok) {
        const tJson = (await tRes.json()) as { tenant?: TenantDetailPayload };
        setTenant(tJson.tenant ?? null);
      }
      if (pRes.ok) {
        const pJson = (await pRes.json()) as { plans?: AdminPlanRecord[] };
        setPlans(pJson.plans ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleLifecycleAction = async (reason: string, extra: boolean) => {
    const endpoint =
      statusModal === 'deactivate'
        ? `/api/admin/tenants/${tenantId}/deactivate`
        : `/api/admin/tenants/${tenantId}/reactivate`;
    const body =
      statusModal === 'deactivate'
        ? { reason, revokePendingInvites: true, banSoleMembers: extra }
        : { reason, unbanMembers: true };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      throw new Error(err.error ?? 'Error al cambiar estado del tenant');
    }
    await loadAll();
  };

  if (loading) {
    return <FunnelCard padding="p-6" className="text-xs text-ink-muted">Cargando ficha del tenant...</FunnelCard>;
  }
  if (!tenant) {
    return <FunnelCard padding="p-6" className="text-xs text-ink-muted">Tenant no encontrado.</FunnelCard>;
  }

  const isCanceled = tenant.billingStatus === 'CANCELED';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Link href="/admin/tenants" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink-primary">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al directorio
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-ink-primary">{tenant.name}</h1>
            <TenantStatusBadge status={tenant.billingStatus} />
          </div>
          <p className="text-xs text-ink-muted">
            {tenant.ownerName ?? 'Propietario'} · {tenant.ownerEmail ?? 'Sin correo'} · {tenant.taxId ?? 'Sin RIF'} · {tenant.countryCode}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setStatusModal(isCanceled ? 'reactivate' : 'deactivate')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white cursor-pointer ${
            isCanceled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
          }`}
        >
          {isCanceled ? <RotateCcw className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
          {isCanceled ? 'Reactivar tenant' : 'Dar de baja tenant'}
        </button>
      </div>

      <TenantPlanControlForm
        tenantId={tenant.id}
        currentPlanId={tenant.planId}
        currentLimit={tenant.billingLimit}
        currentStatus={tenant.billingStatus}
        currentAllowOverage={tenant.allowOverage}
        plans={plans}
        onUpdated={() => void loadAll()}
      />

      <FunnelCard padding="p-4" className="space-y-2">
        <h3 className="text-sm font-bold text-ink-primary">Consumo mensual histórico</h3>
        {tenant.usageHistory.length === 0 ? (
          <p className="text-xs text-ink-muted">Sin consumo registrado aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {tenant.usageHistory.map((u) => (
              <div key={`${u.year}-${u.month}`} className="rounded-xl border border-border-hairline bg-surface-muted p-3">
                <div className="font-mono font-bold text-ink-primary">{String(u.month).padStart(2, '0')}/{u.year}</div>
                <div className="text-ink-secondary font-mono tabular-nums mt-1">
                  {u.count} clasificaciones
                </div>
                <div className="text-[11px] text-ink-muted font-mono tabular-nums">
                  {u.inputTokens.toLocaleString('en-US')} in · {u.outputTokens.toLocaleString('en-US')} out
                </div>
              </div>
            ))}
          </div>
        )}
      </FunnelCard>

      <TenantMembersSection
        tenantId={tenant.id}
        members={tenant.members}
        onMemberRemoved={() => void loadAll()}
      />

      {statusModal && (
        <DeactivateConfirmModal
          title={statusModal === 'deactivate' ? 'Dar de baja al tenant' : 'Reactivar tenant'}
          description={
            statusModal === 'deactivate'
              ? 'El tenant pasará a CANCELED y sus usuarios no podrán clasificar hasta reactivarlo.'
              : 'El tenant volverá a estado ACTIVE y recuperará el acceso operativo.'
          }
          confirmLabel={statusModal === 'deactivate' ? 'Confirmar baja' : 'Confirmar reactivación'}
          danger={statusModal === 'deactivate'}
          extraCheckboxLabel={
            statusModal === 'deactivate'
              ? 'Suspender también en Supabase Auth a los usuarios exclusivos de este tenant'
              : undefined
          }
          onClose={() => setStatusModal(null)}
          onConfirm={handleLifecycleAction}
        />
      )}
    </div>
  );
}
