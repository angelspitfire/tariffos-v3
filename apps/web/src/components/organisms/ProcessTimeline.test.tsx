// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProcessTimeline } from './ProcessTimeline';
import { ProcessTimelinePayload } from '@/types/generative-payloads';

const mockPayload: ProcessTimelinePayload = {
  title: 'Proceso de Despacho Aduanero',
  subtitle: 'Estado actual del flujo de trabajo',
  steps: [
    {
      id: 'step-1',
      label: 'Recepción de documentos',
      status: 'completed',
      timestamp: '2024-11-14 10:00',
      metadata: { description: 'Documentos recibidos y validados', details: 'Factura, Conocimiento, Lista de empaque' },
    },
    {
      id: 'step-2',
      label: 'Revisión arancelaria',
      status: 'active',
      timestamp: '2024-11-15 09:00',
      metadata: { description: 'Clasificación HS en curso', details: 'Verificando partida arancelaria 8471.30.00.00' },
    },
    {
      id: 'step-3',
      label: 'Pago de aranceles',
      status: 'pending',
      timestamp: undefined,
    },
    {
      id: 'step-4',
      label: 'Liberación de carga',
      status: 'failed',
      timestamp: undefined,
      metadata: { description: 'Pendiente de pago', details: 'Requiere pago previo de aranceles' },
    },
  ],
};

describe('ProcessTimeline', () => {
  it('renders with payload data', () => {
    render(<ProcessTimeline payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Proceso de Despacho Aduanero')).toBeInTheDocument();
    expect(screen.getByText('Estado actual del flujo de trabajo')).toBeInTheDocument();
  });

  it('displays all timeline steps with labels', () => {
    render(<ProcessTimeline payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Recepción de documentos')).toBeInTheDocument();
    expect(screen.getByText('Revisión arancelaria')).toBeInTheDocument();
    expect(screen.getAllByText('Pago de aranceles')).toHaveLength(2);
    expect(screen.getByText('Liberación de carga')).toBeInTheDocument();
  });

  it('displays status badges for each step', () => {
    render(<ProcessTimeline payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getAllByText('pending')).toHaveLength(1);
    expect(screen.getByText('failed')).toBeInTheDocument();
  });

  it('displays step metadata details and timestamps', () => {
    render(<ProcessTimeline payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Documentos recibidos y validados')).toBeInTheDocument();
    expect(screen.getByText('2024-11-14 10:00')).toBeInTheDocument();
    expect(screen.getByText('Verificando partida arancelaria 8471.30.00.00')).toBeInTheDocument();
    expect(screen.getByText('2024-11-15 09:00')).toBeInTheDocument();
    expect(screen.getByText('Pendiente de pago')).toBeInTheDocument();
    expect(screen.getByText('Requiere pago previo de aranceles')).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading=true', () => {
    render(<ProcessTimeline payload={mockPayload} isLoading={true} />);
    expect(screen.queryByText('Proceso de Despacho Aduanero')).not.toBeInTheDocument();
    expect(screen.queryByText('Recepción de documentos')).not.toBeInTheDocument();
  });
});
