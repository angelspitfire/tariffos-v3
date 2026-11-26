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

  const Icon =
    component.severity === 'restricted'
      ? ShieldAlert
      : component.severity === 'warning'
        ? AlertTriangle
        : Info;

  const toneBorder =
    component.severity === 'restricted'
      ? 'border-rose-500/30 bg-rose-500/5'
      : component.severity === 'warning'
        ? 'border-amber-500/30 bg-amber-500/5'
        : 'border-border-subtle bg-surface-panel';

  if (startsCollapsed && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border-subtle bg-surface-panel px-3 py-2 text-left text-xs transition hover:bg-surface-hover"
      >
        <span className="inline-flex min-w-0 items-center gap-2 truncate font-medium text-ink-primary">
          <Info className="h-3.5 w-3.5 shrink-0 text-accent-ink" aria-hidden="true" />
          <span className="truncate">{component.title}</span>
          <span className="text-ink-muted">· {component.authority}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
      </button>
    );
  }

  return (
    <section className={`rounded-xl border p-3.5 ${toneBorder}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-primary" aria-hidden="true" />
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h4 className="text-xs font-semibold text-ink-primary">{component.title}</h4>
              <StatusPill variant={component.severity} />
            </div>
            <p className="mt-1 text-xs text-ink-secondary">{component.summary}</p>
          </div>
        </div>
        {startsCollapsed && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Contraer aviso normativo"
            className="rounded-md p-1 text-ink-muted hover:bg-surface-hover"
          >
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {component.requiredPermits.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-border-hairline pt-2.5">
          {component.requiredPermits.map((permit) => (
            <li
              key={`${permit.code}-${permit.organism}`}
              className="flex items-center justify-between gap-2 rounded-lg bg-surface-panel px-2.5 py-1.5 text-xs ring-1 ring-border-subtle"
            >
              <span className="min-w-0">
                <span className="font-mono font-semibold text-ink-primary">{permit.code}</span>{' '}
                <span className="text-ink-secondary">{permit.name}</span>
                <span className="ml-1.5 text-ink-muted">({permit.organism})</span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  permit.mandatory
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    : 'bg-surface-subtle text-ink-muted'
                }`}
              >
                {permit.mandatory ? 'Obligatorio' : 'Condicional'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
