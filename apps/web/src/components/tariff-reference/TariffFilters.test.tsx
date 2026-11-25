import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TariffFilters } from './TariffFilters';
import type { TariffFilters as TariffFiltersType } from '@/types/tariff-reference';

const CHAPTERS = [
  { code: '01', title: 'Animales vivos' },
  { code: '02', title: 'Carnes y despojos comestibles' },
  { code: '03', title: 'Pescados y mariscos' },
];

const UNITS = ['UN', 'KG', 'L', 'M2', 'M', 'PR'];

const DEFAULT_FILTERS: TariffFiltersType = {
  chapter: [],
  dutyRange: [0, 30],
  status: [],
  unit: [],
  query: '',
};

const renderFilters = (
  props?: Partial<Parameters<typeof TariffFilters>[0]>
) => {
  const onChange = vi.fn();
  const clearAll = vi.fn();
  render(
    <TariffFilters
      filters={DEFAULT_FILTERS}
      onChange={onChange}
      chapters={CHAPTERS}
      units={UNITS}
      clearAll={clearAll}
      {...props}
    />
  );
  return { onChange, clearAll };
};

describe('TariffFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all four filter sections', () => {
    renderFilters();
    expect(screen.getByText('Capitulo')).toBeInTheDocument();
    expect(screen.getByText('Rango Ad-Valorem')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Unidad')).toBeInTheDocument();
  });

  it('renders status checkboxes with Spanish labels', () => {
    renderFilters();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    expect(screen.getByText('Suspendido')).toBeInTheDocument();
  });

  it('renders unit checkboxes', () => {
    renderFilters();
    expect(screen.getByText('UN')).toBeInTheDocument();
    expect(screen.getByText('KG')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('shows active filter chips when filters are set', () => {
    renderFilters({
      filters: {
        ...DEFAULT_FILTERS,
        chapter: ['01'],
        status: ['active'],
        unit: ['KG'],
        dutyRange: [5, 15],
      },
    });
    expect(screen.getAllByText('Activo').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('KG').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Min. 5%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Max. 15%').length).toBeGreaterThanOrEqual(1);
  });

  it('shows filter count badge', () => {
    renderFilters({
      filters: {
        ...DEFAULT_FILTERS,
        chapter: ['01'],
        status: ['active'],
      },
    });
    expect(screen.getByText('Filtros activos (2)')).toBeInTheDocument();
  });

  it('calls clearAll when Limpiar todo is clicked', () => {
    const { clearAll } = renderFilters({
      filters: {
        ...DEFAULT_FILTERS,
        chapter: ['01'],
      },
    });
    fireEvent.click(screen.getByText('Limpiar todo'));
    expect(clearAll).toHaveBeenCalled();
  });

  it('calls onChange after debounce when filters are reset', async () => {
    const { onChange } = renderFilters({
      filters: {
        ...DEFAULT_FILTERS,
        chapter: ['01'],
      },
    });
    fireEvent.click(screen.getByText('Limpiar todo'));
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ chapter: [] })
    );
  });

  it('renders duty range slider and inputs', () => {
    renderFilters();
    const numberInputs = screen.getAllByRole('spinbutton');
    expect(numberInputs.length).toBeGreaterThanOrEqual(2);
  });
});
