import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingLeadCaptureSection } from './LandingLeadCaptureSection';

describe('LandingLeadCaptureSection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('submits lead inquiry to POST /api/leads and renders confirmation', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(JSON.stringify({ lead: { id: 'lead-1', status: 'PENDING' } }), { status: 201 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<LandingLeadCaptureSection />);

    await user.type(screen.getByLabelText(/Nombre completo/i), 'Carlos Mendoza');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Aduanas del Caribe');
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'carlos@caribe.ve');
    await user.type(screen.getByLabelText(/Teléfono \/ WhatsApp/i), '+58 412 555 0100');
    await user.click(screen.getByRole('button', { name: /Solicitar contacto/i }));

    await waitFor(() => {
      expect(screen.getByText(/Solicitud recibida/i)).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/leads',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"source":"landing_contact_form"'),
      }),
    );
  });

  it('shows validation/server error message when submission fails', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);

    render(<LandingLeadCaptureSection />);

    await user.type(screen.getByLabelText(/Correo electrónico/i), 'test@agency.ve');
    await user.click(screen.getByRole('button', { name: /Solicitar contacto/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email/i)).toBeInTheDocument();
    });
  });
});
