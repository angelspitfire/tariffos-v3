'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Menu, ShieldCheck, X } from 'lucide-react';
import type { PlatformRole } from '@tariffos/shared-types';
import { BrandMark } from '@/components/funnel/atoms/BrandMark';
import { AdminRoleBadge } from '../atoms/AdminRoleBadge';
import { AdminSidebarNav } from '../molecules/AdminSidebarNav';

export interface AdminShellTemplateProps {
  adminEmail: string | null;
  adminRole: PlatformRole;
  children: ReactNode;
}

export function AdminShellTemplate({
  adminEmail,
  adminRole,
  children,
}: AdminShellTemplateProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-app text-ink-primary flex flex-col">
      <header className="sticky top-0 z-30 h-12 border-b border-border-subtle bg-surface-panel px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Alternar menú admin"
            className="lg:hidden p-1.5 rounded-lg border border-border-subtle text-ink-secondary hover:bg-surface-hover cursor-pointer"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <BrandMark />
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-ink-muted px-2 py-0.5 rounded-md bg-surface-subtle">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-ink" />
            Consola Admin
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {adminEmail && <span className="hidden md:inline text-ink-muted">{adminEmail}</span>}
          <AdminRoleBadge role={adminRole} />
          <Link
            href="/app"
            className="rounded-lg border border-border-strong bg-surface-panel px-3 py-1 font-semibold text-ink-primary hover:bg-surface-hover transition-colors"
          >
            Ir al Workspace
          </Link>
        </div>
      </header>

      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        <aside className="hidden lg:block w-56 shrink-0 border-r border-border-subtle bg-surface-panel/60 p-4">
          <AdminSidebarNav />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div className="w-64 bg-surface-panel border-r border-border-subtle p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-primary">Menú Admin</span>
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" className="cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <AdminSidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
            <button
              type="button"
              aria-label="Cerrar menú"
              className="flex-1 bg-black/40 cursor-pointer"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
