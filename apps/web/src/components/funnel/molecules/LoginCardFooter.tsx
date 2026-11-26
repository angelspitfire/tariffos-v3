'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export interface LoginCardFooterProps {
  isCloud: boolean;
  onLocalTrial: () => void;
}

export function LoginCardFooter({ isCloud, onLocalTrial }: LoginCardFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-ink-muted">
      <span className="inline-flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-accent-ink" aria-hidden="true" />
        Sesión segura y aislamiento por organización
      </span>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1 font-medium text-ink-secondary hover:text-ink-primary"
        >
          <ArrowLeft className="w-3 h-3" aria-hidden="true" />
          Volver al inicio
        </Link>
        {!isCloud ? (
          <button
            type="button"
            onClick={onLocalTrial}
            className="font-medium text-ink-secondary hover:text-ink-primary underline cursor-pointer"
          >
            Probar sin cuenta
          </button>
        ) : null}
      </div>
    </div>
  );
}
