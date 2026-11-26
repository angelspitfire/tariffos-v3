'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';

export function OnboardingSuccessCard({
  tenant,
  onReset,
}: {
  tenant: { id: string; name: string };
  onReset: () => void;
}) {
  return (
    <FunnelCard padding="p-6" className="max-w-xl space-y-4">
      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="w-5 h-5" />
        <h2 className="text-base font-bold">Tenant aprovisionado con éxito</h2>
      </div>
      <p className="text-xs text-ink-secondary">
        La empresa <strong>{tenant.name}</strong> ya está creada y su invitación fue procesada.
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        <Link
          href={`/admin/tenants/${tenant.id}`}
          className="px-4 py-2 rounded-lg bg-accent-brand text-white font-semibold hover:bg-accent-brand-hover"
        >
          Ver ficha del tenant
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 rounded-lg border border-border-strong text-ink-primary hover:bg-surface-hover cursor-pointer"
        >
          Dar de alta otro cliente
        </button>
      </div>
    </FunnelCard>
  );
}
