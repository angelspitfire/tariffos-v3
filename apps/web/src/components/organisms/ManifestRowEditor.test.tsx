import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ManifestRowEditor } from './ManifestRowEditor';
import type { ManifestLineItem } from '@/types/domain';

const mockItem: ManifestLineItem = {
  id: 'item-1',
  itemNumber: 1,
  hsCode: '8471.30.00.00',
  description: 'Portátiles laptop Intel i7',
  quantity: 50,
  unit: 'U',
  fobValue: 25000,
  cifValue: 27500,
  dutyRate: 5,
  vatRate: 15,
  confidence: 0.95,
  permits: [],
};

describe('ManifestRowEditor', () => {
  it('renders input fields with item initial values', () => {
    render(
      <ManifestRowEditor
        item={mockItem}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('8471.30.00.00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Portátiles laptop Intel i7')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    expect(screen.getByDisplayValue('27500')).toBeInTheDocument();
  });

  it('calls onSave with updated values when saved', () => {
    const handleSave = vi.fn();
    render(
      <ManifestRowEditor
        item={mockItem}
        onSave={handleSave}
        onCancel={vi.fn()}
      />
    );

    const descInput = screen.getByDisplayValue('Portátiles laptop Intel i7');
    fireEvent.change(descInput, { target: { value: 'Laptops reacondicionadas' } });

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSave).toHaveBeenCalledWith({
      description: 'Laptops reacondicionadas',
      hsCode: '8471.30.00.00',
      quantity: 50,
      cifValue: 27500,
      dutyRate: 5,
      vatRate: 15,
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <ManifestRowEditor
        item={mockItem}
        onSave={vi.fn()}
        onCancel={handleCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
