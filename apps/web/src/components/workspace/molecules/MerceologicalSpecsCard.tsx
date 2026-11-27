'use client';

import { useState } from 'react';
import { Pencil, Plus, RefreshCw } from 'lucide-react';

export interface TechnicalSpecItem {
  key: string;
  value: string;
}

export interface MerceologicalSpecsCardProps {
  specs: readonly TechnicalSpecItem[];
  onReevaluate?: (updatedSpecs: TechnicalSpecItem[]) => void;
  embedded?: boolean;
}

export function MerceologicalSpecsCard({
  specs,
  onReevaluate,
  embedded = false,
}: MerceologicalSpecsCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<TechnicalSpecItem[]>(() => specs.map((s) => ({ ...s })));

  if (specs.length === 0 && !editing) return null;

  const handleToggleEdit = () => {
    if (!editing) {
      setDraft(specs.map((s) => ({ ...s })));
    }
    setEditing((prev) => !prev);
  };

  const handleAddParam = () => {
    setDraft((prev) => [...prev, { key: 'Parámetro', value: '' }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draft.filter((item) => item.key.trim() && item.value.trim());
    onReevaluate?.(cleaned);
    setEditing(false);
  };

  return (
    <section
      className={
        embedded
          ? 'px-5 py-4'
          : 'rounded-card border border-border-subtle bg-surface-panel p-4 shadow-xs'
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-ink-secondary">
          Ficha merceológica
        </h3>
        {onReevaluate ? (
          <button
            type="button"
            onClick={handleToggleEdit}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-subtle bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <Pencil className="h-3 w-3" aria-hidden="true" />
            <span>{editing ? 'Cancelar' : 'Editar ficha'}</span>
          </button>
        ) : null}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
          <div className="grid gap-2 sm:grid-cols-2">
            {draft.map((spec, idx) => (
              <div
                key={`spec-${idx}`}
                className="space-y-1 rounded-field border border-border-subtle bg-surface-muted p-2"
              >
                <input
                  type="text"
                  name={`specKey-${idx}`}
                  value={spec.key}
                  aria-label={`Atributo ${idx + 1}`}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, key: e.target.value } : item)),
                    )
                  }
                  className="w-full rounded bg-transparent text-[11px] font-medium text-ink-muted focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
                />
                <input
                  type="text"
                  name={`specValue-${idx}`}
                  value={spec.value}
                  aria-label={`Valor de ${spec.key || `Atributo ${idx + 1}`}`}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, value: e.target.value } : item)),
                    )
                  }
                  className="w-full rounded-md border border-border-subtle bg-surface-input px-2 py-1 text-xs text-ink-primary focus:border-accent-brand focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleAddParam}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-subtle bg-surface-muted px-3 py-1 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Parámetro
            </button>
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent-brand px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-brand-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Reevaluar dictamen
            </button>
          </div>
        </form>
      ) : (
        <dl className="mt-2.5 grid gap-2 sm:grid-cols-2">
          {specs.map((spec) => (
            <div key={spec.key} className="rounded-field bg-surface-muted px-3 py-2">
              <dt className="text-[11px] text-ink-muted">{spec.key}</dt>
              <dd className="mt-0.5 text-xs font-medium text-ink-primary">{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
