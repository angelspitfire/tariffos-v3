'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type {
  A2UIMerceologicalSheet,
  A2UIMerceologicalSheetComponent,
  HitlTentativeProposal,
  MerceologicalAttributeKey,
} from '@tariffos/shared-types';
import { mergeUserEditedSheet } from '@/lib/workspace/merceological-helpers';
import { ConfidenceBadge } from '../atoms/ConfidenceBadge';

interface MerceologicalSheetCardProps {
  component: A2UIMerceologicalSheetComponent;
  tentativeProposal?: HitlTentativeProposal;
  onSubmit: (updatedSheet: A2UIMerceologicalSheet) => void;
  onAcceptTentative?: (hsCode: string) => void;
}

function buildInitialDraft(
  sheet: A2UIMerceologicalSheet
): Record<MerceologicalAttributeKey, string> {
  const draft = {} as Record<MerceologicalAttributeKey, string>;
  for (const attr of sheet.attributes) {
    draft[attr.key] = attr.value;
  }
  return draft;
}

export function MerceologicalSheetCard({
  component,
  tentativeProposal,
  onSubmit,
  onAcceptTentative,
}: MerceologicalSheetCardProps) {
  const { sheet, mode, title } = component;
  const isConfirmedSummary = mode === 'confirmed_summary';
  const [expanded, setExpanded] = useState(!isConfirmedSummary);
  const [draft, setDraft] = useState<Record<MerceologicalAttributeKey, string>>(() =>
    buildInitialDraft(sheet)
  );
  const firstMissingRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setExpanded(!isConfirmedSummary);
    setDraft(buildInitialDraft(sheet));
  }, [component.id, isConfirmedSummary, sheet]);

  useEffect(() => {
    if (!isConfirmedSummary && expanded && firstMissingRef.current) {
      firstMissingRef.current.focus();
    }
  }, [isConfirmedSummary, expanded]);

  const handleConfirm = () => {
    const updated = mergeUserEditedSheet(sheet, draft, true);
    onSubmit(updated);
  };

  if (isConfirmedSummary && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-soft)] px-3 py-2 text-left text-xs transition-colors hover:opacity-95 focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
      >
        <span className="inline-flex min-w-0 items-center gap-2 truncate font-medium text-ink-primary">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
          <span className="truncate">{title}</span>
          <span className="text-ink-muted">({sheet.attributes.length} atributos)</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <ConfidenceBadge
            label={sheet.confidenceBreakdown.level}
            pct={sheet.confidenceBreakdown.finalScore}
          />
          <ChevronDown className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
        </span>
      </button>
    );
  }

  const firstMissingKey = sheet.attributes.find(
    (a) => a.critical && (a.provenance === 'missing' || !a.value.trim())
  )?.key;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleConfirm();
      }}
      className="rounded-card border border-border-subtle bg-surface-panel p-4 shadow-card"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-semibold text-ink-primary">{title}</h4>
          {component.subtitle && (
            <p className="mt-0.5 text-[11px] text-ink-muted">{component.subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceBadge
            label={sheet.confidenceBreakdown.level}
            pct={sheet.confidenceBreakdown.finalScore}
          />
          {isConfirmedSummary && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Contraer ficha merceológica"
              className="cursor-pointer rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
            >
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {tentativeProposal && onAcceptTentative && (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent-border bg-accent-soft px-3 py-2 text-xs">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 font-medium text-accent-ink">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Hipótesis preliminar ({tentativeProposal.confidencePct}%)
            </div>
            <p className="truncate text-[11px] text-ink-secondary">{tentativeProposal.title}</p>
          </div>
          <button
            type="button"
            onClick={() => onAcceptTentative(tentativeProposal.hsCode)}
            className="shrink-0 cursor-pointer rounded-lg bg-accent-brand px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-brand-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            Usar {tentativeProposal.hsCode}
          </button>
        </div>
      )}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {sheet.attributes.map((attr) => {
          const val = draft[attr.key] ?? '';
          const isMissingCritical = attr.critical && !val.trim();
          const inputId = `${component.id}-${attr.key}`;
          return (
            <label key={attr.key} htmlFor={inputId} className="flex flex-col gap-1 text-[11px]">
              <span className="flex items-center justify-between font-medium text-ink-secondary">
                <span>{attr.label}</span>
                {isMissingCritical && (
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    Requerido
                  </span>
                )}
              </span>
              <input
                ref={attr.key === firstMissingKey ? firstMissingRef : undefined}
                id={inputId}
                name={attr.key}
                autoComplete="off"
                type="text"
                value={val}
                placeholder={attr.placeholder}
                onChange={(e) => setDraft((prev) => ({ ...prev, [attr.key]: e.target.value }))}
                className={`rounded-lg border px-2.5 py-1.5 text-xs text-ink-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${
                  isMissingCritical
                    ? 'border-amber-500/60 bg-amber-500/5 focus:border-amber-500'
                    : 'border-border-subtle bg-surface-input focus:border-accent-brand'
                }`}
              />
            </label>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-hairline pt-2.5">
        <span className="text-[11px] text-ink-muted">
          Presiona Enter para validar y continuar la clasificación
        </span>
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-accent-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-brand-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        >
          Confirmar ficha
        </button>
      </div>
    </form>
  );
}
