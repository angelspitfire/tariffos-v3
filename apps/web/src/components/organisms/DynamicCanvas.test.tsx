// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DynamicCanvas } from './DynamicCanvas';
import { type A2UIArtifact } from '@/types/domain';

vi.mock('./ManifestGrid', () => ({
  ManifestGrid: vi.fn(() => <div data-testid="mock-manifest-grid">ManifestGrid</div>),
}));
vi.mock('./TaxBreakdownCard', () => ({
  TaxBreakdownCard: vi.fn(() => <div data-testid="mock-tax-breakdown-card">TaxBreakdownCard</div>),
}));
vi.mock('./DiscrepancyInspector', () => ({
  DiscrepancyInspector: vi.fn(() => <div data-testid="mock-discrepancy-inspector">DiscrepancyInspector</div>),
}));
vi.mock('./FichaInspector', () => ({
  FichaInspector: vi.fn(() => <div data-testid="mock-ficha-inspector">FichaInspector</div>),
}));
vi.mock('./DisambiguationResolver', () => ({
  DisambiguationResolver: vi.fn(() => <div data-testid="mock-disambiguation-resolver">DisambiguationResolver</div>),
}));
vi.mock('./PermitsComplianceMatrix', () => ({
  PermitsComplianceMatrix: vi.fn(() => <div data-testid="mock-permits-compliance-matrix">PermitsComplianceMatrix</div>),
}));
vi.mock('./ExonerationSimulator', () => ({
  ExonerationSimulator: vi.fn(() => <div data-testid="mock-exoneration-simulator">ExonerationSimulator</div>),
}));
vi.mock('./CustomsDossierInspector', () => ({
  CustomsDossierInspector: vi.fn(() => <div data-testid="mock-customs-dossier-inspector">CustomsDossierInspector</div>),
}));

const makeArtifact = (overrides: Partial<A2UIArtifact> = {}): A2UIArtifact => ({
  id: 'art-1',
  type: 'single-item',
  title: 'Test Artifact',
  subtitle: 'Subtitle',
  badge: 'Badge',
  version: 1,
  timestamp: 'Now',
  data: {} as A2UIArtifact['data'],
  ...overrides,
});

const mockArtifacts: A2UIArtifact[] = [
  makeArtifact({ id: 'art-1', type: 'single-item', badge: 'Item 1' }),
  makeArtifact({ id: 'art-2', type: 'batch-manifest', badge: 'Manifest' }),
  makeArtifact({ id: 'art-3', type: 'tax-breakdown', badge: 'Taxes' }),
  makeArtifact({ id: 'art-4', type: 'discrepancy-audit', badge: 'Discrepancy' }),
  makeArtifact({ id: 'art-5', type: 'disambiguation', badge: 'Disambiguation' }),
  makeArtifact({ id: 'art-6', type: 'permits-matrix', badge: 'Permits' }),
  makeArtifact({ id: 'art-7', type: 'exoneration-simulator', badge: 'Exoneration' }),
  makeArtifact({ id: 'art-8', type: 'customs-dossier', badge: 'Dossier' }),
];

