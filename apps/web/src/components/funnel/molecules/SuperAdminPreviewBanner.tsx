import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function SuperAdminPreviewBanner() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-accent-border bg-accent-soft/50 px-3.5 py-2.5 text-xs text-ink-primary">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
        <span>
          <strong>Modo Super Admin</strong> · Acceso libre sin límites (tu plan interno ilimitado no se verá afectado).
        </span>
      </div>
      <div className="flex items-center gap-3 font-semibold text-accent-ink">
        <Link href="/app" className="hover:underline">
          Ir a /app
        </Link>
        <Link href="/admin" className="hover:underline">
          Consola /admin
        </Link>
      </div>
    </div>
  );
}
