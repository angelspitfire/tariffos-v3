import Link from 'next/link';
import { BrandMark } from '@/components/funnel/atoms/BrandMark';
import { AdminBillingQueue } from '@/components/funnel/organisms/AdminBillingQueue';

export default function AdminBillingPage() {
  return (
    <div className="min-h-screen bg-surface-app">
      <header className="border-b border-border-subtle bg-surface-panel">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-3 text-xs font-medium">
            <Link href="/activate-plan" className="text-ink-muted hover:text-ink-primary">
              Activar plan
            </Link>
            <Link
              href="/app"
              className="rounded-lg bg-accent-brand px-3 py-1.5 font-semibold text-white hover:bg-accent-brand-hover"
            >
              Ir al Workspace
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <AdminBillingQueue />
      </main>
    </div>
  );
}
