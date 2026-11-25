'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TariffFilters } from '@/types/tariff-reference';
import {
  DEFAULT_TARIFF_FILTERS,
  TARIFF_FILTER_DEBOUNCE_MS,
} from '@/types/tariff-reference';
import { TariffFiltersDesktop } from './TariffFiltersDesktop';
import { TariffFiltersMobile } from './TariffFiltersMobile';

interface TariffFiltersProps {
  filters: TariffFilters;
  onChange: (filters: TariffFilters) => void;
  chapters: { code: string; title: string }[];
  units: string[];
  clearAll: () => void;
}

export function TariffFilters(props: TariffFiltersProps) {
  // Use props directly to avoid TS6198
  const filters = props.filters;
  const onChange = props.onChange;
  const chapters = props.chapters;
  const units = props.units;
  const clearAll = props.clearAll;
  const [localFilters, setLocalFilters] = useState<TariffFilters>(filters);
  const [chapterSearch, setChapterSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  // Used in handleReset
  void chapterSearch;
  void unitSearch;
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitial = useRef(true);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const debouncedOnChange = useCallback(
    (next: TariffFilters) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(next);
      }, TARIFF_FILTER_DEBOUNCE_MS);
    },
    [onChange]
  );

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    debouncedOnChange(localFilters);
  }, [localFilters, debouncedOnChange]);

  const handleToggleSelection = useCallback(
    (key: 'chapter' | 'status' | 'unit', value: string, checked: boolean) => {
      setLocalFilters((prev) => {
        const current = (prev[key] as string[]) ?? [];
        const next = checked
          ? [...current, value]
          : current.filter((v) => v !== value);
        return { ...prev, [key]: next };
      });
    },
    []
  );

  const setDutyRange = useCallback((min: number, max: number) => {
    setLocalFilters((prev) => ({ ...prev, dutyRange: [min, max] }));
  }, []);

  const setQuery = useCallback((query: string) => {
    setLocalFilters((prev) => ({ ...prev, query }));
  }, []);

  const removeChapter = useCallback((code: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      chapter: prev.chapter.filter((c) => c !== code),
    }));
  }, []);

  const removeStatus = useCallback((status: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: prev.status.filter((s) => s !== status),
    }));
  }, []);

  const removeUnit = useCallback((code: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      unit: prev.unit.filter((u) => u !== code),
    }));
  }, []);

  const removeDutyMin = useCallback(() => {
    setLocalFilters((prev) => ({
      ...prev,
      dutyRange: [0, prev.dutyRange[1]],
    }));
  }, []);

  const removeDutyMax = useCallback(() => {
    setLocalFilters((prev) => ({
      ...prev,
      dutyRange: [prev.dutyRange[0], 30],
    }));
  }, []);

  const handleReset = useCallback(() => {
    setLocalFilters(DEFAULT_TARIFF_FILTERS);
    setChapterSearch('');
    setUnitSearch('');
    debouncedOnChange(DEFAULT_TARIFF_FILTERS);
    clearAll();
  }, [clearAll, debouncedOnChange]);

  const handleApply = useCallback(() => {
    debouncedOnChange(localFilters);
    if (isMobile) setBottomSheetOpen(false);
  }, [debouncedOnChange, isMobile, localFilters]);

  const sharedProps = {
    filters: localFilters,
    chapters,
    units,
    onToggleSelection: handleToggleSelection,
    onSetDutyRange: setDutyRange,
    onSetQuery: setQuery,
    onRemoveChapter: removeChapter,
    onRemoveStatus: removeStatus,
    onRemoveUnit: removeUnit,
    onRemoveDutyMin: removeDutyMin,
    onRemoveDutyMax: removeDutyMax,
    onReset: handleReset,
  };

  if (isMobile) {
    return (
      <TariffFiltersMobile
        {...sharedProps}
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        onApply={handleApply}
      />
    );
  }

  return <TariffFiltersDesktop {...sharedProps} />;
}
