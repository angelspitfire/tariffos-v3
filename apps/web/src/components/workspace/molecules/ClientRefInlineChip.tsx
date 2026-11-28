'use client';

import { useEffect, useRef, useState } from 'react';
import { Pencil, Tag, X } from 'lucide-react';

export interface ClientRefInlineChipProps {
  value?: string | null;
  onSave: (nextValue: string | null) => void;
}

export function ClientRefInlineChip({ value, onSave }: ClientRefInlineChipProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(value ?? '');
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const clean = draft.trim();
    setEditing(false);
    onSave(clean || null);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-accent-brand bg-surface-panel px-2.5 py-0.5">
        <Tag className="h-3 w-3 shrink-0 text-accent-ink" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setDraft(value ?? '');
              setEditing(false);
            }
          }}
          onBlur={commit}
          placeholder="Cliente · BL o Factura…"
          aria-label="Cliente o referencia del despacho"
          maxLength={120}
          className="w-40 bg-transparent text-xs text-ink-primary placeholder:text-ink-subtle focus:outline-none sm:w-48"
        />
        {draft ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setDraft('');
              setEditing(false);
              onSave(null);
            }}
            aria-label="Quitar cliente o referencia"
            className="cursor-pointer rounded text-ink-subtle hover:text-ink-primary"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      aria-label={value ? `Etiquetar cliente o referencia: ${value}` : 'Etiquetar cliente o referencia'}
      className="hidden max-w-44 cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted/60 px-2.5 py-1 text-[11px] text-ink-secondary transition-colors hover:border-accent-brand hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none sm:inline-flex"
    >
      <Tag className="h-3 w-3 shrink-0 text-ink-muted" aria-hidden="true" />
      <span className="truncate font-medium">{value || '+ Cliente / Ref'}</span>
      <Pencil className="h-2.5 w-2.5 shrink-0 opacity-60" aria-hidden="true" />
    </button>
  );
}
