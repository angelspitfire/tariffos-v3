// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkstationLayout } from './WorkstationLayout';
import { I18nProvider } from '@/lib/i18n';
import { type A2UIArtifact } from '@/types/domain';

const renderWithI18n = (ui: React.ReactNode) => render(<I18nProvider defaultLanguage="es">{ui}</I18nProvider>);

const mockArtifacts: A2UIArtifact[] = [
  {
    id: 'art-1',
    type: 'batch-manifest',
    title: 'Test Manifest',
    subtitle: '3 items',
    badge: 'Batch',
    version: 1,
    timestamp: 'Now',
    data: { filingId: 'TR-001', mode: 'batch', items: [], totalCif: 0, totalDuties: 0 },
  },
  {
    id: 'art-2',
    type: 'tax-breakdown',
    title: 'Tax Summary',
    subtitle: '$10,000 USD',
    badge: 'Taxes',
    version: 1,
    timestamp: 'Now',
    data: {
      id: 'LIQ-001',
      vendor: 'Test',
      invoiceId: 'INV-001',
      currency: 'USD',
      totalAmount: 10000,
      dueDate: '2024-11-30',
      breakdown: [],
      status: 'pending',
    },
  },
];

const mockCanvas = <div data-testid="canvas">Canvas Content</div>;
const mockChildren = <div data-testid="children">Children Content</div>;

