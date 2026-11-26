'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminPlanRecord } from '@tariffos/shared-types';
import { Archive, Edit3, Plus } from 'lucide-react';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { PlanFormModal } from '../molecules/PlanFormModal';

export function PlansManagerPanel() {
  const [plans, setPlans] = useState<AdminPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalPlan, setModalPlan] = useState<AdminPlanRecord | null | 'new'>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/plans');
      if (res.ok) {
        const json = (await res.json()) as { plans?: AdminPlanRecord[] };
        setPlans(json.plans ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const handleToggleArchive = async (plan: AdminPlanRecord) => {
    const res = await fetch(`/api/admin/plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isArchived: !plan.isArchived }),
    });
    if (res.ok) void loadPlans();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-ink-primary">Gestión de Planes SaaS</h1>
          <p className="text-xs text-ink-muted">
            Crea planes públicos o privados para clientes corporativos y controla sus cuotas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalPlan('new')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-brand px-3.5 py-2 text-xs font-semibold text-white hover:bg-accent-brand-hover cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Crear plan
        </button>
      </div>

      {loading ? (
        <FunnelCard padding="p-6" className="text-xs text-ink-muted">
          Cargando catálogo de planes...
        </FunnelCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {plans.map((plan) => (
            <FunnelCard
              key={plan.id}
              padding="p-4"
              className={`flex flex-col justify-between gap-3 ${plan.isArchived ? 'opacity-60' : ''}`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-ink-primary">{plan.displayName}</div>
                    <div className="text-[11px] font-mono text-ink-subtle">{plan.name}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        plan.isPublic
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-surface-subtle text-ink-muted border-border-subtle'
                      }`}
                    >
                      {plan.isPublic ? 'Público' : 'Privado'}
                    </span>
                    {plan.isArchived && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/30">
                        Archivado
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-baseline gap-2 font-mono tabular-nums">
                  <span className="text-xl font-bold text-ink-primary">
                    ${plan.annualOnly ? plan.annualPriceUsd : plan.basePrice}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {plan.annualOnly ? '/ año' : '/ mes'} · {plan.classificationLimit.toLocaleString('en-US')} clasif.
                  </span>
                </div>

                {plan.description && (
                  <p className="text-xs text-ink-muted line-clamp-2">{plan.description}</p>
                )}

                <div className="text-[11px] text-ink-secondary">
                  Tenants asignados: <strong className="font-mono">{plan.tenantCount}</strong> · Usuarios máx:{' '}
                  <strong className="font-mono">{plan.maxUsers}</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-hairline text-xs">
                <button
                  type="button"
                  onClick={() => void handleToggleArchive(plan)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border-strong text-ink-secondary hover:bg-surface-hover cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                  {plan.isArchived ? 'Restaurar' : 'Archivar'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalPlan(plan)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-subtle text-ink-primary font-semibold hover:bg-surface-hover cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </button>
              </div>
            </FunnelCard>
          ))}
        </div>
      )}

      {modalPlan !== null && (
        <PlanFormModal
          initial={modalPlan === 'new' ? null : modalPlan}
          onClose={() => setModalPlan(null)}
          onSaved={() => {
            setModalPlan(null);
            void loadPlans();
          }}
        />
      )}
    </div>
  );
}
