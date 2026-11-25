// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentPreviewer } from './DocumentPreviewer';
import { DocumentPreviewerPayload } from '@/types/generative-payloads';

const mockPayload: DocumentPreviewerPayload = {
  src: '/documents/dossier-2024-001.pdf',
  fileName: 'Dossier_Clasificacion_2024.pdf',
  title: 'Dossier de Clasificación Arancelaria',
  subtitle: 'Expediente oficial DOSSIER-2024-001 · 1 página',
};

describe('DocumentPreviewer', () => {
  it('renders with payload data', () => {
    render(<DocumentPreviewer payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Dossier de Clasificación Arancelaria')).toBeInTheDocument();
    expect(screen.getByText('Expediente oficial DOSSIER-2024-001 · 1 página')).toBeInTheDocument();
    expect(screen.getByText('Dossier_Clasificacion_2024.pdf')).toBeInTheDocument();
  });

  it('displays document viewer with page indicator', () => {
    render(<DocumentPreviewer payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument();
  });

  it('displays search input', () => {
    render(<DocumentPreviewer payload={mockPayload} isLoading={false} />);
    const searchInput = screen.getByPlaceholderText('Buscar en documento...');
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'factura' } });
    expect(searchInput).toHaveValue('factura');
  });

  it('displays zoom controls', () => {
    render(<DocumentPreviewer payload={mockPayload} isLoading={false} />);
    expect(screen.getByRole('button', { name: /Rotar izquierda/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Zoom out/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Zoom in/ })).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('displays page navigation and download button', () => {
    render(<DocumentPreviewer payload={mockPayload} isLoading={false} />);
    expect(screen.getByRole('button', { name: /Página anterior/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Página siguiente/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Descargar/ })).toBeInTheDocument();
  });

  it('disables previous page button on first page', () => {
    render(<DocumentPreviewer payload={mockPayload} isLoading={false} />);
    const prevButton = screen.getByRole('button', { name: /Página anterior/ });
    expect(prevButton).toBeDisabled();
  });

  it('renders loading skeleton when isLoading=true', () => {
    render(<DocumentPreviewer payload={mockPayload} isLoading={true} />);
    expect(screen.queryByText('Dossier de Clasificación Arancelaria')).not.toBeInTheDocument();
    expect(screen.queryByText('Página 1 de 1')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Buscar en documento...')).not.toBeInTheDocument();
  });
});
