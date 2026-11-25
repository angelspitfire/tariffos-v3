// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TariffTable } from './TariffTable';
import type { TariffItem } from '@/types/tariff-reference';

const makeItem = (overrides = {}): TariffItem => ({
  code: '0101.21.00.00',
  description: 'Horses, purebred breeding',
  descriptionEs: 'Caballos, reproduccion pura',
  dutyAdValorem: 5,
  dutyRate: 5,
  vatRate: 16,
  vat: 16,
  fodinfaRate: 0.5,
  fodinfa: 0.5,
  unit: 'UN',
  status: 'active',
  requiresPermit: false,
  permitAgencies: [],
  ...overrides,
});

const items = [
  makeItem({ code: '0101.21.00.00', dutyAdValorem: 5, status: 'active' }),
  makeItem({ code: '0101.29.00.00', dutyAdValorem: 12, status: 'active' }),
  makeItem({ code: '0101.30.00.00', dutyAdValorem: 20, status: 'suspended' }),
];

describe('TariffTable', () => {
  it('renders column headers', () => {
    render(<TariffTable items={items} onSelect={vi.fn()} />);
    expect(screen.getByText('Código')).toBeInTheDocument();
    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('Ad-Valorem %')).toBeInTheDocument();
    expect(screen.getByText('Específico')).toBeInTheDocument();
    expect(screen.getByText('IVA %')).toBeInTheDocument();
    expect(screen.getByText('FODINFA %')).toBeInTheDocument();
    expect(screen.getByText('Unidad')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
  });

  it('renders item rows with data', () => {
    render(<TariffTable items={items} onSelect={vi.fn()} />);
    expect(screen.getByText('0101.21.00.00')).toBeInTheDocument();
    expect(screen.getAllByText('Horses, purebred breeding').length).toBeGreaterThan(0);
    expect(screen.getByText('5%')).toBeInTheDocument();
    expect(screen.getAllByText('16%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0.5%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('UN').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
  });

  it('shows empty state when no items', () => {
    render(<TariffTable items={[]} onSelect={vi.fn()} />);
    expect(screen.getByText('No se encontraron partidas arancelarias.')).toBeInTheDocument();
  });

  it('renders loading skeleton rows', () => {
    render(<TariffTable items={[]} loading onSelect={vi.fn()} />);
    const skeletons = screen.getAllByRole('cell');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('calls onSelect when a row is clicked', () => {
    const onSelect = vi.fn();
    render(<TariffTable items={items} onSelect={onSelect} />);
    const row = screen.getByText('0101.29.00.00').closest('tr');
    fireEvent.click(row);
    expect(onSelect).toHaveBeenCalledWith(items[1]);
  });

  it('highlights the selected row', () => {
    render(<TariffTable items={items} selectedCode="0101.29.00.00" onSelect={vi.fn()} />);
    const row = screen.getByText('0101.29.00.00').closest('tr');
    expect(row).toHaveClass('bg-[var(--brand-subtle)]');
  });

  it('calls onSort when a sortable header is clicked', () => {
    const onSort = vi.fn();
    render(<TariffTable items={items} onSelect={vi.fn()} onSort={onSort} />);
    const header = screen.getByText('Código').closest('th');
    fireEvent.click(header);
    expect(onSort).toHaveBeenCalledWith('code');
  });

  it('does not call onSort for the Especifico column', () => {
    const onSort = vi.fn();
    render(<TariffTable items={items} onSelect={vi.fn()} onSort={onSort} />);
    const header = screen.getByText('Específico').closest('th');
    fireEvent.click(header);
    expect(onSort).not.toHaveBeenCalled();
  });
});
