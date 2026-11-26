import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingLeadCaptureSection } from './LandingLeadCaptureSection';

describe('LandingLeadCaptureSection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('blocks submission and shows inline field validation errors when required fields are missing or invalid', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    render(<LandingLeadCaptureSection />);

    await user.click(screen.getByRole('checkbox', { name: /Demo con tu factura/i }));
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'no-es-correo');
    await user.type(screen.getByLabelText(/Teléfono \/ WhatsApp/i), '123');
    await user.click(screen.getByRole('button', { name: /Solicitar contacto/i }));

    expect(screen.getByText(/Selecciona al menos una opción/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingresa tu nombre completo/i)).toBeInTheDocument();
    expect(screen.getByText(/Indica el nombre de tu agencia o empresa/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingresa un correo electrónico válido/i)).toBeInTheDocument();
    expect(screen.getByText(/7 a 15 dígitos/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits valid lead inquiry with selected intent to POST /api/leads and renders confirmation', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(JSON.stringify({ lead: { id: 'lead-1', status: 'PENDING' } }), { status: 201 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<LandingLeadCaptureSection />);

    await user.click(screen.getByRole('checkbox', { name: /Plan Enterprise a medida/i }));
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
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/leads',
      expect.objectContaining({
        body: expect.stringContaining('[Plan Enterprise]'),
      }),
    );
  });

  it('shows server error message when submission fails on backend', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);

    render(<LandingLeadCaptureSection />);

    await user.type(screen.getByLabelText(/Nombre completo/i), 'María Pérez');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Aduanas Sur');
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'test@agency.ve');
    await user.click(screen.getByRole('button', { name: /Solicitar contacto/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email/i)).toBeInTheDocument();
    });
  });

  it('shows friendly network error if fetch rejects', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error('Network down'));
    vi.stubGlobal('fetch', fetchMock);

    render(<LandingLeadCaptureSection />);

    await user.type(screen.getByLabelText(/Nombre completo/i), 'María Pérez');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Aduanas Sur');
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'test@agency.ve');
    await user.click(screen.getByRole('button', { name: /Solicitar contacto/i }));

    await waitFor(() => {
      expect(screen.getByText(/No pudimos conectar con el servidor/i)).toBeInTheDocument();
    });
  });
});
