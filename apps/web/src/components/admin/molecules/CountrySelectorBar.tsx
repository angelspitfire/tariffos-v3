'use client';

import { useState } from 'react';
import { Globe2, Plus, X } from 'lucide-react';
import type { CountryConfigInput, CountryIngestionSummary } from '@tariffos/shared-types';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';

export interface CountrySelectorBarProps {
  countries: CountryIngestionSummary[];
  selectedCode: string;
  onSelect: (code: string) => void;
  onCreateCountry: (input: CountryConfigInput) => Promise<void>;
}

export function CountrySelectorBar({
  countries,
  selectedCode,
  onSelect,
  onCreateCountry,
}: CountrySelectorBarProps) {
  const [adding, setAdding] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [legislation, setLegislation] = useState('');
  const [digits, setDigits] = useState(10);
  const [grouping, setGrouping] = useState('4.2.2.2');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selected = countries.find((c) => c.code === selectedCode) ?? countries[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onCreateCountry({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        legislation: legislation.trim(),
        nomenclatureDigits: digits,
        codeGrouping: grouping.trim(),
        isActive: true,
      });
      setAdding(false);
      setCode('');
      setName('');
      setLegislation('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando país');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FunnelCard padding="p-4" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-accent-ink" />
            <label htmlFor="ingestion-country-select" className="text-xs font-semibold text-ink-primary">
              Jurisdicción
            </label>
          </div>
          <select
            id="ingestion-country-select"
            value={selectedCode}
            onChange={(e) => onSelect(e.target.value)}
            className="rounded-lg border border-border-strong bg-surface-panel px-2.5 py-1.5 text-xs font-semibold text-ink-primary"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
          {selected && (
            <span className="text-[11px] font-mono text-ink-muted bg-surface-subtle px-2 py-0.5 rounded-md">
              {selected.nomenclatureDigits} dígitos ({selected.codeGrouping}) · {selected.legislation}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg border border-border-strong bg-surface-panel px-2.5 py-1.5 text-xs font-semibold text-ink-primary hover:bg-surface-hover cursor-pointer"
        >
          {adding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {adding ? 'Cerrar' : 'Añadir país'}
        </button>
      </div>

      {adding && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-border-subtle">
          <input
            aria-label="Código ISO-2"
            placeholder="CO"
            maxLength={2}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="rounded-lg border border-border-strong bg-surface-app px-2.5 py-1.5 text-xs"
          />
          <input
            aria-label="Nombre del país"
            placeholder="Colombia"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-lg border border-border-strong bg-surface-app px-2.5 py-1.5 text-xs"
          />
          <input
            aria-label="Legislación base"
            placeholder="Decreto 1881"
            value={legislation}
            onChange={(e) => setLegislation(e.target.value)}
            required
            className="rounded-lg border border-border-strong bg-surface-app px-2.5 py-1.5 text-xs sm:col-span-2"
          />
          <div className="flex gap-1.5">
            <input
              aria-label="Dígitos"
              type="number"
              min={6}
              max={12}
              value={digits}
              onChange={(e) => setDigits(Number(e.target.value))}
              className="w-16 rounded-lg border border-border-strong bg-surface-app px-2 py-1.5 text-xs"
            />
            <input
              aria-label="Agrupación"
              placeholder="4.2.2.2"
              value={grouping}
              onChange={(e) => setGrouping(e.target.value)}
              className="w-24 rounded-lg border border-border-strong bg-surface-app px-2 py-1.5 text-xs font-mono"
            />
          </div>
          {error && <p className="text-xs text-rose-600 sm:col-span-4">{error}</p>}
          <div className="sm:col-span-5 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-brand-hover cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar país'}
            </button>
          </div>
        </form>
      )}
    </FunnelCard>
  );
}
