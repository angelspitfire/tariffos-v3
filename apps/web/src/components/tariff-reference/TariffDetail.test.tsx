import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { TariffDetail } from './TariffDetail';
import { TariffSearchResult } from '@/types/tariff-reference';

const baseItem: TariffSearchResult = {
  item: {
    code: '0101.21.00.00',
    description: 'Horses, purebred breeding',
    descriptionEs: 'Caballos de cria pura',
    dutyAdValorem: 5,
    vat: 16,
    fodinfa: 0.5,
    unit: 'UN',
    status: 'active',
    notes: 'Nota de ejemplo',
  },
  chapter: '01',
  heading: '0101',
  subheading: '0101.21',
  // Convenience properties
  code: '0101.21.00.00',
  description: 'Horses, purebred breeding',
  descriptionEs: 'Caballos de cria pura',
  dutyAdValorem: 5,
  vat: 16,
  fodinfa: 0.5,
  unit: 'UN',
  status: 'active',
  notes: 'Nota de ejemplo',
};

const writeTextMock = vi.fn();

beforeEach(() => {
  writeTextMock.mockReset();
  writeTextMock.mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText: writeTextMock } });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function renderItem(overrides: Partial<TariffSearchResult> = {}) {
  // Create a new item, ensuring item.notes is also overridden if notes is provided
  console.log('DEBUG renderItem overrides:', overrides, 'hasOwnProperty notes:', overrides.hasOwnProperty('notes'));
  let item = { ...baseItem, ...overrides };
  console.log('DEBUG after spread item.notes:', item.notes);
  if (overrides.hasOwnProperty('notes')) {
    console.log('DEBUG entering if block');
    item = {
      ...item,
      item: { ...item.item, notes: overrides.notes },
      notes: overrides.notes,
    };
    console.log('DEBUG after override item.notes:', item.notes, 'item.item.notes:', item.item?.notes);
  } else {
    console.log('DEBUG NOT entering if block');
  }
  const onFavoriteToggle = vi.fn();
  const onExport = vi.fn();
  const utils = render(
    <TariffDetail item={item} onFavoriteToggle={onFavoriteToggle} isFavorite={false} onExport={onExport} />,
  );
  return { item, onFavoriteToggle, onExport, ...utils };
}

describe('TariffDetail', () => {
  it('renders empty state when no item is selected', () => {
    const { getByText } = render(
      <TariffDetail
        item={undefined}
        onFavoriteToggle={vi.fn()}
        isFavorite={false}
        onExport={vi.fn()}
      />,
    );
    expect(getByText('Seleccione un codigo arancelario para ver detalles')).toBeInTheDocument();
  });

  it('renders empty state when item is null', () => {
    const { getByText } = render(
      <TariffDetail
        item={null}
        onFavoriteToggle={vi.fn()}
        isFavorite={false}
        onExport={vi.fn()}
      />,
    );
    expect(getByText('Seleccione un codigo arancelario para ver detalles')).toBeInTheDocument();
  });

  it('renders code, description and status badge', () => {
    const { getByText } = renderItem();
    expect(getByText('0101.21.00.00')).toBeInTheDocument();
    const descriptions = screen.getAllByText('Horses, purebred breeding');
    expect(descriptions.length).toBeGreaterThanOrEqual(1);
    expect(getByText('Activo')).toBeInTheDocument();
  });

  it('renders duty section with ad-valorem, IVA, FODINFA and total effective rate', () => {
    const { getByText } = renderItem();
    expect(getByText('Ad-Valorem')).toBeInTheDocument();
    expect(getByText('5.00%')).toBeInTheDocument();
    expect(getByText('IVA')).toBeInTheDocument();
    expect(getByText('16.00%')).toBeInTheDocument();
    expect(getByText('FODINFA')).toBeInTheDocument();
    expect(getByText('0.50%')).toBeInTheDocument();
    expect(getByText('Tasa efectiva total')).toBeInTheDocument();
    expect(getByText('21.50%')).toBeInTheDocument();
    expect(getByText('UN')).toBeInTheDocument();
  });

  it('shows Especifico only when applicable', () => {
    const { queryByText } = renderItem({ specificDuty: undefined });
    expect(queryByText('Especifico')).not.toBeInTheDocument();

    const { getByText } = renderItem({ specificDuty: 2.5 });
    expect(getByText('Especifico')).toBeInTheDocument();
    expect(getByText('$2.50/KG')).toBeInTheDocument();
  });

  it('renders full description and notes', () => {
    const { getByText, getAllByText } = renderItem();
    expect(getByText('Descripcion')).toBeInTheDocument();
    const descriptions = getAllByText('Horses, purebred breeding');
    expect(descriptions.length).toBe(2);
    expect(getByText('Notas')).toBeInTheDocument();
    expect(getByText('Nota de ejemplo')).toBeInTheDocument();
  });

  it('copies code to clipboard and shows toast', async () => {
    const { item, getByRole, getByText } = renderItem();
    fireEvent.click(getByRole('button', { name: /Copiar codigo/i }));
    expect(writeTextMock).toHaveBeenCalledWith(item.code);
    await waitFor(() =>
      expect(getByText(`Codigo ${item.code} copiado al portapapeles`)).toBeInTheDocument(),
    );
  });

  it('toggles favorite through onFavoriteToggle', () => {
    const { item, onFavoriteToggle, getByRole } = renderItem();
    fireEvent.click(getByRole('button', { name: /Agregar a favoritos/i }));
    expect(onFavoriteToggle).toHaveBeenCalledWith(item.code, true);
  });

  it('exports CSV and JSON through onExport', () => {
    const { onExport, getByRole } = renderItem();
    fireEvent.click(getByRole('button', { name: /Exportar CSV/i }));
    expect(onExport).toHaveBeenCalledWith('csv');
    fireEvent.click(getByRole('button', { name: /Exportar JSON/i }));
    expect(onExport).toHaveBeenCalledWith('json');
  });

  it('renders an external SENIAT link', () => {
    const { getByRole } = renderItem();
    const link = getByRole('link', { name: /Abrir en SENIAT/i });
    expect(link).toHaveAttribute('href', `https://seniat.gob.ve/consultas/arl/${baseItem.code}`);
    expect(link).toHaveAttribute('target', '_blank');
  });
});
