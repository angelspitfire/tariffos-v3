// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TariffOrganismRenderer } from './TariffToolRenderer';
import { OrganismPayload } from '@/types/domain';

const mockTaxOrganism: OrganismPayload = {
  kind: 'tax-summary',
  data: {
    id: 'LIQ-001',
    vendor: 'Test Vendor',
    invoiceId: 'INV-001',
    currency: 'USD',
    totalAmount: 16962.5,
    dueDate: '2024-11-30',
    status: 'pending',
    breakdown: [
      { concept: 'Base Imponible Total (CIF)', rate: 0, amount: 99850 },
      { concept: 'Arancel Ad-Valorem (0% - 10%)', rate: 1.46, amount: 1455 },
      { concept: 'FODINFA (Fondo Desarrollo Infantil)', rate: 0.5, amount: 499.25 },
      { concept: 'IVA Aduanero', rate: 15, amount: 15008.25 },
    ],
  },
};

const mockManifestOrganism: OrganismPayload = {
  kind: 'manifest-grid',
  data: {
    filingId: 'TR-2024-8849-VE',
    mode: 'batch',
    items: [
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
    ],
    totalCif: 71500,
    totalDuties: 825,
  },
};

const mockDisambiguationOrganism: OrganismPayload = {
  kind: 'disambiguation',
  data: {
    filingId: 'TR-2024-8849-VE',
    lineItemId: 'item-3',
    itemNumber: 3,
    productDescription: 'Adapters',
    cifValue: 4650,
    deltaUsd: 232.5,
    recommendedHsCode: '8504.40.20.00',
    candidates: [
      {
        hsCode: '8504.40.90.00',
        description: 'Generic converters',
        dutyRate: 10,
        vatRate: 15,
        fodinfaRate: 0.5,
        totalDutyUsd: 1232.25,
        confidence: 0.62,
        legalBasis: 'RGI 1 y 6',
        rationale: 'Default classification',
        pros: ['Low risk'],
        cons: ['Higher duty'],
      },
      {
        hsCode: '8504.40.20.00',
        description: 'Switching power supplies',
        dutyRate: 5,
        vatRate: 15,
        fodinfaRate: 0.5,
        totalDutyUsd: 999.75,
        confidence: 0.89,
        legalBasis: 'Nota 2 Sección XVI',
        rationale: 'Technical match',
        pros: ['Duty savings'],
        cons: ['Requires cert'],
      },
    ],
  },
};

describe('TariffOrganismRenderer', () => {
  it('renders tax breakdown card correctly', () => {
    render(<TariffOrganismRenderer organism={mockTaxOrganism} onOpenInCanvas={() => {}} />);
    expect(screen.getByText('Cascade Tariff Tax Breakdown')).toBeInTheDocument();
    expect(screen.getByText(text => text.includes('$16,962.5') && text.includes('USD'))).toBeInTheDocument();
    expect(screen.getByText('Ad-Valorem + FODINFA + Customs VAT')).toBeInTheDocument();
  });

  it('renders manifest grid card correctly', () => {
    render(<TariffOrganismRenderer organism={mockManifestOrganism} onOpenInCanvas={() => {}} />);
    expect(screen.getByText('Cargo Manifest (Batch)')).toBeInTheDocument();
    expect(screen.getByText(text => text.includes('items processed'))).toBeInTheDocument();
    expect(screen.getByText(text => text.includes('approved automatically'))).toBeInTheDocument();
  });

  it('renders disambiguation card correctly', () => {
    render(<TariffOrganismRenderer organism={mockDisambiguationOrganism} onOpenInCanvas={() => {}} />);
    expect(screen.getByText('Tariff Arbitration: Line #3')).toBeInTheDocument();
    expect(screen.getByText(text => text.includes('$232.5') && text.includes('USD'))).toBeInTheDocument();
    expect(screen.getByText(text => text.includes('adapters'))).toBeInTheDocument();
  });

  it('shows Open button for each organism', () => {
    render(<TariffOrganismRenderer organism={mockTaxOrganism} onOpenInCanvas={() => {}} />);
    expect(screen.getByRole('button', { name: /Open/i })).toBeInTheDocument();
  });

  it('calls onOpenInCanvas when Open button is clicked', () => {
    const handleOpen = vi.fn();
    render(<TariffOrganismRenderer organism={mockTaxOrganism} onOpenInCanvas={handleOpen} />);
    const openButton = screen.getByRole('button', { name: /Open/i });
    fireEvent.click(openButton);
    expect(handleOpen).toHaveBeenCalled();
  });
});
