'use client';

import { useEffect, useState } from 'react';

export interface DecimalFieldProps {
  label: string;
  name: string;
  value: number;
  onChange: (nextValue: number) => void;
  min?: number;
  placeholder?: string;
  className?: string;
}

const DECIMAL_PATTERN = /^\d*([.,]\d*)?$/;

export function DecimalField({
  label,
  name,
  value,
  onChange,
  min = 0,
  placeholder = '0',
  className = '',
}: DecimalFieldProps) {
  const [draft, setDraft] = useState<string>(() => String(value));

  useEffect(() => {
    const normalized = draft.replace(',', '.');
    const parsed = normalized === '' ? 0 : Number(normalized);
    if (parsed !== value) {
      setDraft(String(value));
    }
  }, [value, draft]);

  const handleChange = (raw: string) => {
    if (!DECIMAL_PATTERN.test(raw)) return;
    setDraft(raw);
    if (raw === '' || raw === '.' || raw === ',') {
      onChange(min);
      return;
    }
    const parsed = Number(raw.replace(',', '.'));
    if (Number.isFinite(parsed)) {
      onChange(Math.max(min, parsed));
    }
  };

  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-medium text-ink-secondary">{label}</span>
      <input
        type="text"
        name={name}
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        className={`rounded-lg border border-border-subtle bg-surface-input px-3 py-2 font-mono text-sm text-ink-primary tabular-nums focus:border-accent-brand focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${className}`}
      />
    </label>
  );
}
