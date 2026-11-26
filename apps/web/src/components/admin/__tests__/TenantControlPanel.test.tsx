import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TenantControlPanel } from '../organisms/TenantControlPanel';

describe('TenantControlPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders tenant details and executes deactivation with mandatory reason', async () => {
    const user = userEvent.setup();
    const tenantPayload = {
      id: 'ten-1',
      name: 'Agencia Maiquetía',
      taxId: 'J-123',
      ownerName: 'Roberto',
      ownerEmail: 'roberto@maiquetia.ve',
      countryCode: 'VE',
      planId: 'pro',
      planName: 'Pro',
      billingStatus: 'ACTIVE',
      billingLimit: 400,
      allowOverage: false,
      members: [{ userId: 'usr-1', email: 'roberto@maiquetia.ve', name: 'Roberto', role: 'OWNER' }],
      usageHistory: [{ month: 11, year: 2026, count: 120, inputTokens: 50000, outputTokens: 12000 }],
    };

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ tenant: tenantPayload }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ plans: [] }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ tenant: { ...tenantPayload, billingStatus: 'CANCELED' } }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ tenant: { ...tenantPayload, billingStatus: 'CANCELED' } }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ plans: [] }), { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    render(<TenantControlPanel tenantId="ten-1" />);

    await waitFor(() => {
      expect(screen.getByText('Agencia Maiquetía')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Dar de baja tenant/i }));
    await user.type(
      screen.getByPlaceholderText(/Falta de pago/i),
      'Cancelación solicitada por cliente',
    );
    await user.click(screen.getByRole('button', { name: /Confirmar baja/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/tenants/ten-1/deactivate',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
