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
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-left text-xs transition hover:bg-emerald-500/10"
      >
        <span className="inline-flex min-w-0 items-center gap-2 truncate font-medium text-ink-primary">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span className="truncate">{title}</span>
          <span className="text-ink-muted">· {sheet.attributes.length} atributos</span>
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
      className="rounded-xl border border-border-subtle bg-surface-panel p-3.5 shadow-xs"
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
              className="rounded-md p-1 text-ink-muted hover:bg-surface-hover"
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
            className="shrink-0 rounded-lg bg-accent-brand px-2.5 py-1 text-xs font-medium text-white transition hover:bg-accent-brand-hover"
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
                type="text"
                value={val}
                placeholder={attr.placeholder}
                onChange={(e) => setDraft((prev) => ({ ...prev, [attr.key]: e.target.value }))}
                className={`rounded-lg border px-2.5 py-1.5 text-xs text-ink-primary outline-none transition ${
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
          className="rounded-lg bg-accent-brand px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-brand-hover"
        >
          Confirmar ficha
        </button>
      </div>
    </form>
  );
}
