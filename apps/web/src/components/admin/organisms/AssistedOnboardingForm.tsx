'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import type { AdminPlanRecord } from '@tariffos/shared-types';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { OnboardingSuccessCard } from '../molecules/OnboardingSuccessCard';

export function AssistedOnboardingForm() {
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<AdminPlanRecord[]>([]);
  const [companyName, setCompanyName] = useState(searchParams.get('company') ?? '');
  const [taxId, setTaxId] = useState('');
  const [countryCode, setCountryCode] = useState(searchParams.get('country') || 'VE');
  const [ownerName, setOwnerName] = useState(searchParams.get('name') ?? '');
  const [ownerEmail, setOwnerEmail] = useState(searchParams.get('email') ?? '');
  const [planId, setPlanId] = useState('pilot');
  const [billingStatus, setBillingStatus] = useState<'TRIALING' | 'ACTIVE'>('ACTIVE');
  const [billingLimit, setBillingLimit] = useState('');
  const [sendInviteEmail, setSendInviteEmail] = useState(true);
  const [leadId] = useState(searchParams.get('leadId') ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTenant, setCreatedTenant] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    void fetch('/api/admin/plans')
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { plans?: AdminPlanRecord[] } | null) => {
        if (json?.plans && json.plans.length > 0) {
          const activePlans = json.plans.filter((p) => !p.isArchived);
          setPlans(activePlans);
          if (activePlans.length > 0) {
            setPlanId(
              (prev) =>
                activePlans.find((p) => p.id === prev || p.name === prev)?.id ??
                activePlans[0]?.id ??
                prev,
            );
          }
        }
      });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/tenants/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          taxId: taxId.trim() || undefined,
          countryCode: countryCode.trim().toUpperCase(),
          ownerName: ownerName.trim(),
          ownerEmail: ownerEmail.trim(),
          planId,
          billingStatus,
          billingLimit: billingLimit ? Number(billingLimit) : undefined,
          sendInviteEmail,
          leadId: leadId || undefined,
        }),
      });
      const json = (await res.json()) as { tenant?: { id: string; name: string }; error?: string };
      if (!res.ok || !json.tenant) {
        setError(json.error ?? 'Error en onboarding asistido');
        return;
      }
      setCreatedTenant(json.tenant);
    } finally {
      setSaving(false);
    }
  };

  if (createdTenant) {
    return (
      <OnboardingSuccessCard
        tenant={createdTenant}
        onReset={() => {
          setCreatedTenant(null);
          setCompanyName('');
          setOwnerEmail('');
          setOwnerName('');
        }}
      />
    );
  }

  const inputCls = 'w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary';

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-lg font-bold text-ink-primary">Onboarding Asistido de Cliente</h1>
        <p className="text-xs text-ink-muted">
          Crea el tenant, asigna plan inicial y envía invitación de acceso al propietario.
        </p>
      </div>

      <FunnelCard padding="p-5">
        <form onSubmit={(e) => void handleSubmit(e)} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="block space-y-1">
            <span className="font-semibold text-ink-secondary">Empresa / Agencia</span>
            <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Aduanas del Caribe C.A." className={inputCls} />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-ink-secondary">RIF / Tax ID (opcional)</span>
            <input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="J-30192837-4" className={`${inputCls} font-mono`} />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-ink-secondary">Nombre del propietario</span>
            <input required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Carlos Mendoza" className={inputCls} />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-ink-secondary">Correo del propietario</span>
            <input type="email" required value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="gerencia@aduanacaribe.ve" className={inputCls} />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-ink-secondary">Plan inicial</span>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className={inputCls}>
              {plans.length > 0 ? (
                plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName} (${p.basePrice} · {p.classificationLimit} clasif.)
                  </option>
                ))
              ) : (
                <>
                  <option value="pilot">Piloto Operativo ($150 · 250 clasif.)</option>
                  <option value="agencia">Agencia ($300/mes · 1,000 clasif.)</option>
                  <option value="enterprise">Enterprise (A medida)</option>
                </>
              )}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-ink-secondary">Estado inicial</span>
            <select value={billingStatus} onChange={(e) => setBillingStatus(e.target.value as 'TRIALING' | 'ACTIVE')} className={inputCls}>
              <option value="ACTIVE">ACTIVE (ya pagó / aprobado)</option>
              <option value="TRIALING">TRIALING (piloto guiado)</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-ink-secondary">País (ISO-2)</span>
            <input maxLength={2} value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase())} className={`${inputCls} font-mono`} />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-ink-secondary">Cuota custom (opcional)</span>
            <input type="number" min={1} value={billingLimit} onChange={(e) => setBillingLimit(e.target.value)} placeholder="Hereda del plan" className={`${inputCls} font-mono`} />
          </label>
          <label className="sm:col-span-2 inline-flex items-center gap-2 cursor-pointer pt-1">
            <input type="checkbox" checked={sendInviteEmail} onChange={(e) => setSendInviteEmail(e.target.checked)} />
            <span className="text-ink-primary font-medium">Enviar correo de invitación Supabase Auth</span>
          </label>
          {error && <p className="sm:col-span-2 text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
          <div className="sm:col-span-2 flex justify-end pt-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-accent-brand text-white font-semibold hover:bg-accent-brand-hover disabled:opacity-50 cursor-pointer">
              {saving ? 'Creando tenant...' : 'Crear tenant y enviar acceso'}
            </button>
          </div>
        </form>
      </FunnelCard>
    </div>
  );
}
