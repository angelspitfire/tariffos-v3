import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaxBreakdownCard } from './TaxBreakdownCard';
import type { TaxSummary } from '@/types/domain';

const mockPayload: TaxSummary = {
  id: 'tax-1',
  vendor: 'SENIAT',
  invoiceId: 'INV-2024-001',
  currency: 'USD',
  totalAmount: 12500,
  dueDate: '2024-12-31',
  breakdown: [
    { concept: 'Arancel Ad-Valorem', rate: 5, amount: 2750 },
    { concept: 'IVA Aduanero', rate: 15, amount: 8250 },
    { concept: 'FODINFA', rate: 1, amount: 1500 },
  ],
  status: 'pending',
};

describe('TaxBreakdownCard', () => {
  it('renders with payload data in USD by default', () => {
    render(<TaxBreakdownCard payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Liquidación Tributaria Aduanal')).toBeInTheDocument();
    expect(screen.getByText('Tasa Oficial BCV: 1 USD = 48.50 Bs.')).toBeInTheDocument();
    expect(screen.getByText('$12,500.00 USD')).toBeInTheDocument();
  });

  it('displays key data points correctly', () => {
    render(<TaxBreakdownCard payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Arancel Ad-Valorem')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
    expect(screen.getByText('$2,750.00 USD')).toBeInTheDocument();
    expect(screen.getByText('IVA Aduanero')).toBeInTheDocument();
    expect(screen.getByText('$8,250.00 USD')).toBeInTheDocument();
    expect(screen.getByText('Total a pagar')).toBeInTheDocument();
  });

  it('switches to Venezuelan Bolivars (Bs.) and recalculates amounts', () => {
    render(<TaxBreakdownCard payload={mockPayload} isLoading={false} />);
    const bsToggle = screen.getByRole('button', { name: /ver tributos en bolívares/i });
    fireEvent.click(bsToggle);

    // 12,500 * 48.50 = 606,250.00 Bs.
    expect(screen.getByText(/606\.250,00/)).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading=true', () => {
    render(<TaxBreakdownCard payload={mockPayload} isLoading={true} />);
    expect(screen.queryByText('Liquidación Tributaria Aduanal')).not.toBeInTheDocument();
    expect(screen.queryByText('Total a pagar')).not.toBeInTheDocument();
  });
});
