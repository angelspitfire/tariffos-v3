// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataListCard } from './DataListCard';
import { DataListPayload } from '@/types/domain';

const mockPayload: DataListPayload = {
  title: 'Resumen de Valores Aduaneros',
  items: [
    { label: 'Valor FOB', value: '$48,000', subtext: 'Base para cálculo de arancel' },
    { label: 'Valor CIF', value: '$50,000', subtext: 'Incluye flete y seguro' },
    { label: 'Arancel Ad-Valorem', value: '$2,500', subtext: '5% sobre CIF' },
    { label: 'IVA Aduanero', value: '$7,500', subtext: '15% sobre CIF + arancel' },
    { label: 'Total a pagar', value: '$60,000', subtext: 'Liquidación final' },
  ],
};

describe('DataListCard', () => {
  it('renders with payload data', () => {
    render(<DataListCard payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Resumen de Valores Aduaneros')).toBeInTheDocument();
    expect(screen.getByText('5 items')).toBeInTheDocument();
  });

  it('displays list items with labels and values', () => {
    render(<DataListCard payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Valor FOB')).toBeInTheDocument();
    expect(screen.getByText('$48,000')).toBeInTheDocument();
    expect(screen.getByText('Valor CIF')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('Arancel Ad-Valorem')).toBeInTheDocument();
    expect(screen.getByText('$2,500')).toBeInTheDocument();
    expect(screen.getByText('IVA Aduanero')).toBeInTheDocument();
    expect(screen.getByText('$7,500')).toBeInTheDocument();
    expect(screen.getByText('Total a pagar')).toBeInTheDocument();
    expect(screen.getByText('$60,000')).toBeInTheDocument();
  });

  it('renders each item as an interactive row with ChevronRight', () => {
    render(<DataListCard payload={mockPayload} isLoading={false} />);
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(5);
    rows.forEach((row) => {
      expect(row).toHaveClass('cursor-pointer');
    });
    expect(screen.getAllByText('5 items')).toHaveLength(1);
  });

  it('renders loading skeleton when isLoading=true', () => {
    render(<DataListCard payload={mockPayload} isLoading={true} />);
    expect(screen.queryByText('Resumen de Valores Aduaneros')).not.toBeInTheDocument();
    expect(screen.queryByText('Valor FOB')).not.toBeInTheDocument();
    expect(screen.queryByText('$50,000')).not.toBeInTheDocument();
  });
});
