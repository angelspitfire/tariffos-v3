// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomsDossierInspector } from './CustomsDossierInspector';
import { CustomsDossierPayload } from '@/types/dossier';

const mockPayload: CustomsDossierPayload = {
  filingId: 'FIL-001',
  dossierNumber: 'DOSSIER-2024-001',
  issueDate: '2024-11-15',
  customsDistrict: 'Maracaibo',
  importerName: 'Importadora del Valle C.A.',
  importerRuc: 'J-12345678-9',
  customsBroker: 'Agencia Aduanera Andes',
  regimeApplied: 'Régimen General',
  totalCifUsd: 75000,
  totalDutiesUsd: 9500,
  totalSavingsUsd: 1200,
  verificationStatus: 'ready_to_transmit',
  conclusiveOpinion: 'Clasificación procedente bajo RGI 1 y 6.',
  items: [
    {
      itemNumber: 1,
      hsCode: '8471.30.00.00',
      description: 'Laptops portátiles',
      quantity: 10,
      cifValue: 50000,
      dutyRate: 5,
      confidence: 0.95,
    },
    {
      itemNumber: 2,
      hsCode: '8528.52.00.00',
      description: 'Monitores LED',
      quantity: 5,
      cifValue: 25000,
      dutyRate: 10,
      confidence: 0.72,
    },
  ],
  legalClauses: [
    {
      rule: 'RGI 1',
      title: 'Interpretación de partidas',
      text: 'Los títulos de secciones, partidas y subpartidas se interpretan conforme a las notas de sección y de capítulo.',
    },
    {
      rule: 'RGI 6',
      title: 'Clasificación de mercancías',
      text: 'Para los efectos legales, la clasificación de las mercancías en las subpartidas se determinará según los textos de dichas subpartidas.',
    },
  ],
  permitsCount: 3,
  requiredPreClearanceDocs: ['Factura comercial', 'Lista de empaque', 'Conocimiento de embarque'],
};

describe('CustomsDossierInspector', () => {
  it('renders with payload data', () => {
    render(<CustomsDossierInspector payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Expediente Oficial de Clasificación Arancelaria')).toBeInTheDocument();
    expect(screen.getByText('DOSSIER-2024-001 · Maracaibo')).toBeInTheDocument();
    expect(screen.getByText('Listo para VUCE')).toBeInTheDocument();
  });

  it('displays importer and customs broker information', () => {
    render(<CustomsDossierInspector payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Importadora del Valle C.A.')).toBeInTheDocument();
    expect(screen.getByText('J-12345678-9')).toBeInTheDocument();
    expect(screen.getByText('Agencia Aduanera Andes')).toBeInTheDocument();
  });

  it('displays dossìer items table with key data points', () => {
    render(<CustomsDossierInspector payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Partidas Dictaminadas')).toBeInTheDocument();
    expect(screen.getByText('8471.30.00.00')).toBeInTheDocument();
    expect(screen.getByText('8528.52.00.00')).toBeInTheDocument();
    expect(screen.getByText('Laptops portátiles')).toBeInTheDocument();
    expect(screen.getByText('Monitores LED')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('$25,000')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
  });

  it('displays legal clauses', () => {
    render(<CustomsDossierInspector payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Fundamentación Jurídica')).toBeInTheDocument();
    expect(screen.getByText(text => text.includes('RGI 1'))).toBeInTheDocument();
    expect(screen.getByText(text => text.includes('Interpretación de partidas'))).toBeInTheDocument();
    expect(screen.getByText(text => text.includes('RGI 6'))).toBeInTheDocument();
    expect(screen.getByText(text => text.includes('Clasificación de mercancías'))).toBeInTheDocument();
  });

  it('displays required pre-clearance documents', () => {
    render(<CustomsDossierInspector payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Documentación Requerida (VUCE)')).toBeInTheDocument();
    expect(screen.getByText('Factura comercial')).toBeInTheDocument();
    expect(screen.getByText('Lista de empaque')).toBeInTheDocument();
    expect(screen.getByText('Conocimiento de embarque')).toBeInTheDocument();
  });

  it('displays action buttons', () => {
    render(<CustomsDossierInspector payload={mockPayload} isLoading={false} />);
    expect(screen.getByRole('button', { name: /Exportar XML SIDUNEA/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Imprimir expediente oficial/i })).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading=true', () => {
    render(<CustomsDossierInspector payload={mockPayload} isLoading={true} />);
    expect(screen.queryByText('Expediente Oficial de Clasificación Arancelaria')).not.toBeInTheDocument();
    expect(screen.queryByText('DOSSIER-2024-001')).not.toBeInTheDocument();
    expect(screen.queryByText('Importadora del Valle C.A.')).not.toBeInTheDocument();
  });
});
