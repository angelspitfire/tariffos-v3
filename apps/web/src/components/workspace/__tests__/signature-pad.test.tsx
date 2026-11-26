import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignatureQuickModal } from '../organisms/SignatureQuickModal';

describe('SignatureQuickModal with BrokerSignaturePad', () => {
  it('renders signature canvas, upload button, and exports with fallback SVG when not drawn', async () => {
    const user = userEvent.setup();
    const onSaveAndExport = vi.fn<(payload: { fullName: string; brokerLicense: string; signatureDataUrl: string }) => void>();

    render(
      <SignatureQuickModal
        open
        defaultName="María González"
        defaultLicense="SENIAT-AA-1042"
        onClose={vi.fn<() => void>()}
        onSaveAndExport={onSaveAndExport}
      />,
    );

    expect(screen.getByLabelText(/Área de firma manuscrita/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Subir imagen/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Guardar firma y exportar PDF/i }));
    expect(onSaveAndExport).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'María González',
        brokerLicense: 'SENIAT-AA-1042',
      }),
    );
  });
});
