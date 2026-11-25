// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DisambiguationResolver } from './DisambiguationResolver';
import { DisambiguationPayload } from '@/types/domain';

const mockPayload: DisambiguationPayload = {
  filingId: 'FIL-001',
  lineItemId: 'item-1',
  itemNumber: 1,
  productDescription: 'Laptops portátiles',
  cifValue: 50000,
  deltaUsd: 232.5,
  recommendedHsCode: '8471.30.00.00',
  candidates: [
    {
      hsCode: '8471.30.00.00',
      description: 'Laptops portátiles',
      dutyRate: 5,
      vatRate: 15,
      fodinfaRate: 1,
      totalDutyUsd: 2750,
      confidence: 0.95,
      legalBasis: 'RGI 1 y 6',
      rationale: 'Coincidencia exacta de descripción',
      pros: ['Clasificación precisa', 'Tarifa reducida'],
      cons: ['Requiere certificado de origen'],
    },
    {
      hsCode: '8471.41.00.00',
      description: 'Equipos de procesamiento de datos',
      dutyRate: 10,
      vatRate: 15,
      fodinfaRate: 1,
      totalDutyUsd: 5500,
      confidence: 0.62,
      legalBasis: 'RGI 3',
      rationale: 'Descripción parcialmente coincidente',
      pros: ['Amplia aplicabilidad'],
      cons: ['Arancel más alto'],
    },
  ],
};

describe('DisambiguationResolver', () => {
  it('renders with payload data', () => {
    render(<DisambiguationResolver payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Arbitraje Arancelario OMA / SENIAT')).toBeInTheDocument();
    expect(screen.getByText('Línea #1 · Laptops portátiles')).toBeInTheDocument();
    expect(screen.getByText('$232.50 USD')).toBeInTheDocument();
  });

  it('displays candidate cards with key data points', () => {
    render(<DisambiguationResolver payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('8471.30.00.00')).toBeInTheDocument();
    expect(screen.getByText('8471.41.00.00')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('62%')).toBeInTheDocument();
    expect(screen.getByText('$2,750')).toBeInTheDocument();
    expect(screen.getByText('$5,500')).toBeInTheDocument();
  });

  it('displays legal basis and rationale for each candidate', () => {
    render(<DisambiguationResolver payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('RGI 1 y 6')).toBeInTheDocument();
    expect(screen.getByText('Coincidencia exacta de descripción')).toBeInTheDocument();
    expect(screen.getByText('RGI 3')).toBeInTheDocument();
    expect(screen.getByText('Descripción parcialmente coincidente')).toBeInTheDocument();
  });

  it('displays pros and cons for each candidate', () => {
    render(<DisambiguationResolver payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Clasificación precisa')).toBeInTheDocument();
    expect(screen.getByText('Requiere certificado de origen')).toBeInTheDocument();
    expect(screen.getByText('Amplia aplicabilidad')).toBeInTheDocument();
    expect(screen.getByText('Arancel más alto')).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading=true', () => {
    render(<DisambiguationResolver payload={mockPayload} isLoading={true} />);
    expect(screen.queryByText('Arbitraje Arancelario OMA / SENIAT')).not.toBeInTheDocument();
    expect(screen.queryByText('8471.30.00.00')).not.toBeInTheDocument();
  });
});
