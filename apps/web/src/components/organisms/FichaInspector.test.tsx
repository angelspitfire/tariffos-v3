// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FichaInspector } from './FichaInspector';
import { ManifestLineItem } from '@/types/domain';

const mockItem: ManifestLineItem = {
  id: 'line-1',
  itemNumber: 3,
  hsCode: '8471.30.00.00',
  description: 'Laptops portátiles',
  quantity: 10,
  unit: 'unidades',
  fobValue: 48000,
  cifValue: 50000,
  dutyRate: 5,
  vatRate: 15,
  confidence: 0.92,
  permits: ['SENCAMER', 'CONATEL'],
};

describe('FichaInspector', () => {
  it('renders with payload data', () => {
    render(<FichaInspector item={mockItem} isLoading={false} />);
    expect(screen.getByText('Ficha de Clasificación: 8471.30.00.00')).toBeInTheDocument();
    expect(screen.getByText('Laptops portátiles')).toBeInTheDocument();
    expect(screen.getByText('Línea #3')).toBeInTheDocument();
  });

  it('displays confidence bar and percentage', () => {
    render(<FichaInspector item={mockItem} isLoading={false} />);
    expect(screen.getByText('Certeza')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('displays duty and VAT rates', () => {
    render(<FichaInspector item={mockItem} isLoading={false} />);
    expect(screen.getByText('Arancel Ad-Valorem')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
    expect(screen.getByText('IVA Aduanero')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('displays CIF unit value and quantity', () => {
    render(<FichaInspector item={mockItem} isLoading={false} />);
    expect(screen.getByText('CIF Unitario')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('Cantidad')).toBeInTheDocument();
    expect(screen.getByText('10 unidades')).toBeInTheDocument();
  });

  it('displays legal basis section', () => {
    render(<FichaInspector item={mockItem} isLoading={false} />);
    expect(screen.getByText('Fundamento Legal')).toBeInTheDocument();
    expect(screen.getByText(/RGI 1 y 6/)).toBeInTheDocument();
  });

  it('displays interactive action buttons', () => {
    render(<FichaInspector item={mockItem} isLoading={false} />);
    expect(screen.getByRole('button', { name: /Arbitraje/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Liquidación/ })).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading=true', () => {
    render(<FichaInspector item={mockItem} isLoading={true} />);
    expect(screen.queryByText('Ficha de Clasificación: 8471.30.00.00')).not.toBeInTheDocument();
    expect(screen.queryByText('Certeza')).not.toBeInTheDocument();
    expect(screen.queryByText('Arancel Ad-Valorem')).not.toBeInTheDocument();
  });
});
