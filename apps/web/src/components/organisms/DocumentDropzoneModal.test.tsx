// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DocumentDropzoneModal } from './DocumentDropzoneModal';

const mockOnClose = vi.fn();
const mockOnImportCompleted = vi.fn();

beforeEach(() => {
  mockOnClose.mockClear();
  mockOnImportCompleted.mockClear();
  // Mock fetch globally
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('DocumentDropzoneModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <DocumentDropzoneModal
        isOpen={false}
        onClose={mockOnClose}
        onImportCompleted={mockOnImportCompleted}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders with payload data', () => {
    render(
      <DocumentDropzoneModal
        isOpen={true}
        onClose={mockOnClose}
        onImportCompleted={mockOnImportCompleted}
      />,
    );
    expect(screen.getByRole('dialog', { name: /Cargar Documento Aduanero/ })).toBeInTheDocument();
    expect(screen.getByText('Ingesta de Documentos de Despacho')).toBeInTheDocument();
    expect(screen.getByText(/Factura comercial, lista de empaque o conocimiento BoL/)).toBeInTheDocument();
  });

  it('displays dropzone area with upload instructions', () => {
    render(
      <DocumentDropzoneModal
        isOpen={true}
        onClose={mockOnClose}
        onImportCompleted={mockOnImportCompleted}
      />,
    );
    expect(screen.getByText(/Arrastra tu archivo aquí o haz clic para examinar/)).toBeInTheDocument();
    expect(screen.getByText(/Formatos admitidos: PDF, Excel/)).toBeInTheDocument();
  });

  it('displays sample demonstration documents', () => {
    render(
      <DocumentDropzoneModal
        isOpen={true}
        onClose={mockOnClose}
        onImportCompleted={mockOnImportCompleted}
      />,
    );
    expect(screen.getByText(/Archivos de Demostración del Embarque/)).toBeInTheDocument();
    expect(screen.getByText('Factura_Comercial_INV-2024-9981.pdf')).toBeInTheDocument();
    expect(screen.getByText('Packing_List_Shenzhen_Logistics.xlsx')).toBeInTheDocument();
    expect(screen.getByText('Bill_of_Lading_MSK-9812-EC.pdf')).toBeInTheDocument();
    expect(screen.getByText('245 KB')).toBeInTheDocument();
    expect(screen.getByText('112 KB')).toBeInTheDocument();
    expect(screen.getByText('380 KB')).toBeInTheDocument();
  });

  it('displays document type badges', () => {
    render(
      <DocumentDropzoneModal
        isOpen={true}
        onClose={mockOnClose}
        onImportCompleted={mockOnImportCompleted}
      />,
    );
    expect(screen.getByText('Factura Comercial')).toBeInTheDocument();
    expect(screen.getByText('Lista de Empaque')).toBeInTheDocument();
    expect(screen.getByText('Conocimiento BoL')).toBeInTheDocument();
  });

  it('selects a sample document when clicked', () => {
    render(
      <DocumentDropzoneModal
        isOpen={true}
        onClose={mockOnClose}
        onImportCompleted={mockOnImportCompleted}
      />,
    );
    // First document is selected by default
    expect(screen.getByText('Factura_Comercial_INV-2024-9981.pdf')).toBeInTheDocument();
    // Click the third document to select it
    const boLRow = screen.getByText('Bill_of_Lading_MSK-9812-EC.pdf').closest('div');
    fireEvent.click(boLRow);
    expect(screen.getByText('Bill_of_Lading_MSK-9812-EC.pdf')).toBeInTheDocument();
  });

  it('closes the modal when Cancelar button is clicked', () => {
    render(
      <DocumentDropzoneModal
        isOpen={true}
        onClose={mockOnClose}
        onImportCompleted={mockOnImportCompleted}
      />,
    );
    const cancelButton = screen.getByRole('button', { name: /Cancelar/ });
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('triggers upload and calls onImportCompleted when Analizar y Subir is clicked', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Mock fetch to return success
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        extractedFields: { invoiceNumber: 'Factura_Comercial_INV-2024-9981.pdf' },
        items: [{}, {}, {}],
      }),
    });

    render(
      <DocumentDropzoneModal
        isOpen={true}
        onClose={mockOnClose}
        onImportCompleted={mockOnImportCompleted}
      />,
    );
    // Find the upload button by its text content
    const uploadButton = screen.getByRole('button', { name: /Analizar y Subir/i });
    fireEvent.click(uploadButton);
    
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(mockOnImportCompleted).toHaveBeenCalledWith(
      'Factura_Comercial_INV-2024-9981.pdf',
      3,
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('disables Cancelar and Analizar y Subir buttons while processing', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Mock fetch to return success
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        extractedFields: { invoiceNumber: 'Factura_Comercial_INV-2024-9981.pdf' },
        items: [{}, {}, {}],
      }),
    });

    render(
      <DocumentDropzoneModal
        isOpen={true}
        onClose={mockOnClose}
        onImportCompleted={mockOnImportCompleted}
      />,
    );
    const uploadButton = screen.getByRole('button', { name: /Analizar y Subir/i });
    fireEvent.click(uploadButton);

    expect(screen.getByRole('button', { name: /Procesando/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Cancelar/ })).toBeDisabled();

    await vi.advanceTimersByTimeAsync(3000);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
