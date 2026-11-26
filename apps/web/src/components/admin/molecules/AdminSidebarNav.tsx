'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Building2,
  ClipboardList,
  CreditCard,
  Inbox,
  Layers,
  LayoutDashboard,
  UserPlus,
} from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/admin/leads', label: 'Leads', icon: Inbox, exact: false },
  { href: '/admin/plans', label: 'Planes', icon: Layers, exact: false },
  { href: '/admin/onboarding', label: 'Onboarding', icon: UserPlus, exact: false },
  { href: '/admin/billing', label: 'Pagos', icon: CreditCard, exact: false },
  { href: '/admin/tenants', label: 'Tenants', icon: Building2, exact: false },
  { href: '/admin/usage', label: 'Consumo', icon: Activity, exact: false },
  { href: '/admin/audit', label: 'Auditoría', icon: ClipboardList, exact: false },
] as const;

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación administrativa" className="space-y-1">
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              active
                ? 'bg-accent-soft text-accent-ink border border-accent-border'
                : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary border border-transparent'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
