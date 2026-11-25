// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermitsComplianceMatrix } from './PermitsComplianceMatrix';
import { PermitsMatrixPayload } from '@/types/permits';

const mockPayload: PermitsMatrixPayload = {
  filingId: 'FIL-001',
  filingStatus: 'pending',
  totalPermits: 4,
  approvedCount: 2,
  pendingCount: 1,
  blockingCount: 1,
  lines: [
    {
      lineItemId: 'line-1',
      itemNumber: 1,
      hsCode: '8471.30.00.00',
      productDescription: 'Laptops portátiles',
      permits: [
        {
          id: 'p-1',
          agency: 'SENCAMER',
          code: 'SENCAMER-001',
          name: 'Registro SENCAMER',
          status: 'approved',
          notes: 'Vigente',
          requiredDoc: 'Cédula de identidad',
        },
        {
          id: 'p-2',
          agency: 'CONATEL',
          code: 'CONATEL-002',
          name: 'Permiso CONATEL',
          status: 'pending',
          notes: 'En trámite',
          requiredDoc: 'Especificaciones técnicas',
        },
      ],
      overallStatus: 'pending',
    },
    {
      lineItemId: 'line-2',
      itemNumber: 2,
      hsCode: '8528.52.00.00',
      productDescription: 'Monitores',
      permits: [
        {
          id: 'p-3',
          agency: 'ARCSA',
          code: 'ARCSA-003',
          name: 'Certificado ARCSA',
          status: 'blocking',
          notes: 'No conforme',
          requiredDoc: 'Informe de laboratorio',
        },
      ],
      overallStatus: 'blocking',
    },
  ],
};

describe('PermitsComplianceMatrix', () => {
  it('renders with payload data', () => {
    render(<PermitsComplianceMatrix payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Matriz de Cumplimiento No Arancelario')).toBeInTheDocument();
    expect(screen.getByText('4 aprobaciones · 2 líneas evaluadas')).toBeInTheDocument();
    expect(screen.getByText('1 bloqueante')).toBeInTheDocument();
  });

  it('displays table headers and line data', () => {
    render(<PermitsComplianceMatrix payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Línea')).toBeInTheDocument();
    expect(screen.getByText('Producto')).toBeInTheDocument();
    expect(screen.getByText('Agencia')).toBeInTheDocument();
    expect(screen.getByText('Permiso')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Observaciones')).toBeInTheDocument();
    expect(screen.getByText('Laptops portátiles')).toBeInTheDocument();
    expect(screen.getByText('Monitores')).toBeInTheDocument();
  });

  it('displays status badges for each line', () => {
    render(<PermitsComplianceMatrix payload={mockPayload} isLoading={false} />);
    expect(screen.getByText(text => text.includes('En Trámite'))).toBeInTheDocument();
    expect(screen.getByText(text => text.includes('Bloqueante'))).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading=true', () => {
    render(<PermitsComplianceMatrix payload={mockPayload} isLoading={true} />);
    expect(screen.queryByText('Matriz de Cumplimiento No Arancelario')).not.toBeInTheDocument();
    expect(screen.queryByText('Laptops portátiles')).not.toBeInTheDocument();
  });
});