describe('WorkstationLayout', () => {
  it('renders canvas when isCanvasOpen=true', () => {
    renderWithI18n(
      <WorkstationLayout
        isCanvasOpen={true}
        onToggleCanvas={vi.fn()}
        isDrawerOpen={false}
        onToggleDrawer={vi.fn()}
        artifacts={[]}
        activeArtifactId={null}
        onSelectArtifact={vi.fn()}
        canvas={mockCanvas}
        chat={mockChildren}
      />
    );
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('renders ArtifactsDrawer when isDrawerOpen=true', () => {
    renderWithI18n(
      <WorkstationLayout
        isCanvasOpen={false}
        onToggleCanvas={vi.fn()}
        isDrawerOpen={true}
        onToggleDrawer={vi.fn()}
        artifacts={mockArtifacts}
        activeArtifactId="art-1"
        onSelectArtifact={vi.fn()}
        canvas={mockCanvas}
        chat={mockChildren}
      />
    );
    expect(screen.getByLabelText('Gaveta de Documentos Aduaneros')).toBeInTheDocument();
    expect(screen.getByText('Test Manifest')).toBeInTheDocument();
    expect(screen.getByText('Tax Summary')).toBeInTheDocument();
  });

  it('does not render ArtifactsDrawer when isDrawerOpen=false', () => {
    renderWithI18n(
      <WorkstationLayout
        isCanvasOpen={false}
        onToggleCanvas={vi.fn()}
        isDrawerOpen={false}
        onToggleDrawer={vi.fn()}
        artifacts={mockArtifacts}
        activeArtifactId={null}
        onSelectArtifact={vi.fn()}
        canvas={mockCanvas}
        chat={mockChildren}
      />
    );
    expect(screen.queryByLabelText('Gaveta de Documentos Aduaneros')).not.toBeInTheDocument();
  });

  it('calls onSelectArtifact when artifact is clicked', () => {
    const handleSelect = vi.fn();
    renderWithI18n(
      <WorkstationLayout
        isCanvasOpen={false}
        onToggleCanvas={vi.fn()}
        isDrawerOpen={true}
        onToggleDrawer={vi.fn()}
        artifacts={mockArtifacts}
        activeArtifactId="art-1"
        onSelectArtifact={handleSelect}
        canvas={mockCanvas}
        chat={mockChildren}
      />
    );
    fireEvent.click(screen.getByText('Test Manifest'));
    expect(handleSelect).toHaveBeenCalledWith('art-1');
  });

  it('renders children correctly', () => {
    renderWithI18n(
      <WorkstationLayout
        isCanvasOpen={false}
        onToggleCanvas={vi.fn()}
        isDrawerOpen={false}
        onToggleDrawer={vi.fn()}
        artifacts={[]}
        activeArtifactId={null}
        onSelectArtifact={vi.fn()}
        canvas={mockCanvas}
        chat={mockChildren}
      />
    );
    expect(screen.getByTestId('children')).toBeInTheDocument();
  });

  it('triggers onOpenCommandPalette on Cmd+K', () => {
    const handleOpenPalette = vi.fn();
    renderWithI18n(
      <WorkstationLayout
        isCanvasOpen={false}
        onToggleCanvas={vi.fn()}
        isDrawerOpen={false}
        onToggleDrawer={vi.fn()}
        artifacts={[]}
        activeArtifactId={null}
        onSelectArtifact={vi.fn()}
        onOpenCommandPalette={handleOpenPalette}
        canvas={mockCanvas}
        chat={mockChildren}
      />
    );
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(handleOpenPalette).toHaveBeenCalled();
  });

  it('toggles drawer when Expediente header button is clicked', () => {
    const handleToggleDrawer = vi.fn();
    renderWithI18n(
      <WorkstationLayout
        isCanvasOpen={false}
        onToggleCanvas={vi.fn()}
        isDrawerOpen={false}
        onToggleDrawer={handleToggleDrawer}
        artifacts={mockArtifacts}
        activeArtifactId={null}
        onSelectArtifact={vi.fn()}
        canvas={mockCanvas}
        chat={mockChildren}
      />
    );
    const expedienteBtn = screen.getByLabelText('Ver Expediente');
    fireEvent.click(expedienteBtn);
    expect(handleToggleDrawer).toHaveBeenCalledWith(true);
  });

  it('toggles drawer closed when Expediente header button clicked and drawer is already open', () => {
    const handleToggleDrawer = vi.fn();
    renderWithI18n(
      <WorkstationLayout
        isCanvasOpen={false}
        onToggleCanvas={vi.fn()}
        isDrawerOpen={true}
        onToggleDrawer={handleToggleDrawer}
        artifacts={mockArtifacts}
        activeArtifactId="art-1"
        onSelectArtifact={vi.fn()}
        canvas={mockCanvas}
        chat={mockChildren}
      />
    );
    const expedienteBtn = screen.getByLabelText('Ver Expediente');
    fireEvent.click(expedienteBtn);
    expect(handleToggleDrawer).toHaveBeenCalledWith(false);
  });

  it('closes drawer via ArtifactsDrawer close button', () => {
    const handleCloseDrawer = vi.fn();
    renderWithI18n(
      <WorkstationLayout
        isCanvasOpen={false}
        onToggleCanvas={vi.fn()}
        isDrawerOpen={true}
        onToggleDrawer={handleCloseDrawer}
        artifacts={mockArtifacts}
        activeArtifactId="art-1"
        onSelectArtifact={vi.fn()}
        canvas={mockCanvas}
        chat={mockChildren}
      />
    );
    // ArtifactsDrawer renders when isDrawerOpen=true
    expect(screen.getByLabelText('Gaveta de Documentos Aduaneros')).toBeInTheDocument();
    // Close button should call handleCloseDrawer which calls onToggleDrawer(false)
    const closeBtn = screen.getByRole('button', { name: /cerrar/i });
    fireEvent.click(closeBtn);
    expect(handleCloseDrawer).toHaveBeenCalledWith(false);
  });

  it('maintains sidebar expanded state independent from canvas', () => {
    const handleToggleCanvas = vi.fn();
    const handleToggleSidebar = vi.fn();
    renderWithI18n(
      <WorkstationLayout
        isCanvasOpen={false}
        onToggleCanvas={handleToggleCanvas}
        isDrawerOpen={false}
        onToggleDrawer={vi.fn()}
        isSidebarExpanded={true}
        onToggleSidebar={handleToggleSidebar}
        artifacts={[]}
        activeArtifactId={null}
        onSelectArtifact={vi.fn()}
        canvas={mockCanvas}
        chat={mockChildren}
      />
    );
    // Initially sidebar is expanded
    expect(handleToggleSidebar).not.toHaveBeenCalled();
    // Toggling canvas open should NOT affect sidebar
    renderWithI18n(
      <WorkstationLayout
        isCanvasOpen={true}
        onToggleCanvas={handleToggleCanvas}
        isDrawerOpen={false}
        onToggleDrawer={vi.fn()}
        isSidebarExpanded={true}
        onToggleSidebar={handleToggleSidebar}
        artifacts={[]}
        activeArtifactId={null}
        onSelectArtifact={vi.fn()}
        canvas={mockCanvas}
        chat={mockChildren}
      />
    );
    // Sidebar should remain expanded
    expect(handleToggleSidebar).not.toHaveBeenCalled();
    // Toggling sidebar should not affect canvas
    renderWithI18n(
      <WorkstationLayout
        isCanvasOpen={true}
        onToggleCanvas={handleToggleCanvas}
        isDrawerOpen={false}
        onToggleDrawer={vi.fn()}
        isSidebarExpanded={false}
        onToggleSidebar={handleToggleSidebar}
        artifacts={[]}
        activeArtifactId={null}
        onSelectArtifact={vi.fn()}
        canvas={mockCanvas}
        chat={mockChildren}
      />
    );
    // Canvas should still be open
    expect(handleToggleCanvas).not.toHaveBeenCalledWith(true);
  });
});
