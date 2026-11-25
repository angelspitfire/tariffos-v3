'use client';

import { Filter, X as CloseIcon } from 'lucide-react';
import {
  TARIFF_STATUS_LABELS,
  type TariffFilters,
} from '@/types/tariff-reference';
import { TariffFiltersSection } from './TariffFiltersSection';
import { TariffChapterSelector } from './TariffChapterSelector';
import { TariffDutyRange } from './TariffDutyRange';
import { TariffStatusSelector } from './TariffStatusSelector';
import { TariffUnitSelector } from './TariffUnitSelector';

interface TariffFiltersMobileProps {
  filters: TariffFilters;
  chapters: { code: string; title: string }[];
  units: string[];
  isOpen: boolean;
  onClose: () => void;
  onToggleSelection: (
    key: 'chapter' | 'status' | 'unit',
    value: string,
    checked: boolean
  ) => void;
  onSetDutyRange: (min: number, max: number) => void;
  onApply: () => void;
  onReset: () => void;
}

const SECTION_ORDER = ['chapter', 'duty', 'status', 'unit'] as const;

const sectionLabel: Record<string, string> = {
  chapter: 'Capitulo',
  duty: 'Rango Ad-Valorem',
  status: 'Estado',
  unit: 'Unidad',
};

function countActiveFilters(filters: TariffFilters): number {
  let count = 0;
  if (filters.chapter.length > 0) count += 1;
  if (filters.status.length > 0) count += 1;
  if (filters.unit.length > 0) count += 1;
  if (filters.dutyRange[0] > 0 || filters.dutyRange[1] < 30) count += 1;
  if (filters.query.length > 0) count += 1;
  return count;
}

export function TariffFiltersMobile({
  filters,
  chapters,
  units,
  isOpen,
  onClose,
  onToggleSelection,
  onSetDutyRange,
  onApply,
  onReset,
}: TariffFiltersMobileProps) {
  const activeCount = countActiveFilters(filters);
  const hasFilters = activeCount > 0;

  return (
    <div>
      <button
        onClick={onClose}
        aria-label="Abrir filtros"
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm font-medium"
      >
        <Filter size={16} />
        <span>Filtros{hasFilters ? ` (${activeCount})` : ''}</span>
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="flex-1 bg-surface border-t border-border shadow-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-hi">Filtros</h2>
              <button
                onClick={onClose}
                className="rounded p-1.5 hover:bg-zinc-800/50 text-text-mid"
                aria-label="Cerrar filtros"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-2">
                {SECTION_ORDER.map((id) => (
                  <TariffFiltersSection
                    key={id}
                    label={sectionLabel[id]}
                    icon={<span className="w-4 h-4" />}
                    expanded={true}
                    onToggle={() => {}}
                  >
                    {id === 'chapter' && (
                      <TariffChapterSelector
                        chapters={chapters}
                        selected={filters.chapter}
                        onToggle={(code, checked) => onToggleSelection('chapter', code, checked)}
                        search=""
                        onSearchChange={() => {}}
                      />
                    )}
                    {id === 'duty' && (
                      <TariffDutyRange
                        min={filters.dutyRange[0]}
                        max={filters.dutyRange[1]}
                        onChange={onSetDutyRange}
                      />
                    )}
                    {id === 'status' && (
                      <TariffStatusSelector
                        labels={TARIFF_STATUS_LABELS}
                        selected={filters.status}
                        onToggle={(status, checked) => onToggleSelection('status', status, checked)}
                      />
                    )}
                    {id === 'unit' && (
                      <TariffUnitSelector
                        units={units}
                        selected={filters.unit}
                        onToggle={(code, checked) => onToggleSelection('unit', code, checked)}
                        search=""
                        onSearchChange={() => {}}
                      />
                    )}
                  </TariffFiltersSection>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-border flex items-center justify-between gap-3">
              <button
                onClick={onReset}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-text-mid hover:bg-zinc-800/50"
              >
                Restablecer todo
              </button>
              <button
                onClick={onApply}
                className="flex-1 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-indigo-600"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
