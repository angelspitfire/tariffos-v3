'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import type { ManualPaymentMethod } from '@tariffos/shared-types';
import {
  buildWhatsAppSupportUrl,
  resolvePaymentCoordinates,
  SUPPORT_EMAIL,
} from '@/lib/funnel/payment-methods';

export interface PaymentMethodDetailsCardProps {
  method: ManualPaymentMethod;
  planName: string;
  expectedUsd: number;
  bcvRate?: number | null;
  bcvDate?: string | null;
  bcvLoading?: boolean;
  onRefreshBcv?: () => void;
}

export function PaymentMethodDetailsCard({
  method,
  planName,
  expectedUsd,
  bcvRate,
  bcvDate,
  bcvLoading = false,
  onRefreshBcv,
}: PaymentMethodDetailsCardProps) {
  const [copied, setCopied] = useState(false);
  const info = resolvePaymentCoordinates(method);
  const whatsAppUrl = buildWhatsAppSupportUrl(
    `Hola equipo TariffOS, quiero coordinar mi pago para activar ${planName} ($${expectedUsd} USD).`,
  );
  const vesEquivalent =
    info.isVesMethod && bcvRate && bcvRate > 0 ? Number((expectedUsd * bcvRate).toFixed(2)) : null;

  const handleCopy = async () => {
    if (!info.coordinates || typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(info.coordinates).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-xl border border-accent-border bg-accent-soft/45 p-3.5 space-y-2 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-ink-primary">{info.title}</span>
        {info.coordinates ? (
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border-subtle bg-surface-panel text-[11px] font-medium text-ink-primary hover:bg-surface-hover cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado' : 'Copiar datos'}
          </button>
        ) : null}
      </div>

      {info.coordinates ? (
        <p className="font-mono text-[11px] text-ink-primary whitespace-pre-line bg-surface-panel/80 rounded-lg px-2.5 py-2 border border-border-hairline">
          {info.coordinates}
        </p>
      ) : (
        <p className="text-[11px] text-ink-secondary leading-relaxed">{info.fallbackHint}</p>
      )}

      {info.isVesMethod ? (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border-hairline text-[11px]">
          <span className="text-ink-secondary">
            {vesEquivalent ? (
              <>
                Tasa BCV ({bcvDate ?? 'hoy'}): <strong className="font-mono text-ink-primary">Bs. {bcvRate?.toFixed(2)}</strong>
                {' · '}Monto exacto:{' '}
                <strong className="font-mono text-accent-ink tabular-nums">
                  Bs. {vesEquivalent.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </>
            ) : (
              'Consultando tasa oficial BCV del día...'
            )}
          </span>
          {onRefreshBcv ? (
            <button
              type="button"
              disabled={bcvLoading}
              onClick={onRefreshBcv}
              className="inline-flex items-center gap-1 font-medium text-accent-ink hover:underline cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${bcvLoading ? 'animate-spin' : ''}`} />
              Actualizar BCV
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px]">
        {whatsAppUrl ? (
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-accent-ink hover:underline"
          >
            Confirmar por WhatsApp
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : null}
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Activación ${planName}`)}`}
          className="text-ink-muted hover:text-ink-primary hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
      </div>
    </div>
  );
}
