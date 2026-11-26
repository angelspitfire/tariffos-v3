import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { AdminShellTemplate } from '@/components/admin/templates/AdminShellTemplate';
import { resolvePlatformAdminContext } from '@/lib/admin/admin-session';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const auth = await resolvePlatformAdminContext('admin:read');

  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/login?next=/admin');
    }

    return (
      <div className="min-h-screen bg-surface-app flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-border-subtle bg-surface-panel p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h1 className="text-base font-bold text-ink-primary">
            Acceso restringido — Consola TariffOS
          </h1>
          <p className="text-xs text-ink-muted">
            Esta sección es exclusiva para el equipo interno de plataforma. Si eres cliente, vuelve a tu workspace.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-lg bg-accent-brand px-4 py-2 text-xs font-semibold text-white hover:bg-accent-brand-hover"
          >
            Volver al Workspace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminShellTemplate adminEmail={auth.context.userEmail} adminRole={auth.context.role}>
      {children}
    </AdminShellTemplate>
  );
}
