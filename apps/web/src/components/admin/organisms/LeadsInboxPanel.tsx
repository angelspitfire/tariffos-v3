'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { AdminLeadRecord, LeadStatus } from '@tariffos/shared-types';
import { ArrowRight, Search } from 'lucide-react';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { LeadStatusBadge } from '../atoms/LeadStatusBadge';

export function LeadsInboxPanel() {
  const [leads, setLeads] = useState<AdminLeadRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (query.trim()) params.set('q', query.trim());
      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as { leads?: AdminLeadRecord[] };
        setLeads(json.leads ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const updateStatus = async (leadId: string, status: LeadStatus) => {
    const res = await fetch(`/api/admin/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const json = (await res.json()) as { lead?: AdminLeadRecord };
      if (json.lead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? json.lead! : l)));
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-ink-primary">Bandeja de Leads</h1>
        <p className="text-xs text-ink-muted">
          Prospectos capturados desde la landing. Conviértelos en tenants con onboarding asistido en 1 clic.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por correo, nombre o empresa..."
            className="w-full rounded-lg border border-border-strong bg-surface-input pl-8 pr-3 py-2 text-ink-primary"
          />
        </div>
        <select
          aria-label="Filtrar leads por estado"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="CONTACTED">Contactados</option>
          <option value="CONVERTED">Convertidos</option>
          <option value="DISCARDED">Descartados</option>
        </select>
      </div>

      {loading ? (
        <FunnelCard padding="p-6" className="text-xs text-ink-muted">
          Cargando leads...
        </FunnelCard>
      ) : leads.length === 0 ? (
        <FunnelCard padding="p-6" className="text-xs text-ink-muted text-center">
          No hay leads que coincidan con el filtro actual.
        </FunnelCard>
      ) : (
        <div className="space-y-2.5">
          {leads.map((lead) => {
            const onboardHref = `/admin/onboarding?leadId=${encodeURIComponent(lead.id)}&email=${encodeURIComponent(lead.email)}&company=${encodeURIComponent(lead.company ?? '')}&name=${encodeURIComponent(lead.name ?? '')}&country=${encodeURIComponent(lead.country)}`;
            return (
              <FunnelCard key={lead.id} padding="p-4" className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-ink-primary">
                      {lead.company ?? lead.name ?? lead.email}
                    </span>
                    <LeadStatusBadge status={lead.status} />
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle text-ink-muted">
                      {lead.country}
                    </span>
                  </div>
                  <div className="text-xs text-ink-secondary">
                    {lead.email}
                    {lead.name ? ` · ${lead.name}` : ''}
                    {lead.phone ? ` · ${lead.phone}` : ''}
                    {lead.volume ? ` · Vol: ${lead.volume}` : ''}
                  </div>
                  {lead.notes && <p className="text-[11px] text-ink-muted">{lead.notes}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {lead.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => void updateStatus(lead.id, 'CONTACTED')}
                      className="px-2.5 py-1.5 rounded-lg border border-border-strong text-ink-primary hover:bg-surface-hover cursor-pointer"
                    >
                      Marcar contactado
                    </button>
                  )}
                  {lead.status !== 'DISCARDED' && lead.status !== 'CONVERTED' && (
                    <button
                      type="button"
                      onClick={() => void updateStatus(lead.id, 'DISCARDED')}
                      className="px-2.5 py-1.5 rounded-lg border border-border-strong text-ink-muted hover:bg-surface-hover cursor-pointer"
                    >
                      Descartar
                    </button>
                  )}
                  {lead.status !== 'CONVERTED' && (
                    <Link
                      href={onboardHref}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-brand text-white font-semibold hover:bg-accent-brand-hover"
                    >
                      Convertir a Onboarding
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </FunnelCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
