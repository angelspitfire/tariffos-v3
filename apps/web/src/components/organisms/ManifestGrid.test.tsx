// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ManifestGrid } from './ManifestGrid';
import type { ManifestLineItem, ManifestGridPayload } from '@/types/domain';

const mockItems: ManifestLineItem[] = [
  {
    id: 'item-1',
    itemNumber: 1,
    hsCode: '8471.30.00.00',
    description: 'Laptops',
    quantity: 100,
    unit: 'U',
    fobValue: 50000,
    cifValue: 55000,
    dutyRate: 0,
    vatRate: 15,
    confidence: 0.95,
    permits: [],
  },
  {
    id: 'item-2',
    itemNumber: 2,
    hsCode: '8528.52.00.00',
    description: 'Monitors',
    quantity: 50,
    unit: 'U',
    fobValue: 15000,
    cifValue: 16500,
    dutyRate: 5,
    vatRate: 15,
    confidence: 0.88,
    permits: [],
  },
  {
    id: 'item-3',
    itemNumber: 3,
    hsCode: '8504.40.90.00',
    description: 'Adapters',
    quantity: 200,
    unit: 'U',
    fobValue: 4000,
    cifValue: 4400,
    dutyRate: 10,
    vatRate: 15,
    confidence: 0.62,
    permits: [],
  },
];

const mockPayload: ManifestGridPayload = {
  filingId: 'TR-2024-8849-VE',
  mode: 'batch',
  items: mockItems,
  totalCif: 75900,
  totalDuties: 1234,
};

describe('ManifestGrid', () => {
  it('renders table with correct headers', () => {
    render(<ManifestGrid payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Partida HS')).toBeInTheDocument();
    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('Cant.')).toBeInTheDocument();
    expect(screen.getByText('CIF (USD)')).toBeInTheDocument();
    expect(screen.getByText('Arancel')).toBeInTheDocument();
    expect(screen.getByText('IVA')).toBeInTheDocument();
    expect(screen.getByText('Certeza')).toBeInTheDocument();
  });

  it('renders all items in the table', () => {
    render(<ManifestGrid payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('8471.30.00.00')).toBeInTheDocument();
    expect(screen.getByText('Laptops')).toBeInTheDocument();
    expect(screen.getByText('8528.52.00.00')).toBeInTheDocument();
    expect(screen.getByText('Monitors')).toBeInTheDocument();
    expect(screen.getByText('8504.40.90.00')).toBeInTheDocument();
    expect(screen.getByText((text) => text.toLowerCase().includes('adapt'))).toBeInTheDocument();
  });

  it('shows correct confidence badges', () => {
    render(<ManifestGrid payload={mockPayload} isLoading={false} />);
    // High confidence (95%) - green badge
    expect(screen.getByText('95%')).toBeInTheDocument();
    // Medium confidence (88%) - amber badge
    expect(screen.getByText('88%')).toBeInTheDocument();
    // Low confidence (62%) - red badge
    expect(screen.getByText('62%')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<ManifestGrid payload={mockPayload} isLoading={true} />);
    // SkeletonTable should render - no table grid should be present
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(screen.queryByText('Partida HS')).not.toBeInTheDocument();
  });

  it('filters items by search query', () => {
    render(<ManifestGrid payload={mockPayload} isLoading={false} />);
    const searchInput = screen.getByPlaceholderText('Filtrar por HS o descripción...');
    expect(searchInput).toBeInTheDocument();
  });

  it('enters edit mode on edit button click and saves updates', () => {
    const handleUpdate = vi.fn();
    render(
      <ManifestGrid
        payload={mockPayload}
        isLoading={false}
        onUpdateItem={handleUpdate}
      />
    );

    const editBtn = screen.getByLabelText('Editar partida 8471.30.00.00');
    fireEvent.click(editBtn);

    expect(screen.getByLabelText('Subpartida arancelaria')).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(saveBtn);

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    expect(handleUpdate).toHaveBeenCalledWith('item-1', expect.objectContaining({
      hsCode: '8471.30.00.00',
    }));
  });

  it('displays correct CIF and duty values', () => {
    render(<ManifestGrid payload={mockPayload} isLoading={false} />);
    // Item 1: CIF ,000, duty 0%
    expect(screen.getByText('$55,000')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    // Item 2: CIF ,500, duty 5%
    expect(screen.getByText('$16,500')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
    // Item 3: CIF ,400, duty 10%
    expect(screen.getByText('$4,400')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

});