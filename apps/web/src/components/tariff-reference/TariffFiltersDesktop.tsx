'use client';

import { Plus } from 'lucide-react';
import {
  DUTY_RATE_MAX,
  DUTY_RATE_MIN,
  TARIFF_STATUS_LABELS,
  type TariffFilters,
} from '@/types/tariff-reference';
import { TariffFilterChip } from './TariffFilterChip';
import { TariffFiltersSection } from './TariffFiltersSection';
import { TariffChapterSelector } from './TariffChapterSelector';
import { TariffDutyRange } from './TariffDutyRange';
import { TariffStatusSelector } from './TariffStatusSelector';
import { TariffUnitSelector } from './TariffUnitSelector';

interface TariffFiltersDesktopProps {
  filters: TariffFilters;
  chapters: { code: string; title: string }[];
  units: string[];
  onToggleSelection: (
    key: 'chapter' | 'status' | 'unit',
    value: string,
    checked: boolean
  ) => void;
  onSetDutyRange: (min: number, max: number) => void;
  onSetQuery: (query: string) => void;
  onRemoveChapter: (code: string) => void;
  onRemoveStatus: (status: string) => void;
  onRemoveUnit: (code: string) => void;
  onRemoveDutyMin: () => void;
  onRemoveDutyMax: () => void;
  onReset: () => void;
}

const SECTION_ORDER = ['chapter', 'duty', 'status', 'unit'] as const;

const sectionLabel: Record<string, string> = {
  chapter: 'Capitulo',
  duty: 'Rango Ad-Valorem',
  status: 'Estado',
  unit: 'Unidad',
};

const sectionIcon: Record<string, React.ReactNode> = {
  chapter: <Plus size={14} />,
  duty: <span className="w-4 h-4 flex items-center justify-center"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg></span>,
  status: <span className="w-4 h-4 flex items-center justify-center"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></span>,
  unit: <span className="w-4 h-4 flex items-center justify-center"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="3" x2="8" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="3" x2="21" y2="21"/></svg></span>,
};

export function TariffFiltersDesktop({
  filters,
  chapters,
  units,
  onToggleSelection,
  onSetDutyRange,
  onSetQuery,
  onRemoveChapter,
  onRemoveStatus,
  onRemoveUnit,
  onRemoveDutyMin,
  onRemoveDutyMax,
  onReset,
}: TariffFiltersDesktopProps) {
  const activeCount =
    (filters.chapter.length > 0 ? 1 : 0) +
    (filters.status.length > 0 ? 1 : 0) +
    (filters.unit.length > 0 ? 1 : 0) +
    (filters.dutyRange[0] > DUTY_RATE_MIN || filters.dutyRange[1] < DUTY_RATE_MAX ? 1 : 0) +
    (filters.query.length > 0 ? 1 : 0);
  const hasFilters = activeCount > 0;

  return (
    <div className="space-y-3">
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-text-lo">
            Filtros activos ({activeCount})
          </span>
          {filters.chapter.map((code) => {
            const ch = chapters.find((c) => c.code === code);
            return (
              <TariffFilterChip
                key={`chip-ch-${code}`}
                label={ch?.title || code}
                value={code}
                onRemove={() => onRemoveChapter(code)}
              />
            );
          })}
          {filters.status.map((s) => (
            <TariffFilterChip
              key={`chip-st-${s}`}
              label={TARIFF_STATUS_LABELS[s]}
              value={s}
              onRemove={() => onRemoveStatus(s)}
            />
          ))}
          {filters.unit.map((u) => (
            <TariffFilterChip
              key={`chip-un-${u}`}
              label={u}
              value={u}
              onRemove={() => onRemoveUnit(u)}
            />
          ))}
          {filters.dutyRange[0] > DUTY_RATE_MIN && (
            <TariffFilterChip
              key="chip-duty-min"
              label={`Min. ${filters.dutyRange[0]}%`}
              value="duty-min"
              onRemove={onRemoveDutyMin}
            />
          )}
          {filters.dutyRange[1] < DUTY_RATE_MAX && (
            <TariffFilterChip
              key="chip-duty-max"
              label={`Max. ${filters.dutyRange[1]}%`}
              value="duty-max"
              onRemove={onRemoveDutyMax}
            />
          )}
          {filters.query.length > 0 && (
            <TariffFilterChip
              key="chip-query"
              label={`"${filters.query}"`}
              value="query"
              onRemove={() => onSetQuery('')}
            />
          )}
          <button
            onClick={onReset}
            className="ml-2 flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-700 bg-zinc-800/50 text-[10px] font-semibold text-text-mid hover:bg-zinc-700"
            aria-label="Limpiar todos los filtros"
          >
            <Plus size={12} /> Limpiar todo
          </button>
        </div>
      )}
      <div className="space-y-2">
        {SECTION_ORDER.map((id) => (
          <TariffFiltersSection
            key={id}
            label={sectionLabel[id]}
            icon={sectionIcon[id]}
            count={
              id === 'chapter' ? filters.chapter.length
              : id === 'status' ? filters.status.length
              : id === 'unit' ? filters.unit.length
              : undefined
            }
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
  );
}