const defaultProps = {
  activeArtifact: null,
  artifacts: mockArtifacts,
  openTabIds: [],
  onSelectArtifact: vi.fn(),
  onCloseTab: vi.fn(),
  onCloseCanvas: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DynamicCanvas', () => {
  it('renders empty state when no active artifact', () => {
    render(<DynamicCanvas {...defaultProps} />);
    expect(screen.getByText('Mesa de Aforo Lista para Clasificación')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una consulta o abre un documento guardado en la gaveta.')).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('renders single-item artifact', () => {
    const props = { ...defaultProps, activeArtifact: mockArtifacts[0], openTabIds: ['art-1'] };
    render(<DynamicCanvas {...props} />);
    expect(screen.getByTestId('mock-ficha-inspector')).toBeInTheDocument();
  });

  it('renders batch-manifest artifact', () => {
    const props = { ...defaultProps, activeArtifact: mockArtifacts[1], openTabIds: ['art-2'] };
    render(<DynamicCanvas {...props} />);
    expect(screen.getByTestId('mock-manifest-grid')).toBeInTheDocument();
  });

  it('renders tax-breakdown artifact', () => {
    const props = { ...defaultProps, activeArtifact: mockArtifacts[2], openTabIds: ['art-3'] };
    render(<DynamicCanvas {...props} />);
    expect(screen.getByTestId('mock-tax-breakdown-card')).toBeInTheDocument();
  });

  it('renders discrepancy-audit artifact', () => {
    const props = { ...defaultProps, activeArtifact: mockArtifacts[3], openTabIds: ['art-4'] };
    render(<DynamicCanvas {...props} />);
    expect(screen.getByTestId('mock-discrepancy-inspector')).toBeInTheDocument();
  });

  it('renders disambiguation artifact', () => {
    const props = { ...defaultProps, activeArtifact: mockArtifacts[4], openTabIds: ['art-5'] };
    render(<DynamicCanvas {...props} />);
    expect(screen.getByTestId('mock-disambiguation-resolver')).toBeInTheDocument();
  });

  it('renders permits-matrix artifact', () => {
    const props = { ...defaultProps, activeArtifact: mockArtifacts[5], openTabIds: ['art-6'] };
    render(<DynamicCanvas {...props} />);
    expect(screen.getByTestId('mock-permits-compliance-matrix')).toBeInTheDocument();
  });

  it('renders exoneration-simulator artifact', () => {
    const props = { ...defaultProps, activeArtifact: mockArtifacts[6], openTabIds: ['art-7'] };
    render(<DynamicCanvas {...props} />);
    expect(screen.getByTestId('mock-exoneration-simulator')).toBeInTheDocument();
  });

  it('renders customs-dossier artifact', () => {
    const props = { ...defaultProps, activeArtifact: mockArtifacts[7], openTabIds: ['art-8'] };
    render(<DynamicCanvas {...props} />);
    expect(screen.getByTestId('mock-customs-dossier-inspector')).toBeInTheDocument();
  });

  it('renders tab bar with open artifacts', () => {
    const props = { ...defaultProps, openTabIds: ['art-1', 'art-2'], activeArtifact: mockArtifacts[0] };
    render(<DynamicCanvas {...props} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Manifest')).toBeInTheDocument();
  });

  it('calls onSelectArtifact when selecting a tab', () => {
    const props = { ...defaultProps, openTabIds: ['art-1', 'art-2'], activeArtifact: mockArtifacts[0] };
    render(<DynamicCanvas {...props} />);
    const tab = screen.getByText('Manifest');
    fireEvent.click(tab.closest('[role="tab"]')!);
    expect(defaultProps.onSelectArtifact).toHaveBeenCalledWith('art-2');
  });

  it('calls onCloseTab when closing a tab', () => {
    const props = { ...defaultProps, openTabIds: ['art-1', 'art-2'], activeArtifact: mockArtifacts[0] };
    render(<DynamicCanvas {...props} />);
    const closeButton = screen.getByLabelText('Cerrar pestaña Manifest');
    fireEvent.click(closeButton);
    expect(defaultProps.onCloseTab).toHaveBeenCalledWith('art-2');
  });

  it('toggles fullscreen on fullscreen button click', () => {
    const props = { ...defaultProps, openTabIds: ['art-1'], activeArtifact: mockArtifacts[0] };
    render(<DynamicCanvas {...props} />);
    const fullscreenButton = screen.getByLabelText('Pantalla completa');
    const canvas = screen.getByRole('region', { name: 'Mesa de Aforo Aduanero' });
    fireEvent.click(fullscreenButton);
    expect(canvas).toHaveStyle({ position: 'fixed', zIndex: 50 });
  });

  it('renders close canvas button when onCloseCanvas is provided', () => {
    const props = { ...defaultProps, onCloseCanvas: vi.fn() };
    render(<DynamicCanvas {...props} />);
    expect(screen.getByLabelText('Cerrar lienzo')).toBeInTheDocument();
  });

  it('calls onCloseCanvas when close canvas button is clicked', () => {
    const handleCloseCanvas = vi.fn();
    const props = { ...defaultProps, onCloseCanvas: handleCloseCanvas };
    render(<DynamicCanvas {...props} />);
    fireEvent.click(screen.getByLabelText('Cerrar lienzo'));
    expect(handleCloseCanvas).toHaveBeenCalled();
  });

  it('renders quick start buttons in empty state', () => {
    const handleBatch = vi.fn();
    const handleSingle = vi.fn();
    const props = {
      ...defaultProps,
      onQuickStartBatch: handleBatch,
      onQuickStartSingle: handleSingle,
    };
    render(<DynamicCanvas {...props} />);
    const batchButton = screen.getByText('Ver Lote (Manifiesto)');
    const singleButton = screen.getByText('Clasificar Ítem Individual');
    fireEvent.click(batchButton);
    fireEvent.click(singleButton);
    expect(handleBatch).toHaveBeenCalled();
    expect(handleSingle).toHaveBeenCalled();
  });
});
