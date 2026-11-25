// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CanvasTabBar } from './CanvasTabBar';
import { type A2UIArtifact } from '@/types/domain';

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
];

const defaultProps = {
  openArtifacts: mockArtifacts,
  activeArtifactId: 'art-1',
  totalArtifactsCount: 4,
  fullscreen: false,
  onSelectTab: vi.fn(),
  onCloseTab: vi.fn(),
  onToggleDrawer: vi.fn(),
  onToggleFullscreen: vi.fn(),
  onCloseCanvas: vi.fn(),
};

describe('CanvasTabBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tabs for open artifacts', () => {
    render(<CanvasTabBar {...defaultProps} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Manifest')).toBeInTheDocument();
    expect(screen.getByText('Taxes')).toBeInTheDocument();
    expect(screen.getByText('Discrepancy')).toBeInTheDocument();
  });

  it('shows empty state when no artifacts are open', () => {
    render(<CanvasTabBar {...{ ...defaultProps, openArtifacts: [] }} />);
    expect(screen.getByText('Sin pestañas abiertas')).toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('highlights the active tab', () => {
    render(<CanvasTabBar {...defaultProps} />);
    const activeTab = screen.getByText('Item 1').closest('[role="tab"]');
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
    const inactiveTab = screen.getByText('Manifest').closest('[role="tab"]');
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onSelectTab when a tab is clicked', () => {
    render(<CanvasTabBar {...defaultProps} />);
    const tab = screen.getByText('Manifest').closest('[role="tab"]')!;
    fireEvent.click(tab);
    expect(defaultProps.onSelectTab).toHaveBeenCalledWith('art-2');
  });

  it('calls onCloseTab when the close button is clicked', () => {
    render(<CanvasTabBar {...defaultProps} />);
    const closeButton = screen.getByLabelText('Cerrar pestaña Manifest');
    fireEvent.click(closeButton);
    expect(defaultProps.onCloseTab).toHaveBeenCalledWith('art-2');
  });

  it('does not propagate tab selection when closing a tab', () => {
    render(<CanvasTabBar {...defaultProps} />);
    const closeButton = screen.getByLabelText('Cerrar pestaña Manifest');
    fireEvent.click(closeButton);
    expect(defaultProps.onSelectTab).not.toHaveBeenCalled();
    expect(defaultProps.onCloseTab).toHaveBeenCalledWith('art-2');
  });

  it('does not render the drawer toggle button inside canvas tab bar', () => {
    render(<CanvasTabBar {...defaultProps} />);
    expect(screen.queryByTitle('Gaveta de Documentos Aduaneros')).not.toBeInTheDocument();
  });

  it('renders the fullscreen button', () => {
    render(<CanvasTabBar {...defaultProps} />);
    expect(screen.getByLabelText('Pantalla completa')).toBeInTheDocument();
  });

  it('calls onToggleFullscreen when the fullscreen button is clicked', () => {
    render(<CanvasTabBar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Pantalla completa'));
    expect(defaultProps.onToggleFullscreen).toHaveBeenCalled();
  });

  it('renders the close canvas button when onCloseCanvas is provided', () => {
    render(<CanvasTabBar {...defaultProps} />);
    expect(screen.getByLabelText('Cerrar lienzo')).toBeInTheDocument();
  });

  it('calls onCloseCanvas when the close canvas button is clicked', () => {
    render(<CanvasTabBar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Cerrar lienzo'));
    expect(defaultProps.onCloseCanvas).toHaveBeenCalled();
  });

  it('does not render close canvas button when onCloseCanvas is not provided', () => {
    const { onCloseCanvas: _onCloseCanvas, ...props } = defaultProps;
    render(<CanvasTabBar {...props} />);
    expect(screen.queryByLabelText('Cerrar lienzo')).not.toBeInTheDocument();
  });

  it('updates fullscreen aria-label when toggled', () => {
    const { rerender } = render(<CanvasTabBar {...defaultProps} />);
    expect(screen.getByLabelText('Pantalla completa')).toBeInTheDocument();
    rerender(<CanvasTabBar {...{ ...defaultProps, fullscreen: true }} />);
    expect(screen.getByLabelText('Restaurar tamaño')).toBeInTheDocument();
    expect(screen.queryByLabelText('Pantalla completa')).not.toBeInTheDocument();
  });
});
