import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomsCommandPalette, type CommandPaletteAction } from './CustomsCommandPalette';

const mockActions: CommandPaletteAction[] = [
  {
    id: 'filing-1',
    category: 'Trámites',
    title: 'TR-2024-8849-VE',
    subtitle: 'Electrónica Shanghai → La Guaira',
    perform: vi.fn(),
  },
  {
    id: 'view-manifest',
    category: 'Vistas',
    title: 'Ver Manifiesto de Carga',
    perform: vi.fn(),
  },
  {
    id: 'act-audit',
    category: 'Acciones',
    title: 'Auditar Discrepancias Factura vs BoL',
    perform: vi.fn(),
  },
];

describe('CustomsCommandPalette', () => {
  it('renders command palette with search input and actions', () => {
    render(
      <CustomsCommandPalette
        isOpen={true}
        onClose={vi.fn()}
        actions={mockActions}
      />
    );

    expect(screen.getByPlaceholderText(/escribe un comando o busca/i)).toBeInTheDocument();
    expect(screen.getByText('TR-2024-8849-VE')).toBeInTheDocument();
    expect(screen.getByText('Ver Manifiesto de Carga')).toBeInTheDocument();
  });

  it('filters actions by search query', () => {
    render(
      <CustomsCommandPalette
        isOpen={true}
        onClose={vi.fn()}
        actions={mockActions}
      />
    );

    const input = screen.getByPlaceholderText(/escribe un comando o busca/i);
    fireEvent.change(input, { target: { value: 'Discrepancias' } });

    expect(screen.getByText('Auditar Discrepancias Factura vs BoL')).toBeInTheDocument();
    expect(screen.queryByText('TR-2024-8849-VE')).not.toBeInTheDocument();
  });

  it('executes action on click and closes palette', () => {
    const handleClose = vi.fn();
    render(
      <CustomsCommandPalette
        isOpen={true}
        onClose={handleClose}
        actions={mockActions}
      />
    );

    const actionItem = screen.getByText('Ver Manifiesto de Carga');
    fireEvent.click(actionItem);

    expect(mockActions[1].perform).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key press', () => {
    const handleClose = vi.fn();
    render(
      <CustomsCommandPalette
        isOpen={true}
        onClose={handleClose}
        actions={mockActions}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
