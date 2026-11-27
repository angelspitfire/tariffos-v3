'use client';

import { useState } from 'react';
import { Check, Copy, Mail, MailWarning, ShieldCheck } from 'lucide-react';

export interface ProvisionedCredentialsInfo {
  email: string;
  temporaryPassword: string;
  planSlug: string;
  emailDelivery: {
    delivered: boolean;
    provider: 'resend' | 'cloudflare' | 'none';
    error?: string;
  };
}

export interface AdminCredentialsBannerProps {
  credentials: ProvisionedCredentialsInfo;
  onDismiss: () => void;
}

export function AdminCredentialsBanner({ credentials, onDismiss }: AdminCredentialsBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const snippet = [
      `Usuario: ${credentials.email}`,
      `Clave temporal: ${credentials.temporaryPassword}`,
      `Plan: ${credentials.planSlug} (Ilimitado)`,
    ].join('\n');
    await navigator.clipboard?.writeText(snippet).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 space-y-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Administrador habilitado · Plan {credentials.planSlug} (∞)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-panel border border-border-subtle text-ink-primary font-semibold hover:bg-surface-hover cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado' : 'Copiar credenciales'}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="text-ink-muted hover:text-ink-primary cursor-pointer px-1.5 py-1"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg bg-surface-panel/80 border border-border-hairline p-3 font-mono text-[11px]">
        <div>
          <span className="text-ink-muted block">Usuario</span>
          <span className="text-ink-primary font-semibold select-all">{credentials.email}</span>
        </div>
        <div>
          <span className="text-ink-muted block">Clave temporal</span>
          <span className="text-ink-primary font-bold select-all">{credentials.temporaryPassword}</span>
        </div>
      </div>

      {credentials.emailDelivery.delivered ? (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300">
          <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Credenciales enviadas por correo ({credentials.emailDelivery.provider}).</span>
        </div>
      ) : (
        <div className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-300">
          <MailWarning className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            No hay proveedor de correo configurado; copia las credenciales arriba y compártelas por canal seguro.
          </span>
        </div>
      )}
    </div>
  );
}
