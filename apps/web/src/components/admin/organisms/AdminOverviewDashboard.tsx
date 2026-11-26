'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Building2, CreditCard, Inbox, Layers, UserPlus } from 'lucide-react';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { AdminKpiTile } from '../atoms/AdminKpiTile';

interface OverviewData {
  totalTenants: number;
  activeTenants: number;
  trialingTenants: number;
  canceledTenants: number;
  pendingPayments: number;
  pendingPaymentsAmountUsd: number;
  pendingLeads: number;
  totalPlans: number;
  monthlyClassifications: number;
  monthlyTokens: number;
  nearLimitTenants: number;
}

const QUICK_LINKS = [
  { href: '/admin/leads', title: 'Bandeja de Leads', desc: 'Revisar prospectos y convertir a onboarding en 1 clic.', icon: Inbox },
  { href: '/admin/plans', title: 'Gestionar Planes', desc: 'Crear planes públicos o privados y ajustar cuotas.', icon: Layers },
  { href: '/admin/onboarding', title: 'Onboarding Asistido', desc: 'Dar de alta una agencia y enviar invitación al dueño.', icon: UserPlus },
  { href: '/admin/billing', title: 'Aprobar Pagos', desc: 'Verificar transferencias/Zelle y activar suscripciones.', icon: CreditCard },
  { href: '/admin/tenants', title: 'Tenants y Bajas', desc: 'Cambiar planes, revisar miembros y ejecutar bajas.', icon: Building2 },
  { href: '/admin/usage', title: 'Consumo por Tenant', desc: 'Monitorear clasificaciones, tokens LLM y alertas de cuota.', icon: Activity },
] as const;

export function AdminOverviewDashboard() {
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    void fetch('/api/admin/overview')
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { overview?: OverviewData } | null) => {
        if (json?.overview) setData(json.overview);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-ink-primary">Centro de Control Multi-Tenant</h1>
        <p className="text-xs text-ink-muted">
          Operación comercial, leads, altas asistidas, pagos manuales y consumo en vivo.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminKpiTile
          label="Tenants activos"
          value={data?.activeTenants ?? '—'}
          hint={data ? `${data.trialingTenants} en trial · ${data.canceledTenants} de baja` : undefined}
          tone="emerald"
        />
        <AdminKpiTile
          label="Pagos por aprobar"
          value={data?.pendingPayments ?? '—'}
          hint={data ? `$${data.pendingPaymentsAmountUsd.toLocaleString('en-US')} USD pendientes` : undefined}
          tone="amber"
        />
        <AdminKpiTile
          label="Leads pendientes"
          value={data?.pendingLeads ?? '—'}
          hint="Listos para contacto u onboarding"
          tone="brand"
        />
        <AdminKpiTile
          label="Tenants >= 80% cuota"
          value={data?.nearLimitTenants ?? '—'}
          hint={data ? `${data.monthlyClassifications.toLocaleString('en-US')} clasif. este mes` : undefined}
          tone={data && data.nearLimitTenants > 0 ? 'rose' : 'default'}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="block group">
              <FunnelCard padding="p-4" className="h-full hover:border-accent-border transition-colors space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-bold text-ink-primary group-hover:text-accent-ink">
                  <Icon className="w-4 h-4 text-accent-ink" />
                  <span>{item.title}</span>
                </div>
                <p className="text-xs text-ink-muted">{item.desc}</p>
              </FunnelCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
