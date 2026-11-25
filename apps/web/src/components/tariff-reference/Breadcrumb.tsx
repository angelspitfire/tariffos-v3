import { Home } from 'lucide-react';
import { BreadcrumbItem } from '@/types/tariff-reference';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 px-4 py-2 text-xs" aria-label="Breadcrumb" style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
      <button onClick={() => window.dispatchEvent(new CustomEvent('tariff:navigate-home'))} className="flex items-center gap-1 text-[var(--text-lo)] hover:text-[var(--text-hi)]">
        <Home size={12} />
        <span>Inicio</span>
      </button>
      {items.map((item) => {
        if (item.onClick) {
          return (
            <span key={item.code} className="flex items-center gap-1">
              <span style={{ color: 'var(--border)' }}>›</span>
              <button onClick={item.onClick} className="flex items-center gap-1 text-[var(--text-mid)] hover:text-[var(--text-hi)] underline-offset-2 hover:underline">
                <span className="font-mono">{item.code}</span>
                <span>{item.label}</span>
              </button>
            </span>
          );
        } else {
          return (
            <span key={item.code} className="flex items-center gap-1">
              <span style={{ color: 'var(--border)' }}>›</span>
              <span className="text-[var(--text-hi)] font-medium">
                <span className="font-mono">{item.code}</span>
                <span>{item.label}</span>
              </span>
            </span>
          );
        }
      })}
    </nav>
  );
}
