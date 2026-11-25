import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomsFilesList } from './CustomsFilesList';
import type { ConversationFile } from '@/types/files';

describe('CustomsFilesList', () => {
  const mockFiles: ConversationFile[] = [
    {
      id: 'f-1',
      name: 'Factura_Comercial_INV-9981.pdf',
      type: 'invoice',
      typeLabel: 'Factura Comercial',
      size: '245 KB',
      uploadedAt: '10:15 AM',
    },
    {
      id: 'f-2',
      name: 'Packing_List_Shenzhen.xlsx',
      type: 'packing_list',
      typeLabel: 'Lista de Empaque',
      size: '112 KB',
      uploadedAt: '10:16 AM',
    },
  ];

  it('renders empty state when there are no files', () => {
    const handleUpload = vi.fn();
    render(<CustomsFilesList files={[]} onUpload={handleUpload} />);
    expect(screen.getByText('No hay documentos adjuntos aún.')).toBeInTheDocument();
    const btn = screen.getByText('Adjuntar documento');
    fireEvent.click(btn);
    expect(handleUpload).toHaveBeenCalled();
  });

  it('renders files with name, type and size', () => {
    render(<CustomsFilesList files={mockFiles} />);
    expect(screen.getByText('Factura_Comercial_INV-9981.pdf')).toBeInTheDocument();
    expect(screen.getByText('Factura Comercial')).toBeInTheDocument();
    expect(screen.getByText('245 KB')).toBeInTheDocument();
    expect(screen.getByText('Packing_List_Shenzhen.xlsx')).toBeInTheDocument();
  });

  it('calls onAnalyze when analyze button is clicked', () => {
    const handleAnalyze = vi.fn();
    render(<CustomsFilesList files={mockFiles} onAnalyze={handleAnalyze} />);
    const analyzeButtons = screen.getAllByRole('button', { name: /analizar/i });
    fireEvent.click(analyzeButtons[0]);
    expect(handleAnalyze).toHaveBeenCalledWith('Factura_Comercial_INV-9981.pdf');
  });
});
