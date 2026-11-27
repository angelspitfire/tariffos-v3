'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info, ShieldAlert } from 'lucide-react';
import type { A2UILegalNoticeComponent } from '@tariffos/shared-types';
import { StatusPill } from '../atoms/StatusPill';

interface LegalNoticeCardProps {
  component: A2UILegalNoticeComponent;
}

export function LegalNoticeCard({ component }: LegalNoticeCardProps) {
  const hasMandatoryPermit = component.requiredPermits.some((p) => p.mandatory);
  const startsCollapsed = component.severity === 'info' && !hasMandatoryPermit;
  const [expanded, setExpanded] = useState(!startsCollapsed);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  const Icon =
    component.severity === 'restricted'
      ? ShieldAlert
      : component.severity === 'warning'
        ? AlertTriangle
        : Info;

  const toneBorder =
    component.severity === 'restricted'
      ? 'border-[var(--color-error-border)] bg-[var(--color-error-soft)]'
      : component.severity === 'warning'
        ? 'border-amber-500/30 bg-amber-500/5'
        : 'border-border-subtle bg-surface-panel';

  if (startsCollapsed && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-border-subtle bg-surface-panel px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
      >
        <span className="inline-flex min-w-0 items-center gap-2 truncate font-medium text-ink-primary">
          <Info className="h-3.5 w-3.5 shrink-0 text-accent-ink" aria-hidden="true" />
          <span className="font-semibold text-accent-ink">{component.authority}</span>
          <span className="truncate">{component.title}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
      </button>
    );
  }

  const checkedCount = component.requiredPermits.filter(
    (p, idx) => checkedMap[`${p.code}-${idx}`],
  ).length;

  return (
    <section className={`rounded-card border p-4 shadow-card ${toneBorder}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-primary" aria-hidden="true" />
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h4 className="text-xs font-semibold text-ink-primary">{component.title}</h4>
              <StatusPill variant={component.severity} />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{component.summary}</p>
          </div>
        </div>
        {startsCollapsed ? (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Contraer aviso normativo"
            className="cursor-pointer rounded-md p-1 text-ink-muted hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {component.requiredPermits.length > 0 ? (
        <div className="mt-3 space-y-2 border-t border-border-hairline pt-2.5">
          <div className="text-[11px] font-medium text-ink-secondary">
            Recaudos previos al despacho ({component.requiredPermits.length})
            {checkedCount > 0 ? ` — ${checkedCount} verificados` : ''}
          </div>
          <ul className="space-y-1.5">
            {component.requiredPermits.map((permit, idx) => {
              const key = `${permit.code}-${idx}`;
              const checked = Boolean(checkedMap[key]);
              return (
                <li key={key}>
                  <label className="flex cursor-pointer flex-wrap items-start justify-between gap-x-2 gap-y-1 rounded-lg border border-border-subtle bg-surface-panel px-2.5 py-1.5 text-xs transition-colors hover:bg-surface-hover">
                    <span className="flex min-w-0 flex-1 items-start gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setCheckedMap((prev) => ({ ...prev, [key]: e.target.checked }))
                        }
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded accent-accent-brand focus-visible:ring-2 focus-visible:ring-accent-brand"
                      />
                      <span
                        className={`break-words leading-snug ${checked ? 'text-ink-subtle line-through' : 'font-medium text-ink-primary'}`}
                      >
                        <span className="font-mono font-semibold">{permit.code}</span> {permit.name}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-ink-muted">
                      {permit.organism} ({permit.mandatory ? 'Obligatorio' : 'Condicional'})
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
