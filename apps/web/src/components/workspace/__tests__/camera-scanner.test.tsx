import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CameraScannerModal } from '../organisms/CameraScannerModal';

describe('CameraScannerModal', () => {
  it('renders camera fallback and attaches a sample label file on click', async () => {
    const user = userEvent.setup();
    const onCaptureFile = vi.fn<(file: File) => void>();
    const onClose = vi.fn<() => void>();

    render(<CameraScannerModal open onClose={onClose} onCaptureFile={onCaptureFile} />);

    expect(screen.getByText(/Escáner de etiquetas y facturas/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Inversor Solar 5kW/i }));

    expect(onCaptureFile).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
