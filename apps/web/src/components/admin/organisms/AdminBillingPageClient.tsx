'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminPlanRecord, AdminTenantSummary } from '@tariffos/shared-types';
import { Plus } from 'lucide-react';
import { AdminBillingQueue } from '@/components/funnel/organisms/AdminBillingQueue';
import { createBillingActivationAdapter } from '@/lib/funnel/billing-port';
import { RecordManualPaymentModal } from '../molecules/RecordManualPaymentModal';

export function AdminBillingPageClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tenants, setTenants] = useState<AdminTenantSummary[]>([]);
  const [plans, setPlans] = useState<AdminPlanRecord[]>([]);

  const adminPort = useMemo(
    () => createBillingActivationAdapter({ adminMode: true }),
    [],
  );

  const loadMeta = useCallback(async () => {
    const [tRes, pRes] = await Promise.all([
      fetch('/api/admin/tenants'),
      fetch('/api/admin/plans'),
    ]);
    if (tRes.ok) {
      const tJson = (await tRes.json()) as { tenants?: AdminTenantSummary[] };
      setTenants(tJson.tenants ?? []);
    }
    if (pRes.ok) {
      const pJson = (await pRes.json()) as { plans?: AdminPlanRecord[] };
      setPlans(pJson.plans ?? []);
    }
  }, []);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-brand px-3.5 py-2 text-xs font-semibold text-white hover:bg-accent-brand-hover cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Registrar pago manual
        </button>
      </div>

      <AdminBillingQueue key={refreshKey} billingPort={adminPort} />

      {modalOpen && (
        <RecordManualPaymentModal
          tenants={tenants}
          plans={plans}
          onClose={() => setModalOpen(false)}
          onRecorded={() => {
            setModalOpen(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
