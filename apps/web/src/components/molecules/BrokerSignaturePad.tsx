'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export interface BrokerSignaturePadProps {
  onApprove: (brokerName: string, licenseId: string) => void;
  disabled?: boolean;
}

/** Lightweight human-in-the-loop broker sign-off molecule for dossier approval. */
export function BrokerSignaturePad({ onApprove, disabled }: BrokerSignaturePadProps) {
  const [brokerName, setBrokerName] = useState('');
  const [licenseId, setLicenseId] = useState('');

  const canSubmit = brokerName.trim().length > 1 && licenseId.trim().length > 1 && !disabled;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onApprove(brokerName.trim(), licenseId.trim());
      }}
      className="rounded-xl border border-border-subtle bg-surface-panel p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-accent-ink" />
        <h3 className="text-sm font-semibold text-ink-primary">Aprobación de Agente Aduanal</h3>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={brokerName}
          onChange={(e) => setBrokerName(e.target.value)}
          placeholder="Nombre del agente aduanal"
          className="rounded-lg border border-border-subtle bg-surface-input px-3 py-2 text-xs text-ink-primary placeholder:text-ink-subtle focus:border-accent-brand focus:outline-none"
        />
        <input
          type="text"
          value={licenseId}
          onChange={(e) => setLicenseId(e.target.value)}
          placeholder="N° Licencia / Registro SENIAT"
          className="tabular-nums rounded-lg border border-border-subtle bg-surface-input px-3 py-2 text-xs text-ink-primary placeholder:text-ink-subtle focus:border-accent-brand focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-accent-brand px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        Firmar y Aprobar Dictamen
      </button>
    </form>
  );
}
