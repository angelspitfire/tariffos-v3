import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiscrepancyInspector } from './DiscrepancyInspector';
import type { DiscrepancyReport } from '@/types/domain';

const mockPayload: DiscrepancyReport = {
  filingId: 'FIL-001',
  title: 'Auditoría Cruzada: Factura vs BoL',
  discrepancies: [
    {
      id: 'd-1',
      severity: 'critical',
      field: 'CIF Value',
      expected: 50000,
      found: 55000,
      recommendation: 'Revisar valor declarado en factura',
    },
    {
      id: 'd-2',
      severity: 'medium',
      field: 'HS Code',
      expected: '8471.30.00.00',
      found: '8528.52.00.00',
      recommendation: 'Confirmar clasificación arancelaria',
    },
  ],
};

describe('DiscrepancyInspector', () => {
  it('renders with payload data', () => {
    render(<DiscrepancyInspector payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Auditoría Cruzada: Factura vs BoL')).toBeInTheDocument();
    expect(screen.getByText('2 inconsistencias detectadas')).toBeInTheDocument();
  });

  it('displays key data points correctly', () => {
    render(<DiscrepancyInspector payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('CIF Value')).toBeInTheDocument();
    expect(screen.getByText('50000')).toBeInTheDocument();
    expect(screen.getByText('55000')).toBeInTheDocument();
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('Revisar valor declarado en factura')).toBeInTheDocument();
  });

  it('renders severity badges for each discrepancy', () => {
    render(<DiscrepancyInspector payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading=true', () => {
    render(<DiscrepancyInspector payload={mockPayload} isLoading={true} />);
    expect(screen.queryByText('Auditoría Cruzada: Factura vs BoL')).not.toBeInTheDocument();
    expect(screen.queryByText('CIF Value')).not.toBeInTheDocument();
  });
});
