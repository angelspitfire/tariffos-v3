// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArtifactsDrawer } from './ArtifactsDrawer';
import { type A2UIArtifact } from '@/types/domain';

const mockArtifacts: A2UIArtifact[] = [
  {
    id: 'art-1',
    type: 'batch-manifest',
    title: 'Manifest Shanghai',
    subtitle: '3 items · HS 8471.30',
    badge: 'Batch',
    version: 1,
    timestamp: 'Hoy',
    data: {} as A2UIArtifact['data'],
  },
  {
    id: 'art-2',
    type: 'tax-breakdown',
    title: 'Tax Breakdown',
    subtitle: '$12,450 USD',
    badge: 'Taxes',
    version: 2,
    timestamp: 'Ayer',
    data: {} as A2UIArtifact['data'],
  },
  {
    id: 'art-3',
    type: 'discrepancy-audit',
    title: 'Discrepancy Audit',
    subtitle: '2 mismatches',
    badge: 'Audit',
    version: 1,
    timestamp: '12 Nov',
    data: {} as A2UIArtifact['data'],
  },
];

const renderDrawer = (props?: Partial<Parameters<typeof ArtifactsDrawer>[0]>) => {
  return render(
    <ArtifactsDrawer
      isOpen={true}
      artifacts={mockArtifacts}
      activeArtifactId={null}
      onClose={vi.fn()}
      onSelectArtifact={vi.fn()}
      {...props}
    />
  );
};

describe('ArtifactsDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders artifact list with correct data', () => {
    renderDrawer();
    expect(screen.getByLabelText('Gaveta de Documentos Aduaneros')).toBeInTheDocument();
    expect(screen.getByText('Manifest Shanghai')).toBeInTheDocument();
    expect(screen.getByText('Tax Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Discrepancy Audit')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderDrawer({ isOpen: false });
    expect(screen.queryByLabelText('Gaveta de Documentos Aduaneros')).not.toBeInTheDocument();
  });

  it('filters artifacts by search query', () => {
    renderDrawer();
    const searchInput = screen.getByPlaceholderText('Filtrar por partida, impuesto o reporte...');
    fireEvent.change(searchInput, { target: { value: 'Tax' } });
    expect(screen.getByText('Tax Breakdown')).toBeInTheDocument();
    expect(screen.queryByText('Manifest Shanghai')).not.toBeInTheDocument();
    expect(screen.queryByText('Discrepancy Audit')).not.toBeInTheDocument();
  });

  it('highlights the active artifact', () => {
    renderDrawer({ activeArtifactId: 'art-2' });
    const container = screen.getByText('Tax Breakdown').closest('div[style]');
    expect(container?.getAttribute('style')).toContain('var(--surface-active)');
    expect(container?.getAttribute('style')).toContain('rgb(129, 140, 248)');
  });

  it('does not highlight non-active artifacts', () => {
    renderDrawer({ activeArtifactId: 'art-1' });
    const container = screen.getByText('Tax Breakdown').closest('div[style]');
    expect(container?.getAttribute('style')).not.toContain('var(--surface-active)');
  });

  it('calls onSelectArtifact and onClose when an artifact is clicked', () => {
    const onSelectArtifact = vi.fn();
    const onClose = vi.fn();
    renderDrawer({ onSelectArtifact, onClose });
    fireEvent.click(screen.getByText('Manifest Shanghai'));
    expect(onSelectArtifact).toHaveBeenCalledWith('art-1');
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    renderDrawer({ onClose });
    fireEvent.click(screen.getByLabelText('Cerrar gaveta'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows empty state when no artifacts match the filter', () => {
    renderDrawer();
    const searchInput = screen.getByPlaceholderText('Filtrar por partida, impuesto o reporte...');
    fireEvent.change(searchInput, { target: { value: 'zzznothing' } });
    expect(screen.getByText('No se encontraron documentos con ese criterio.')).toBeInTheDocument();
    expect(screen.queryByText('Manifest Shanghai')).not.toBeInTheDocument();
    expect(screen.queryByText('Tax Breakdown')).not.toBeInTheDocument();
    expect(screen.queryByText('Discrepancy Audit')).not.toBeInTheDocument();
  });

  it('switches to Archivos tab and displays conversation files', () => {
    const handleAnalyze = vi.fn();
    const handleClose = vi.fn();
    const mockFiles = [
      {
        id: 'f-1',
        name: 'Factura_Comercial_INV-9981.pdf',
        type: 'invoice',
        typeLabel: 'Factura Comercial',
        size: '245 KB',
        uploadedAt: '10:15 AM',
      },
    ];

    renderDrawer({
      files: mockFiles,
      onAnalyzeFile: handleAnalyze,
      onClose: handleClose,
    });

    const archivosTabBtn = screen.getByText('Archivos');
    fireEvent.click(archivosTabBtn);

    expect(screen.getByText('Factura_Comercial_INV-9981.pdf')).toBeInTheDocument();
    expect(screen.getByText('Factura Comercial')).toBeInTheDocument();

    const analyzeBtn = screen.getByRole('button', { name: /analizar/i });
    fireEvent.click(analyzeBtn);

    expect(handleAnalyze).toHaveBeenCalledWith('Factura_Comercial_INV-9981.pdf');
    expect(handleClose).toHaveBeenCalled();
  });

  it('switches to Bitácora tab and displays audit log entries', () => {
    const mockAudit = [
      {
        id: 'aud-1',
        timestamp: '10:30',
        actor: 'broker',
        action: 'Modificación de arancel',
        details: 'Cambio de 10% a 5%',
      },
    ];

    renderDrawer({ auditEntries: mockAudit });

    const bitacoraTabBtn = screen.getByText('Bitácora');
    fireEvent.click(bitacoraTabBtn);

    expect(screen.getByText('Modificación de arancel')).toBeInTheDocument();
    expect(screen.getByText('Cambio de 10% a 5%')).toBeInTheDocument();
  });
});
